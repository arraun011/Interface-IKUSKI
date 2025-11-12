"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, Play, Filter, ImageIcon, Folder, FolderOpen, CheckCircle2, X, Copy } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { ImageGallery } from "@/components/image-gallery"
import { AdvancedImageViewer, BoundingBox } from "@/components/advanced-image-viewer"
import { useModelConfig, usePaths } from "@/contexts/config-context"
import { useAnalysisState, ImageItem, Detection } from "@/contexts/analysis-context"
import { detectDuplicates, DuplicateGroup } from "@/lib/phash-utils"
import Image from "next/image"

interface Model {
  name: string
  size: number
  sizeFormatted: string
  date: string
  path: string
}

export default function AnalisisPage() {
  // Estados del contexto persistente
  const {
    state: {
      loadedImages,
      selectedImageId,
      detections,
      selectedModel,
      modelPath,
      confidenceThreshold,
      iouThreshold,
      severityFilter,
      markedForReport
    },
    addImages,
    removeImage,
    setSelectedImage: setSelectedImageId,
    setDetections,
    setModel,
    setThresholds,
    setSeverityFilter,
    toggleMarkForReport
  } = useAnalysisState()

  // Estados locales (UI temporal)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentBoundingBoxes, setCurrentBoundingBoxes] = useState<BoundingBox[]>([])
  const [availableModels, setAvailableModels] = useState<Model[]>([])
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showThresholdPanel, setShowThresholdPanel] = useState(false)
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([])
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [isDetectingDuplicates, setIsDetectingDuplicates] = useState(false)

  const { toast } = useToast()
  const modelConfig = useModelConfig()
  const paths = usePaths()

  // Obtener imagen seleccionada del contexto
  const selectedImage = loadedImages.find(img => img.id === selectedImageId) || null

  // Actualizar bounding boxes cuando cambie el filtro
  useEffect(() => {
    if (selectedImage) {
      const imageDetections = detections.filter(d =>
        d.image === selectedImage.url && severityFilter.includes(d.severity)
      )
      const boxes: BoundingBox[] = imageDetections.map(d => ({
        x: d.bbox.x,
        y: d.bbox.y,
        w: d.bbox.w,
        h: d.bbox.h,
        label: "Corrosión",
        confidence: d.confidence,
        severity: d.severity as "alto" | "medio" | "bajo"
      }))
      setCurrentBoundingBoxes(boxes)
    }
  }, [severityFilter, detections, selectedImage?.url])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "alto":
        return "bg-severity-high"
      case "medio":
        return "bg-severity-medium"
      case "bajo":
        return "bg-severity-low"
      default:
        return "bg-muted"
    }
  }

  // Cargar imágenes individuales
  const handleLoadImages = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*'
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files) as File[]
      const newImages: ImageItem[] = []

      for (const file of files) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const sizeInKB = (file.size / 1024).toFixed(2)
          newImages.push({
            id,
            url: event.target?.result as string,
            filename: file.name,
            size: `${sizeInKB} KB`,
            timestamp: new Date().toLocaleString('es-ES', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          })

          if (newImages.length === files.length) {
            addImages(newImages)
            toast({
              title: "Imágenes Cargadas",
              description: `${files.length} imágenes cargadas correctamente`
            })
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  // Cargar carpeta completa
  const handleLoadFolder = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true
    input.multiple = true
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files) as File[]
      // Filtrar solo imágenes
      const imageFiles = files.filter(file =>
        file.type.startsWith('image/') ||
        /\.(jpg|jpeg|png|gif|bmp|webp|tiff)$/i.test(file.name)
      )

      const newImages: ImageItem[] = []

      for (const file of imageFiles) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const sizeInKB = (file.size / 1024).toFixed(2)
          newImages.push({
            id,
            url: event.target?.result as string,
            filename: file.name,
            size: `${sizeInKB} KB`,
            timestamp: new Date().toLocaleString('es-ES', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          })

          if (newImages.length === imageFiles.length) {
            addImages(newImages)
            toast({
              title: "Carpeta Cargada",
              description: `${imageFiles.length} imágenes encontradas en la carpeta`
            })
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  // Cargar modelos disponibles
  const loadAvailableModels = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()
      if (data.models) {
        setAvailableModels(data.models)
      }
    } catch (error) {
      console.error('Error loading models:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los modelos disponibles",
        variant: "destructive"
      })
    }
  }

  // Abrir selector de modelos
  const handleLoadModel = async () => {
    await loadAvailableModels()
    setShowModelSelector(true)
  }

  // Seleccionar modelo de la lista
  const handleSelectModel = (model: Model) => {
    setModel(model.name, model.path)
    setShowModelSelector(false)

    toast({
      title: "Modelo Seleccionado",
      description: `Análisis usará: ${model.name}`
    })
  }

  // Detectar imágenes duplicadas
  const handleDetectDuplicates = async () => {
    if (loadedImages.length < 2) {
      toast({
        title: "Insuficientes Imágenes",
        description: "Necesitas al menos 2 imágenes para detectar duplicados",
        variant: "destructive"
      })
      return
    }

    setIsDetectingDuplicates(true)
    toast({
      title: "Detectando Duplicados",
      description: `Analizando ${loadedImages.length} imágenes con pHash...`
    })

    try {
      const groups = await detectDuplicates(loadedImages, 5) // threshold de 5 bits

      setDuplicateGroups(groups)
      setShowDuplicates(true)

      const totalDuplicates = groups.reduce((sum, g) => sum + g.images.length - 1, 0)

      toast({
        title: "Detección Completada",
        description: groups.length > 0
          ? `${groups.length} grupos de duplicados encontrados (${totalDuplicates} imágenes duplicadas)`
          : "No se encontraron imágenes duplicadas"
      })
    } catch (error) {
      console.error('Error detecting duplicates:', error)
      toast({
        title: "Error",
        description: "Error al detectar duplicados",
        variant: "destructive"
      })
    } finally {
      setIsDetectingDuplicates(false)
    }
  }

  // Eliminar duplicados de un grupo (mantener solo la primera)
  const handleRemoveDuplicatesFromGroup = (group: DuplicateGroup) => {
    // Eliminar todas menos la primera imagen del grupo
    const toRemove = group.images.slice(1)
    toRemove.forEach(img => removeImage(img.id))

    // Actualizar grupos de duplicados
    const updatedGroups = duplicateGroups.filter(g => g.hash !== group.hash)
    setDuplicateGroups(updatedGroups)

    toast({
      title: "Duplicados Eliminados",
      description: `${toRemove.length} imágenes duplicadas eliminadas`
    })
  }

  // Iniciar análisis
  const handleAnalyze = async () => {
    if (loadedImages.length === 0) {
      toast({
        title: "Sin Imágenes",
        description: "Carga imágenes antes de analizar",
        variant: "destructive"
      })
      return
    }

    // Validar que se haya seleccionado un modelo
    if (!modelPath) {
      toast({
        title: "Error",
        description: "Debes cargar un modelo .pt antes de analizar",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    toast({
      title: "Análisis Iniciado",
      description: `Analizando ${loadedImages.length} imágenes con ${selectedModel}...`
    })

    try {
      // Preparar configuración del análisis
      const analysisConfig = {
        model: modelPath,
        images: loadedImages.map(img => ({
          url: img.url,
          filename: img.filename
        })),
        confidence: confidenceThreshold,
        iou: iouThreshold,
        imgsz: parseInt(modelConfig.imageSize)
      }

      // Llamar a la API de análisis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisConfig)
      })

      const result = await response.json()

      if (result.success && result.detections) {
        // Convertir detecciones del formato de Python al formato de la UI
        const newDetections: Detection[] = result.detections.map((det: any, idx: number) => {
          // Encontrar la imagen correspondiente
          const matchingImage = loadedImages.find(img => img.filename === det.filename)

          return {
            id: idx + 1,
            image: matchingImage?.url || '',
            filename: det.filename,
            severity: det.severity,
            confidence: det.confidence,
            bbox: {
              x: det.bbox.x,
              y: det.bbox.y,
              w: det.bbox.w,
              h: det.bbox.h
            },
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
          }
        })

        setDetections(newDetections)
        setIsAnalyzing(false)

        // Si hay una imagen seleccionada, actualizar sus bounding boxes
        if (selectedImage) {
          updateBoundingBoxes(selectedImage.url)
        }

        toast({
          title: "Análisis Completado",
          description: `${newDetections.length} detecciones encontradas en ${loadedImages.length} imágenes`
        })
      } else {
        throw new Error(result.error || 'Error desconocido en el análisis')
      }
    } catch (error: any) {
      console.error('Error durante el análisis:', error)
      setIsAnalyzing(false)
      toast({
        title: "Error en Análisis",
        description: error.message || "No se pudo completar el análisis",
        variant: "destructive"
      })
    }
  }

  // Actualizar bounding boxes para la imagen actual
  const updateBoundingBoxes = (imageUrl: string) => {
    const imageDetections = detections.filter(d =>
      d.image === imageUrl && severityFilter.includes(d.severity)
    )
    const boxes: BoundingBox[] = imageDetections.map(d => ({
      x: d.bbox.x,
      y: d.bbox.y,
      w: d.bbox.w,
      h: d.bbox.h,
      label: "Corrosión",
      confidence: d.confidence,
      severity: d.severity as "alto" | "medio" | "bajo"
    }))
    setCurrentBoundingBoxes(boxes)
  }

  // Obtener detecciones filtradas
  const getFilteredDetections = () => {
    return detections.filter(d => severityFilter.includes(d.severity))
  }

  // Toggle de filtro de severidad
  const toggleSeverityFilter = (severity: string) => {
    if (severityFilter.includes(severity)) {
      setSeverityFilter(severityFilter.filter(s => s !== severity))
    } else {
      setSeverityFilter([...severityFilter, severity])
    }
  }

  // Manejar selección de imagen
  const handleSelectImage = (image: ImageItem) => {
    setSelectedImageId(image.id)
    updateBoundingBoxes(image.url)
  }

  // Manejar eliminación de imagen
  const handleRemoveImage = (imageId: string) => {
    removeImage(imageId)
    if (selectedImageId === imageId) {
      setCurrentBoundingBoxes([])
    }
  }

  // Exportar resultados
  const handleExport = () => {
    if (detections.length === 0) {
      toast({
        title: "Sin Resultados",
        description: "No hay detecciones para exportar",
        variant: "destructive"
      })
      return
    }

    // Crear CSV con resultados
    const csvContent = [
      ['Archivo', 'Severidad', 'Confianza', 'BBox_X', 'BBox_Y', 'BBox_W', 'BBox_H', 'Timestamp'].join(','),
      ...detections.map(d =>
        [d.filename, d.severity, d.confidence.toFixed(3), d.bbox.x, d.bbox.y, d.bbox.w, d.bbox.h, d.timestamp].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `detecciones_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()

    toast({
      title: "Exportado",
      description: "Resultados exportados a CSV"
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLoadImages}>
              <Upload className="mr-2 h-4 w-4" />
              Cargar Imágenes
            </Button>
            <Button variant="outline" size="sm" onClick={handleLoadFolder}>
              <Folder className="mr-2 h-4 w-4" />
              Cargar Carpeta
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
            <Button
              variant="default"
              size="sm"
              onClick={handleAnalyze}
              disabled={loadedImages.length === 0 || isAnalyzing}
            >
              <Play className="mr-2 h-4 w-4" />
              {isAnalyzing ? "Analizando..." : "Analizar"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={detections.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Resultados
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDetectDuplicates}
              disabled={loadedImages.length < 2 || isDetectingDuplicates}
            >
              <Copy className="mr-2 h-4 w-4" />
              {isDetectingDuplicates ? "Detectando..." : "Detectar Duplicados"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showThresholdPanel ? "default" : "outline"}
              size="sm"
              onClick={() => setShowThresholdPanel(!showThresholdPanel)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Umbrales y Filtros
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Viewer Area */}
          <div className="flex flex-1 flex-col">
            {/* Advanced Image Viewer with Zoom, Pan, and Bounding Boxes */}
            <div className="flex-1 overflow-hidden">
              <AdvancedImageViewer
                imageUrl={selectedImage?.url || null}
                imageName={selectedImage?.filename}
                boundingBoxes={currentBoundingBoxes}
                showBoundingBoxes={detections.length > 0}
              />
            </div>

            {/* Detection Info Bar */}
            <div className="border-t border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs text-muted-foreground">Imágenes Cargadas</div>
                    <div className="text-lg font-semibold">{loadedImages.length}</div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <div className="text-xs text-muted-foreground">Detecciones {severityFilter.length < 3 && "(Filtradas)"}</div>
                    <div className="text-lg font-semibold">{getFilteredDetections().length}</div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <div className="text-xs text-muted-foreground">Confianza Media</div>
                    <div className="text-lg font-semibold">
                      {getFilteredDetections().length > 0
                        ? `${(getFilteredDetections().reduce((sum, d) => sum + d.confidence, 0) / getFilteredDetections().length * 100).toFixed(1)}%`
                        : "0%"}
                    </div>
                  </div>
                  {detections.length > 0 && (
                    <>
                      <div className="h-8 w-px bg-border" />
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-severity-high" />
                          <span className="text-sm">{detections.filter(d => d.severity === "alto").length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-severity-medium" />
                          <span className="text-sm">{detections.filter(d => d.severity === "medio").length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-severity-low" />
                          <span className="text-sm">{detections.filter(d => d.severity === "bajo").length}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Modelo: {detections.length > 0 && selectedModel ? selectedModel : (selectedModel || "-")}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Image Gallery */}
          <div className="w-96 border-l border-border bg-card">
            <ImageGallery
              images={loadedImages}
              selectedImageId={selectedImageId || undefined}
              onSelectImage={handleSelectImage}
              onRemoveImage={handleRemoveImage}
              showMetadata={true}
              markedForReport={markedForReport}
              onToggleMarkForReport={toggleMarkForReport}
              showReportMarkers={loadedImages.length > 0}
            />
          </div>
        </div>
      </main>

      {/* Panel de Umbrales y Filtros */}
      {showThresholdPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowThresholdPanel(false)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Configuración de Análisis</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowThresholdPanel(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Umbral de Confianza */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Umbral de Confianza</label>
                  <span className="text-sm text-muted-foreground">{(confidenceThreshold * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[confidenceThreshold * 100]}
                  onValueChange={(value) => setThresholds(value[0] / 100, undefined)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo nivel de confianza para considerar una detección válida
                </p>
              </div>

              {/* Umbral IoU */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Umbral IoU (NMS)</label>
                  <span className="text-sm text-muted-foreground">{(iouThreshold * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[iouThreshold * 100]}
                  onValueChange={(value) => setThresholds(undefined, value[0] / 100)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Umbral de superposición para Non-Maximum Suppression
                </p>
              </div>

              {/* Filtros de Severidad */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Filtrar por Severidad</label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={severityFilter.includes("alto") ? "default" : "outline"}
                    className={`cursor-pointer ${severityFilter.includes("alto") ? "bg-severity-high hover:bg-severity-high/80" : ""}`}
                    onClick={() => toggleSeverityFilter("alto")}
                  >
                    Alto
                  </Badge>
                  <Badge
                    variant={severityFilter.includes("medio") ? "default" : "outline"}
                    className={`cursor-pointer ${severityFilter.includes("medio") ? "bg-severity-medium hover:bg-severity-medium/80" : ""}`}
                    onClick={() => toggleSeverityFilter("medio")}
                  >
                    Medio
                  </Badge>
                  <Badge
                    variant={severityFilter.includes("bajo") ? "default" : "outline"}
                    className={`cursor-pointer ${severityFilter.includes("bajo") ? "bg-severity-low hover:bg-severity-low/80" : ""}`}
                    onClick={() => toggleSeverityFilter("bajo")}
                  >
                    Bajo
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecciona los niveles de severidad a mostrar en los resultados
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setThresholds(0.25, 0.45)
                    setSeverityFilter(["alto", "medio", "bajo"])
                  }}
                >
                  Restablecer
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowThresholdPanel(false)}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Selector de Modelos */}
      {showModelSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModelSelector(false)}>
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Seleccionar Modelo para Análisis</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModelSelector(false)}>
                  ✕
                </Button>
              </div>

              {availableModels.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <p>No hay modelos disponibles en /peso</p>
                  <p className="mt-2">Entrena un modelo primero o coloca archivos .pt en la carpeta /peso</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableModels.map((model) => (
                    <div
                      key={model.name}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleSelectModel(model)}
                    >
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {model.date} • {model.sizeFormatted}
                        </div>
                      </div>
                      {selectedModel === model.name && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Duplicados */}
      {showDuplicates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDuplicates(false)}>
          <Card className="w-full max-w-4xl max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Imágenes Duplicadas Detectadas</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Usando pHash (Perceptual Hash) - {duplicateGroups.length} grupos encontrados
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowDuplicates(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {duplicateGroups.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <Copy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-base font-medium">No se encontraron duplicados</p>
                  <p className="mt-2">Todas las imágenes son únicas</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {duplicateGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="border border-border rounded-lg p-4 bg-card/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Grupo {groupIndex + 1}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {group.images.length} imágenes similares
                          </span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveDuplicatesFromGroup(group)}
                        >
                          Eliminar Duplicados ({group.images.length - 1})
                        </Button>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        {group.images.map((img, imgIndex) => (
                          <div
                            key={img.id}
                            className={`relative rounded-lg overflow-hidden border-2 ${
                              imgIndex === 0 ? 'border-primary' : 'border-border'
                            }`}
                          >
                            <Image
                              src={img.url}
                              alt={img.filename}
                              width={200}
                              height={150}
                              className="w-full h-32 object-cover"
                            />
                            {imgIndex === 0 && (
                              <Badge className="absolute top-2 left-2 bg-primary text-xs">
                                Original
                              </Badge>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                              <p className="text-xs text-white truncate">{img.filename}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Las imágenes marcadas como "Original" se mantendrán, las demás serán eliminadas
                  </p>
                  <Button variant="outline" onClick={() => setShowDuplicates(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
