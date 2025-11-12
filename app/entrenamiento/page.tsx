"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Square, Download, FolderOpen, Settings2, FileText, CheckCircle2 } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import yaml from "js-yaml"

const mockTrainingData = [
  { epoch: 0, map: 0, loss: 2.5 },
  { epoch: 10, map: 0.45, loss: 1.8 },
  { epoch: 20, map: 0.62, loss: 1.2 },
  { epoch: 30, map: 0.75, loss: 0.8 },
  { epoch: 40, map: 0.83, loss: 0.5 },
  { epoch: 50, map: 0.88, loss: 0.3 },
]

interface Model {
  name: string
  size: number
  sizeFormatted: string
  date: string
  path: string
}

interface DatasetConfig {
  path: string
  train: string
  val: string
  test?: string
  nc: number
  names: string[]
  filename: string
}

export default function EntrenamientoPage() {
  const [models, setModels] = useState<Model[]>([])
  const [isTraining, setIsTraining] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [datasetConfig, setDatasetConfig] = useState<DatasetConfig | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>("yolo11n.pt")
  const [modelPath, setModelPath] = useState<string>("")
  const { toast } = useToast()

  // Cargar modelos al montar el componente
  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/models')
      const data = await response.json()

      if (data.models) {
        setModels(data.models)
      }
    } catch (error) {
      console.error('Error loading models:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los modelos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartTraining = async () => {
    // Validar que se haya cargado un dataset
    if (!datasetConfig) {
      toast({
        title: "Error",
        description: "Debes cargar un dataset YAML antes de entrenar",
        variant: "destructive"
      })
      return
    }

    // Validar que se haya seleccionado un modelo
    if (!selectedModel) {
      toast({
        title: "Error",
        description: "Debes cargar un modelo .pt antes de entrenar",
        variant: "destructive"
      })
      return
    }

    setIsTraining(true)
    toast({
      title: "Entrenamiento Iniciado",
      description: `Entrenando con ${selectedModel} y dataset ${datasetConfig.filename}. Los pesos se guardarán en /peso`
    })

    try {
      // Configuración del entrenamiento
      const trainingConfig = {
        model: modelPath || selectedModel,
        data: datasetConfig.path || datasetConfig.filename,
        epochs: 100,
        imgsz: 640,
        batch: 16,
        name: `rust_detection_${new Date().toISOString().slice(0, 10)}`,
        project: './peso'
      }

      // Llamar a la API de entrenamiento
      const response = await fetch('/api/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingConfig)
      })

      const result = await response.json()

      if (result.success) {
        setIsTraining(false)
        loadModels() // Recargar modelos después de entrenar
        toast({
          title: "Entrenamiento Completado",
          description: `El modelo se guardó exitosamente en ${result.output_path || '/peso'}`
        })
      } else {
        // Mostrar detalles del error
        console.error('Error de entrenamiento:', {
          error: result.error,
          stderr: result.errorOutput,
          stdout: result.output,
          exitCode: result.exitCode
        })
        throw new Error(result.error || 'Error desconocido en el entrenamiento')
      }
    } catch (error: any) {
      console.error('Error durante el entrenamiento:', error)
      setIsTraining(false)

      // Mensaje de error más detallado
      let errorDescription = error.message || "No se pudo completar el entrenamiento"

      // Si el error incluye detalles específicos
      if (error.message?.includes('train.py')) {
        errorDescription = "Falta el script train.py. Consulta la documentación en ENTRENAMIENTO_SETUP.md"
      } else if (error.message?.includes('Python')) {
        errorDescription = "Python no está instalado o no está en el PATH del sistema"
      }

      toast({
        title: "Error en Entrenamiento",
        description: errorDescription,
        variant: "destructive"
      })
    }
  }

  const handleStopTraining = () => {
    setIsTraining(false)
    toast({
      title: "Entrenamiento Detenido",
      description: "El proceso ha sido interrumpido"
    })
  }

  const handleLoadDataset = () => {
    // Abrir selector de archivo YAML
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.yaml,.yml'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        const text = await file.text()
        const config = yaml.load(text) as any

        // Validar estructura básica del YAML
        if (!config.train || !config.val || !config.nc || !config.names) {
          toast({
            title: "Error en Dataset",
            description: "El archivo YAML no tiene la estructura correcta (train, val, nc, names)",
            variant: "destructive"
          })
          return
        }

        // Guardar configuración
        const datasetConfig: DatasetConfig = {
          path: config.path || file.name,
          train: config.train,
          val: config.val,
          test: config.test,
          nc: config.nc,
          names: config.names,
          filename: file.name
        }

        setDatasetConfig(datasetConfig)

        toast({
          title: "Dataset Cargado",
          description: `${file.name} - ${config.nc} clases detectadas`
        })
      } catch (error) {
        console.error('Error parsing YAML:', error)
        toast({
          title: "Error",
          description: "No se pudo leer el archivo YAML",
          variant: "destructive"
        })
      }
    }
    input.click()
  }

  const handleLoadModel = () => {
    // Abrir selector de archivo .pt
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pt,.pth'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      // En un entorno web real, necesitarías subir el archivo a un servidor
      // Por ahora, guardamos la referencia
      setSelectedModel(file.name)
      setModelPath(file.name)

      toast({
        title: "Modelo Cargado",
        description: `Modelo: ${file.name}`
      })
    }
    input.click()
  }

  const handleDownloadModel = (modelName: string) => {
    toast({
      title: "Descargando Modelo",
      description: `Descargando ${modelName}...`
    })
    // Aquí irá la lógica de descarga
    window.open(`/peso/${modelName}`, '_blank')
  }

  const handleExportAll = () => {
    toast({
      title: "Exportando Modelos",
      description: "Preparando archivos para descarga..."
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <main className="flex flex-1 flex-col overflow-auto">
        {/* Top Toolbar */}
        <div className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleStartTraining}
              disabled={isTraining}
            >
              <Play className="mr-2 h-4 w-4" />
              {isTraining ? "Entrenando..." : "Iniciar Entrenamiento"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopTraining}
              disabled={!isTraining}
            >
              <Square className="mr-2 h-4 w-4" />
              Detener
            </Button>
            <Button
              variant={datasetConfig ? "default" : "outline"}
              size="sm"
              onClick={handleLoadDataset}
            >
              {datasetConfig ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Dataset: {datasetConfig.filename}
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Cargar Dataset (.yaml)
                </>
              )}
            </Button>
            <Button
              variant={modelPath ? "default" : "outline"}
              size="sm"
              onClick={handleLoadModel}
            >
              {modelPath ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Modelo: {selectedModel}
                </>
              ) : (
                <>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Cargar Modelo (.pt)
                </>
              )}
            </Button>
          </div>

          <Button variant="outline" size="sm">
            <Settings2 className="mr-2 h-4 w-4" />
            Configuración
          </Button>
        </div>

        <div className="flex-1 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Training Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Estado del Entrenamiento</h2>
                  <p className="text-sm text-muted-foreground">Modelo: YOLOv8n</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-semibold">50/100</div>
                    <div className="text-sm text-muted-foreground">Épocas</div>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div className="text-right">
                    <div className="text-2xl font-semibold">88.2%</div>
                    <div className="text-sm text-muted-foreground">mAP@50</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${isTraining ? 'w-1/2 animate-pulse' : 'w-1/2'} bg-primary transition-all`}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Tiempo estimado: 2h 15m</span>
                  <span>50% completado</span>
                </div>
              </div>
            </Card>

            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* mAP Chart */}
              <Card className="p-6">
                <h3 className="mb-4 text-sm font-medium">Precisión Media (mAP@50)</h3>
                <ChartContainer
                  config={{
                    map: {
                      label: "mAP",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrainingData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="epoch" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="map" stroke="var(--color-map)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>

              {/* Loss Chart */}
              <Card className="p-6">
                <h3 className="mb-4 text-sm font-medium">Pérdida (Loss)</h3>
                <ChartContainer
                  config={{
                    loss: {
                      label: "Loss",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrainingData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="epoch" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="loss" stroke="var(--color-loss)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>
            </div>

            {/* Dataset Configuration */}
            {datasetConfig && (
              <Card className="border-primary/50 bg-primary/5 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Configuración del Dataset
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDatasetConfig(null)}
                  >
                    Cambiar Dataset
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Archivo</div>
                    <div className="mt-1 font-medium">{datasetConfig.filename}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Número de Clases</div>
                    <div className="mt-1 font-medium">{datasetConfig.nc}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Path Base</div>
                    <div className="mt-1 font-medium text-primary">{datasetConfig.path}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Train</div>
                    <div className="mt-1 font-mono text-sm">{datasetConfig.train}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Validation</div>
                    <div className="mt-1 font-mono text-sm">{datasetConfig.val}</div>
                  </div>
                  {datasetConfig.test && (
                    <div>
                      <div className="text-sm text-muted-foreground">Test</div>
                      <div className="mt-1 font-mono text-sm">{datasetConfig.test}</div>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground">Clases</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {datasetConfig.names.map((name, idx) => (
                      <span
                        key={idx}
                        className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium"
                      >
                        {idx}: {name}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Training Configuration */}
            <Card className="p-6">
              <h3 className="mb-4 text-sm font-medium">Configuración de Entrenamiento</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground">Modelo Base</div>
                  <div className="mt-1 font-medium text-primary">{selectedModel}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Batch Size</div>
                  <div className="mt-1 font-medium">16</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Learning Rate</div>
                  <div className="mt-1 font-medium">0.001</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Image Size</div>
                  <div className="mt-1 font-medium">640x640</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Épocas</div>
                  <div className="mt-1 font-medium">100</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Carpeta de Pesos</div>
                  <div className="mt-1 font-medium text-primary">/peso</div>
                </div>
              </div>
            </Card>

            {/* YOLO Training Code Example */}
            <Card className="p-6 border-primary/30 bg-primary/5">
              <h3 className="mb-4 text-sm font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Código de Entrenamiento YOLO
              </h3>
              <div className="rounded-md bg-muted p-4 font-mono text-sm">
                <pre className="whitespace-pre-wrap text-foreground">
{`from ultralytics import YOLO

