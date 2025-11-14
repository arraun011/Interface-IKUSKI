"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Upload, Download, Play, Filter, ImageIcon, Folder, FolderOpen, CheckCircle2, X, Copy, Save, FileDown, FileUp, BookOpen, BookMarked, Search } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { ImageGallery } from "@/components/image-gallery"
import { AdvancedImageViewer, BoundingBox } from "@/components/advanced-image-viewer"
import { useModelConfig, usePaths } from "@/contexts/config-context"
import { useAnalysisState, ImageItem, Detection } from "@/contexts/analysis-context"
import { detectDuplicates, DuplicateGroup } from "@/lib/phash-utils"
import { SessionManager } from "@/components/session-manager"
import { saveAnalysisSession, loadAnalysisSession, exportSessionToFile, parseSessionFile, AnalysisSessionExport } from "@/lib/session-storage"
import { exportLibraryToJSON, importLibraryFromJSON, reconstructLibraryFromFiles, loadImagesFromLibrary } from "@/lib/library-storage"
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
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [sessionDialogMode, setSessionDialogMode] = useState<'save' | 'load'>('save')
  const [pendingSessionImport, setPendingSessionImport] = useState<AnalysisSessionExport | null>(null)
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [fileNamesInput, setFileNamesInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          // Intentar obtener ruta en diferentes formatos
          const filePath = (file as any).webkitRelativePath || (file as any).path || file.name
          newImages.push({
            id,
            url: event.target?.result as string,
            filename: file.name,
            filePath: filePath, // webkitRelativePath, path, o solo filename
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
          // webkitRelativePath incluye la ruta relativa desde la carpeta seleccionada
          const relativePath = (file as any).webkitRelativePath || file.name
          newImages.push({
            id,
            url: event.target?.result as string,
            filename: file.name,
            filePath: relativePath, // Guardar ruta relativa desde la carpeta
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
      ['Archivo', 'Nivel_Corrosion', 'Confianza', 'BBox_X', 'BBox_Y', 'BBox_W', 'BBox_H', 'Timestamp'].join(','),
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

  // Guardar sesión actual
  const handleSaveSession = (name: string) => {
    try {
      if (loadedImages.length === 0) {
        toast({
          title: "Sin Imágenes",
          description: "No hay imágenes cargadas para guardar",
          variant: "destructive"
        })
        return
      }

      saveAnalysisSession({
        name,
        images: loadedImages.map(img => ({
          id: img.id,
          filename: img.filename,
          url: img.url
        })),
        detections: detections.map(d => ({
          image: d.image,
          class_name: d.class_name,
          severity: d.severity,
          confidence: d.confidence,
          bbox: d.bbox
        })),
        modelPath: modelPath || '',
        confidenceThreshold,
        iouThreshold
      })

      toast({
        title: "Sesión Guardada",
        description: `La sesión "${name}" se ha guardado correctamente con ${loadedImages.length} imágenes`
      })
    } catch (error: any) {
      console.error('Error saving session:', error)
      toast({
        title: "Error al Guardar",
        description: error.message || "No se pudo guardar la sesión. Puede que las imágenes sean demasiado grandes.",
        variant: "destructive"
      })
    }
  }

  // Cargar sesión guardada
  const handleLoadSession = (id: string) => {
    try {
      const session = loadAnalysisSession(id)
      if (!session) {
        throw new Error('Sesión no encontrada')
      }

      // Restaurar imágenes (sin los archivos File originales)
      const restoredImages = session.images.map(img => ({
        ...img,
        file: undefined as any
      }))

      // Limpiar estado actual y cargar sesión
      addImages(restoredImages)
      setDetections(session.detections as Detection[])
      setModel(session.modelPath, session.modelPath.split('/').pop() || 'modelo')
      setThresholds(session.confidenceThreshold, session.iouThreshold)

      toast({
        title: "Sesión Cargada",
        description: `Se cargó la sesión "${session.name}" con ${session.images.length} imágenes`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la sesión",
        variant: "destructive"
      })
    }
  }

  // Exportar sesión a archivo JSON
  const handleExportSession = () => {
    if (loadedImages.length === 0) {
      toast({
        title: "Sin Imágenes",
        description: "No hay imágenes cargadas para exportar",
        variant: "destructive"
      })
      return
    }

    try {
      const sessionData = {
        id: Date.now().toString(),
        name: `Sesión_${new Date().toLocaleDateString('es-ES')}`,
        date: new Date().toISOString(),
        images: loadedImages,
        detections,
        modelPath: modelPath || '',
        confidenceThreshold,
        iouThreshold
      }

      exportSessionToFile(sessionData)

      toast({
        title: "Sesión Exportada",
        description: "Se descargó el archivo JSON con la configuración de la sesión"
      })
    } catch (error: any) {
      console.error('Error exporting session:', error)
      toast({
        title: "Error al Exportar",
        description: error.message || "No se pudo exportar la sesión",
        variant: "destructive"
      })
    }
  }

  // Importar archivo de sesión JSON
  const handleImportSessionFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const sessionData = parseSessionFile(content)

      setPendingSessionImport(sessionData)

      toast({
        title: "Archivo Cargado",
        description: `Ahora carga las ${sessionData.imageFilenames.length} imágenes: ${sessionData.imageFilenames.join(', ')}`
      })
    } catch (error: any) {
      toast({
        title: "Error al Importar",
        description: error.message,
        variant: "destructive"
      })
    }

    // Limpiar input
    if (event.target) event.target.value = ''
  }

  // Al cargar imágenes, si hay una sesión pendiente, aplicar las detecciones
  useEffect(() => {
    if (pendingSessionImport && loadedImages.length > 0) {
      // Verificar que las imágenes cargadas coincidan con los nombres esperados
      const loadedFilenames = loadedImages.map(img => img.filename)
      const expectedFilenames = pendingSessionImport.imageFilenames

      const allMatch = expectedFilenames.every(name => loadedFilenames.includes(name))

      if (allMatch) {
        // Restaurar detecciones
        const filenameToUrl = new Map<string, string>()
        loadedImages.forEach(img => {
          filenameToUrl.set(img.filename, img.url)
        })

        const restoredDetections: Detection[] = pendingSessionImport.detections.map(d => ({
          image: filenameToUrl.get(d.filename) || '',
          filename: d.filename,
          class_name: d.class_name,
          severity: d.severity,
          confidence: d.confidence,
          bbox: d.bbox,
          timestamp: new Date().toISOString()
        }))

        setDetections(restoredDetections)
        setModel(pendingSessionImport.modelPath, pendingSessionImport.modelPath.split('/').pop() || 'modelo')
        setThresholds(pendingSessionImport.confidenceThreshold, pendingSessionImport.iouThreshold)

        toast({
          title: "Sesión Restaurada",
          description: `Se restauraron ${restoredDetections.length} detecciones`
        })

        setPendingSessionImport(null)
      } else {
        const missing = expectedFilenames.filter(name => !loadedFilenames.includes(name))
        toast({
          title: "Imágenes Faltantes",
          description: `Faltan: ${missing.join(', ')}`,
          variant: "destructive"
        })
      }
    }
  }, [loadedImages, pendingSessionImport])

  // Exportar biblioteca a JSON (modo completo con base64)
  const handleExportLibrary = async () => {
    try {
      // Siempre exportar en modo 'full' con imágenes base64 incluidas
      await exportLibraryToJSON(loadedImages, markedForReport, 'full')
      toast({
        title: "Biblioteca Exportada (Completa)",
        description: `Se exportaron ${loadedImages.length} imágenes con datos completos en base64. El archivo puede ser grande pero es totalmente portable.`,
        duration: 8000
      })
    } catch (error: any) {
      toast({
        title: "Error al Exportar",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  // Importar biblioteca desde JSON
  const handleImportLibrary = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const libraryData = await importLibraryFromJSON(file)

        toast({
          title: "Biblioteca Cargada",
          description: `${libraryData.images.length} imágenes encontradas. Modo: ${libraryData.mode === 'full' ? 'Completo (con imágenes)' : 'Solo metadatos'}`,
          duration: 5000
        })

        // Cargar imágenes según el modo
        const { images: loadedImgs, markedIds, needsFileSelection } = await loadImagesFromLibrary(libraryData)

        if (!needsFileSelection) {
          // Modo 'full': cargar imágenes directamente desde base64
          addImages(loadedImgs)

          // Restaurar marcas
          markedIds.forEach(id => {
            if (!markedForReport.includes(id)) {
              toggleMarkForReport(id)
            }
          })

          toast({
            title: "Biblioteca Restaurada Automáticamente",
            description: `Se cargaron ${loadedImgs.length} imágenes desde el archivo, ${markedIds.length} marcadas para informe`,
            duration: 5000
          })
        } else {
          // Modo 'metadata': requiere selección de archivos
          const instructions = libraryData.instructions || 'Selecciona la carpeta que contiene las imágenes.'

          toast({
            title: "Selecciona los Archivos",
            description: instructions,
            duration: 10000
          })

          console.log('[Library] Archivos necesarios:\n', libraryData.images.map(img => img.filePath || img.filename).join('\n'))

          // Abrir selector de CARPETA
          const imageInput = document.createElement('input')
          imageInput.type = 'file'
          imageInput.webkitdirectory = true
          imageInput.multiple = true
          imageInput.onchange = async (imgEvent: any) => {
            const files = Array.from(imgEvent.target.files) as File[]

            const { images: reconstructedImages, markedIds: reconstructedMarkedIds } = reconstructLibraryFromFiles(files, libraryData)

            const newImages: ImageItem[] = []
            for (const img of reconstructedImages) {
              const reader = new FileReader()
              await new Promise((resolve) => {
                reader.onload = (event) => {
                  newImages.push({
                    id: img.id,
                    url: event.target?.result as string,
                    filename: img.filename,
                    filePath: img.filePath,
                    size: img.size,
                    timestamp: img.timestamp
                  })
                  resolve(null)
                }
                reader.readAsDataURL(img.file)
              })
            }

            addImages(newImages)

            reconstructedMarkedIds.forEach(id => {
              if (!markedForReport.includes(id)) {
                toggleMarkForReport(id)
              }
            })

            toast({
              title: "Biblioteca Restaurada",
              description: `Se cargaron ${newImages.length} imágenes, ${reconstructedMarkedIds.length} marcadas para informe`
            })
          }
          imageInput.click()
        }

      } catch (error: any) {
        toast({
          title: "Error al Importar",
          description: error.message,
          variant: "destructive"
        })
      }
    }
    input.click()
  }

  // Buscar archivos por nombre en carpetas seleccionadas
  const handleSearchFiles = async () => {
    if (!fileNamesInput.trim()) {
      toast({
        title: "Lista Vacía",
        description: "Ingresa al menos un nombre de archivo",
        variant: "destructive"
      })
      return
    }

    // Parsear nombres de archivos (separados por ;)
    const fileNames = fileNamesInput
      .split(';')
      .map(name => name.trim())
      .filter(name => name.length > 0)

    if (fileNames.length === 0) {
      toast({
        title: "Lista Vacía",
        description: "No se encontraron nombres de archivo válidos",
        variant: "destructive"
      })
      return
    }

    // Abrir selector de MÚLTIPLES CARPETAS
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true
    input.multiple = true // Permite seleccionar múltiples carpetas

    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files) as File[]
      if (files.length === 0) return

      setIsSearching(true)
      setShowSearchDialog(false)

      try {
        // Crear un Set de nombres de archivos a buscar (case-insensitive)
        const searchSet = new Set(fileNames.map(name => name.toLowerCase()))

        // Buscar archivos que coincidan
        const matchedFiles: File[] = []
        const foundNames = new Set<string>()

        files.forEach(file => {
          const fileName = file.name.toLowerCase()

          // Buscar coincidencia exacta
          if (searchSet.has(fileName)) {
            matchedFiles.push(file)
            foundNames.add(file.name)
          }
        })

        if (matchedFiles.length === 0) {
          toast({
            title: "No se Encontraron Archivos",
            description: `No se encontró ninguno de los ${fileNames.length} archivos especificados en las carpetas seleccionadas`,
            variant: "destructive",
            duration: 8000
          })
          setIsSearching(false)
          return
        }

        // Cargar imágenes encontradas
        const newImages: ImageItem[] = []
        for (const file of matchedFiles) {
          const reader = new FileReader()
          await new Promise((resolve) => {
            reader.onload = (event) => {
              const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              const sizeInKB = (file.size / 1024).toFixed(2)
              const relativePath = (file as any).webkitRelativePath || file.name

              newImages.push({
                id,
                url: event.target?.result as string,
                filename: file.name,
                filePath: relativePath,
                size: `${sizeInKB} KB`,
                timestamp: new Date().toLocaleString('es-ES', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              })
              resolve(null)
            }
            reader.readAsDataURL(file)
          })
        }

        // Agregar imágenes al contexto
        addImages(newImages)

        // Mostrar resumen
        const notFound = fileNames.filter(name =>
          !Array.from(foundNames).some(found => found.toLowerCase() === name.toLowerCase())
        )

        toast({
          title: "Búsqueda Completada",
          description: `Se encontraron ${matchedFiles.length} de ${fileNames.length} archivos. ${notFound.length > 0 ? `No encontrados: ${notFound.length}` : 'Todos encontrados ✓'}`,
          duration: 8000
        })

        if (notFound.length > 0) {
          console.log('[Search] Archivos no encontrados:', notFound)
        }

      } catch (error: any) {
        toast({
          title: "Error en la Búsqueda",
          description: error.message,
          variant: "destructive"
        })
      } finally {
        setIsSearching(false)
      }
    }

    input.click()
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
            <div className="h-6 w-px bg-border mx-2" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportLibrary}
              disabled={loadedImages.length === 0}
              title="Guardar biblioteca de imágenes con rutas y selección"
            >
              <BookMarked className="mr-2 h-4 w-4" />
              Guardar Biblioteca
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportLibrary}
              title="Cargar biblioteca guardada previamente"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Cargar Biblioteca
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearchDialog(true)}
              disabled={isSearching}
              title="Buscar archivos específicos en carpetas seleccionadas"
            >
              <Search className="mr-2 h-4 w-4" />
              {isSearching ? "Buscando..." : "Buscar Archivos"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSession}
              disabled={loadedImages.length === 0}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Sesión
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportSessionFile}
            >
              <FileUp className="mr-2 h-4 w-4" />
              Importar Sesión
            </Button>
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

              {/* Filtros de Nivel de Corrosión */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Filtrar por Nivel de Corrosión</label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={severityFilter.includes("alto") ? "default" : "outline"}
                    className={`cursor-pointer ${severityFilter.includes("alto") ? "bg-severity-high hover:bg-severity-high/80" : ""}`}
                    onClick={() => toggleSeverityFilter("alto")}
                  >
                    Corrosión Extensa
                  </Badge>
                  <Badge
                    variant={severityFilter.includes("medio") ? "default" : "outline"}
                    className={`cursor-pointer ${severityFilter.includes("medio") ? "bg-severity-medium hover:bg-severity-medium/80" : ""}`}
                    onClick={() => toggleSeverityFilter("medio")}
                  >
                    Corrosión Moderada
                  </Badge>
                  <Badge
                    variant={severityFilter.includes("bajo") ? "default" : "outline"}
                    className={`cursor-pointer ${severityFilter.includes("bajo") ? "bg-severity-low hover:bg-severity-low/80" : ""}`}
                    onClick={() => toggleSeverityFilter("bajo")}
                  >
                    Corrosión Leve
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecciona los niveles de deterioro a mostrar en los resultados
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

      {/* Input oculto para cargar archivos JSON */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Mensaje de sesión pendiente */}
      {pendingSessionImport && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Card className="p-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
            <div className="flex items-start gap-3">
              <FileUp className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Sesión Lista para Importar</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Carga las siguientes imágenes para restaurar la sesión:
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 list-disc list-inside">
                  {pendingSessionImport.imageFilenames.slice(0, 5).map((name, i) => (
                    <li key={i}>{name}</li>
                  ))}
                  {pendingSessionImport.imageFilenames.length > 5 && (
                    <li>... y {pendingSessionImport.imageFilenames.length - 5} más</li>
                  )}
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setPendingSessionImport(null)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Dialog de búsqueda de archivos */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Buscar Archivos Específicos</DialogTitle>
            <DialogDescription>
              Ingresa una lista de nombres de archivos (con extensión) separados por punto y coma (;).
              Luego selecciona las carpetas raíz donde buscar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Lista de archivos (separados por ;)
              </label>
              <Textarea
                placeholder="ejemplo: foto1.jpg;imagen2.png;DJI_20251015120029_0040_D.JPG;archivo.jpg"
                value={fileNamesInput}
                onChange={(e) => setFileNamesInput(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Ejemplo: foto1.jpg;imagen2.png;archivo3.jpg
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSearchDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSearchFiles}
              disabled={!fileNamesInput.trim()}
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar en Carpetas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
