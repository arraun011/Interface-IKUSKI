"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Key, FolderOpen, Palette, Save, RotateCcw } from "lucide-react"
import { useState } from "react"
import { useConfig } from "@/contexts/config-context"
import { useToast } from "@/hooks/use-toast"

export default function ConfiguracionPage() {
  const { config, updateConfig, resetConfig } = useConfig()
  const { toast } = useToast()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    toast({
      title: "Configuración Guardada",
      description: "Los cambios se han aplicado correctamente"
    })
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm("¿Estás seguro de que quieres restablecer toda la configuración a los valores predeterminados?")) {
      resetConfig()
      toast({
        title: "Configuración Restablecida",
        description: "Se han restaurado los valores predeterminados"
      })
    }
  }

  const handlePathChange = (type: "datasets" | "models" | "reports") => {
    // En un entorno de producción, esto abriría un diálogo de selección de carpeta
    const newPath = prompt(`Introduce la nueva ruta para ${type}:`, config.paths[type])
    if (newPath) {
      updateConfig({
        paths: {
          ...config.paths,
          [type]: newPath
        }
      })
      toast({
        title: "Ruta Actualizada",
        description: `Ruta de ${type} actualizada correctamente`
      })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 overflow-auto">
        <div className="flex h-16 items-center justify-between border-b border-border px-8">
          <div>
            <h1 className="text-xl font-semibold">Configuración</h1>
            <p className="text-sm text-muted-foreground">Ajusta los parámetros del sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restablecer
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              {saved ? "Guardado ✓" : "Guardar Cambios"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 p-8">
          <div className="col-span-2 space-y-6">
            {/* Model Configuration */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Brain className="h-5 w-5 text-primary" />
                Configuración del Modelo
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model-select">Modelo YOLO Activo</Label>
                  <Select
                    value={config.model.activeModel}
                    onValueChange={(value) => updateConfig({
                      model: { ...config.model, activeModel: value as any }
                    })}
                  >
                    <SelectTrigger id="model-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yolov8n">YOLOv8n (Rápido)</SelectItem>
                      <SelectItem value="yolov8s">YOLOv8s (Balanceado)</SelectItem>
                      <SelectItem value="yolov8m">YOLOv8m (Preciso)</SelectItem>
                      <SelectItem value="yolov8l">YOLOv8l (Muy Preciso)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="confidence">Umbral de Confianza</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="confidence"
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.model.confidenceThreshold}
                        onChange={(e) => updateConfig({
                          model: { ...config.model, confidenceThreshold: parseFloat(e.target.value) }
                        })}
                      />
                      <span className="text-sm text-muted-foreground">
                        {Math.round(config.model.confidenceThreshold * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iou">Umbral IoU (NMS)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="iou"
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        value={config.model.iouThreshold}
                        onChange={(e) => updateConfig({
                          model: { ...config.model, iouThreshold: parseFloat(e.target.value) }
                        })}
                      />
                      <span className="text-sm text-muted-foreground">
                        {Math.round(config.model.iouThreshold * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="img-size">Tamaño de Imagen (px)</Label>
                  <Select
                    value={config.model.imageSize}
                    onValueChange={(value) => updateConfig({
                      model: { ...config.model, imageSize: value as any }
                    })}
                  >
                    <SelectTrigger id="img-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="320">320x320 (Rápido)</SelectItem>
                      <SelectItem value="640">640x640 (Recomendado)</SelectItem>
                      <SelectItem value="1280">1280x1280 (Alta calidad)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="phash"
                    checked={config.model.enablePHash}
                    onChange={(e) => updateConfig({
                      model: { ...config.model, enablePHash: e.target.checked }
                    })}
                  />
                  <Label htmlFor="phash" className="cursor-pointer">
                    Activar filtro pHash (eliminar duplicados)
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="clahe"
                    checked={config.model.enableCLAHE}
                    onChange={(e) => updateConfig({
                      model: { ...config.model, enableCLAHE: e.target.checked }
                    })}
                  />
                  <Label htmlFor="clahe" className="cursor-pointer">
                    Aplicar corrección CLAHE (mejorar contraste)
                  </Label>
                </div>
              </div>
            </Card>

            {/* API Keys */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Key className="h-5 w-5 text-accent" />
                Claves API
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key (GPT-4)</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={config.apiKeys.openai}
                    onChange={(e) => updateConfig({
                      apiKeys: { ...config.apiKeys, openai: e.target.value }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">Necesaria para generación de informes con IA</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="azure-key">Azure Computer Vision (Opcional)</Label>
                  <Input
                    id="azure-key"
                    type="password"
                    placeholder="Clave de Azure..."
                    value={config.apiKeys.azure}
                    onChange={(e) => updateConfig({
                      apiKeys: { ...config.apiKeys, azure: e.target.value }
                    })}
                  />
                </div>
              </div>
            </Card>

            {/* Paths Configuration */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <FolderOpen className="h-5 w-5 text-primary" />
                Rutas y Directorios
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataset-path">Ruta de Datasets</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dataset-path"
                      value={config.paths.datasets}
                      onChange={(e) => updateConfig({
                        paths: { ...config.paths, datasets: e.target.value }
                      })}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePathChange("datasets")}
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="models-path">Ruta de Modelos</Label>
                  <div className="flex gap-2">
                    <Input
                      id="models-path"
                      value={config.paths.models}
                      onChange={(e) => updateConfig({
                        paths: { ...config.paths, models: e.target.value }
                      })}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePathChange("models")}
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reports-path">Ruta de Informes</Label>
                  <div className="flex gap-2">
                    <Input
                      id="reports-path"
                      value={config.paths.reports}
                      onChange={(e) => updateConfig({
                        paths: { ...config.paths, reports: e.target.value }
                      })}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePathChange("reports")}
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Settings */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Palette className="h-5 w-5" />
                Apariencia
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={config.appearance.theme}
                    onValueChange={(value) => updateConfig({
                      appearance: { ...config.appearance, theme: value as any }
                    })}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={config.appearance.language}
                    onValueChange={(value) => updateConfig({
                      appearance: { ...config.appearance, language: value as any }
                    })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="eu">Euskera</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Clasificación de Severidad</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[var(--severity-low)]" />
                    <span className="text-sm font-medium">Bajo</span>
                  </div>
                  <span className="text-xs text-muted-foreground">0-30%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[var(--severity-medium)]" />
                    <span className="text-sm font-medium">Medio</span>
                  </div>
                  <span className="text-xs text-muted-foreground">30-70%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[var(--severity-high)]" />
                    <span className="text-sm font-medium">Alto</span>
                  </div>
                  <span className="text-xs text-muted-foreground">70-100%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Sistema</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Versión</span>
                  <span className="font-mono">v1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ONNX Runtime</span>
                  <span className="font-mono">1.16.3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">OpenCV</span>
                  <span className="font-mono">4.8.1</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