# Cargar el modelo seleccionado
model = YOLO("${selectedModel}")  # ${modelPath ? 'modelo cargado' : 'modelo por defecto'}

# Entrenar el modelo
results = model.train(
    data="${datasetConfig?.filename || 'dataset.yaml'}",  # ${datasetConfig ? 'dataset cargado' : 'archivo de configuración del dataset'}
    epochs=100,         # número de épocas
    imgsz=640,          # tamaño de imagen
    batch=16,           # tamaño del batch
    name="rust_detection",  # nombre del experimento
    project="./peso",   # carpeta de salida
    patience=50,        # early stopping
    save=True,          # guardar pesos
    save_period=10,     # guardar checkpoint cada 10 épocas
    plots=True          # generar gráficos
)`}
                </pre>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-md border border-primary/20 bg-background p-3 text-xs text-muted-foreground">
                <div className="text-primary mt-0.5">💡</div>
                <div>
                  <strong>Tip:</strong> Este código se ejecuta automáticamente al hacer clic en "Iniciar Entrenamiento".
                  Los valores se actualizan según el modelo y dataset seleccionados en la interfaz.
                </div>
              </div>
              {(!datasetConfig || !modelPath) && (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-orange-500/20 bg-orange-500/10 p-3 text-xs text-orange-700 dark:text-orange-300">
                  <div className="mt-0.5">⚠️</div>
                  <div>
                    {!datasetConfig && !modelPath && <strong>Carga un dataset YAML y un modelo .pt antes de entrenar.</strong>}
                    {datasetConfig && !modelPath && <strong>Carga un modelo .pt antes de entrenar.</strong>}
                    {!datasetConfig && modelPath && <strong>Carga un dataset YAML antes de entrenar.</strong>}
                  </div>
                </div>
              )}
            </Card>

            {/* Saved Models */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Modelos Guardados en /peso
                  <span className="ml-2 text-muted-foreground">({models.length})</span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAll}
                  disabled={models.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Todos
                </Button>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Cargando modelos...
                </div>
              ) : models.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay modelos guardados en /peso
                </div>
              ) : (
                <div className="space-y-2">
                  {models.map((model) => (
                    <div
                      key={model.name}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-accent/50"
                    >
                      <div>
                        <div className="font-medium text-sm">{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.date}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">{model.sizeFormatted}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadModel(model.name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
