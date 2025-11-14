"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FileText, Download, Eye, Sparkles, MapPin, Image as ImageIcon, Printer, Save, FolderOpen, Edit, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Undo, Redo, Type } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAnalysisState } from "@/contexts/analysis-context"
import { useToast } from "@/hooks/use-toast"
import { AdvancedImageViewer } from "@/components/advanced-image-viewer"
import { extractGPSFromImage, generateSimulatedGPS } from "@/lib/exif-utils"
import { exportToWord, printReport, generateReportHTML, generateStyles, type ReportData } from "@/lib/report-export"
import { getLogoBase64 } from "@/lib/logo-utils"
import { getTranslations } from "@/lib/report-translations"
import { processImagesWithBoxes } from "@/lib/image-with-boxes"
import { getStaticMapImageUrl, getStaticMapBase64, getStaticMapProxyUrl, getOpenStreetMapUrl, getGoogleMapsUrl, formatGPSCoordinates, imageUrlToBase64, reverseGeocode } from "@/lib/maps-utils"
import { SessionManager } from "@/components/session-manager"
import { saveReportDraft, loadReportDraft } from "@/lib/session-storage"
import { GooglePlacesAutocomplete } from "@/components/google-places-autocomplete"

// Interfaz para datos GPS
interface GPSData {
  latitude: string
  longitude: string
  altitude?: number
  hasGPS: boolean
}

export default function InformesPage() {
  const { state: { markedForReport, loadedImages, detections } } = useAnalysisState()
  const { toast } = useToast()

  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [sessionDialogMode, setSessionDialogMode] = useState<'save' | 'load'>('save')
  const [showReportEditor, setShowReportEditor] = useState(false)
  const [editableReportHTML, setEditableReportHTML] = useState<string>('')
  const editorRef = useRef<HTMLDivElement>(null)

  // Funciones de formato para el editor tipo Word
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const applyFontSize = (size: string) => {
    executeCommand('fontSize', '7')
    const fontElements = document.getElementsByTagName('font')
    for (let i = 0; i < fontElements.length; i++) {
      if (fontElements[i].size === '7') {
        fontElements[i].removeAttribute('size')
        fontElements[i].style.fontSize = size
      }
    }
    editorRef.current?.focus()
  }

  // Cargar librería exifr para extracción de GPS
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).exifr) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/exifr/dist/full.umd.js'
      script.async = true
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Cargar logo en base64 al montar
  useEffect(() => {
    const loadLogo = async () => {
      const logo = await getLogoBase64()
      setLogoBase64(logo)
    }
    loadLogo()
  }, [])

  // Datos del proyecto
  const [projectData, setProjectData] = useState({
    workNumber: "",
    orderNumber: "",
    projectName: "",
    installationCode: "",
    location: "",
    inspectionDate: "", // Campo manual
    reportDate: "", // Campo manual
    inspector: "",
    reviewer: "",
    client: "",
    introduction: "" // Campo para la introducción personalizada
  })

  // Editor de análisis por imagen (contenido editable)
  const [imageAnalysis, setImageAnalysis] = useState<{[key: string]: string}>({})

  // Cache de coordenadas GPS por imagen
  const [imageGPS, setImageGPS] = useState<{[key: string]: GPSData}>({})
  const [loadingGPS, setLoadingGPS] = useState(false)

  // Cache de URLs de mapas (para visualización en UI)
  const [imageMaps, setImageMaps] = useState<{[key: string]: string | null}>({})
  const [mapErrors, setMapErrors] = useState<{[key: string]: boolean}>({})

  // Logo en base64
  const [logoBase64, setLogoBase64] = useState<string>('')
  const [clientLogoBase64, setClientLogoBase64] = useState<string>('')
  const [coverImageBase64, setCoverImageBase64] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en' | 'pt'>('es')
  const [autoLocationLoaded, setAutoLocationLoaded] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [showMissingFieldsDialog, setShowMissingFieldsDialog] = useState(false)
  const [showMissingAnalysisDialog, setShowMissingAnalysisDialog] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [pendingExport, setPendingExport] = useState(false)

  // Obtener imágenes marcadas con sus detecciones
  const markedImages = loadedImages.filter(img => markedForReport.includes(img.id))

  const getImageDetections = (imageUrl: string) => {
    return detections.filter(d => d.image === imageUrl)
  }

  // Extraer coordenadas GPS de metadatos
  const extractGPSCoordinates = async (imageId: string, imageUrl: string, index: number) => {
    // Si ya tenemos las coordenadas en caché, devolverlas
    if (imageGPS[imageId]) {
      return imageGPS[imageId]
    }

    try {
      const gpsData = await extractGPSFromImage(imageUrl)

      if (gpsData.hasGPS) {
        const coords = {
          latitude: gpsData.latitude!,
          longitude: gpsData.longitude!,
          altitude: gpsData.altitude || 0,
          hasGPS: true
        }
        setImageGPS(prev => ({ ...prev, [imageId]: coords }))
        return coords
      } else {
        // Si no hay GPS, generar coordenadas simuladas
        const simulated = generateSimulatedGPS(index)
        setImageGPS(prev => ({ ...prev, [imageId]: simulated }))
        return simulated
      }
    } catch (error) {
      console.error('Error extracting GPS:', error)
      const simulated = generateSimulatedGPS(index)
      setImageGPS(prev => ({ ...prev, [imageId]: simulated }))
      return simulated
    }
  }

  // Cargar GPS de todas las imágenes al montar
  useEffect(() => {
    const loadAllGPS = async () => {
      if (markedImages.length === 0 || loadingGPS) return

      setLoadingGPS(true)
      for (let i = 0; i < markedImages.length; i++) {
        const img = markedImages[i]
        if (!imageGPS[img.id]) {
          await extractGPSCoordinates(img.id, img.url, i)
        }
      }
      setLoadingGPS(false)
    }

    loadAllGPS()
  }, [markedImages.length])

  // Auto-completar localización desde la primera imagen con GPS
  useEffect(() => {
    const autoFillLocation = async () => {
      if (autoLocationLoaded || markedImages.length === 0 || projectData.location) return

      const firstImage = markedImages[0]
      const gps = imageGPS[firstImage.id]

      if (gps && gps.hasGPS && gps.latitude && gps.longitude) {
        console.log('[Informes] Auto-filling location from first image GPS:', {
          latitude: gps.latitude,
          longitude: gps.longitude
        })
        const lat = parseFloat(gps.latitude)
        const lon = parseFloat(gps.longitude)

        const geocodeResult = await reverseGeocode(lat, lon)
        if (geocodeResult) {
          console.log('[Informes] Setting location to:', geocodeResult.formatted)
          setProjectData(prev => ({ ...prev, location: geocodeResult.formatted }))
          setAutoLocationLoaded(true)
          toast({
            title: "Localización Auto-detectada",
            description: geocodeResult.formatted
          })
        }
      }
    }

    autoFillLocation()
  }, [markedImages.length, imageGPS, projectData.location, autoLocationLoaded])

  // Generar URLs de mapas usando proxy después de tener las coordenadas GPS
  useEffect(() => {
    const generateMapUrls = () => {
      if (markedImages.length === 0 || Object.keys(imageGPS).length === 0) return

      for (const img of markedImages) {
        const gps = imageGPS[img.id]
        if (gps && gps.latitude && gps.longitude && !imageMaps[img.id]) {
          console.log(`[Informes] Generating map for image ${img.id}:`, {
            latitude: gps.latitude,
            longitude: gps.longitude,
            hasGPS: gps.hasGPS
          })

          try {
            // Generar URL del mapa usando proxy (evita CORS)
            const mapProxyUrl = getStaticMapProxyUrl({
              latitude: gps.latitude,
              longitude: gps.longitude,
              zoom: 18,
              width: 600,
              height: 400,
              mapType: 'hybrid'
            })

            console.log(`[Informes] Map URL for ${img.id}:`, mapProxyUrl)
            setImageMaps(prev => ({ ...prev, [img.id]: mapProxyUrl }))
          } catch (error) {
            console.error(`[Informes] Error generating map URL for ${img.id}:`, error)
            setMapErrors(prev => ({ ...prev, [img.id]: true }))
          }
        }
      }
    }

    generateMapUrls()
  }, [imageGPS, markedImages.length])

  // Generar análisis con IA
  const generateAIAnalysis = async (imageId: string, imageUrl: string, imageDetections: any[]) => {
    setGeneratingAI(true)

    try {
      // 1. CONVERTIR IMAGEN A BASE64 USANDO LA FUNCIÓN EXISTENTE
      toast({
        title: "Procesando Imagen",
        description: "Preparando imagen para el modelo de visión...",
        duration: 3000
      })

      let imageBase64: string | null = null

      try {
        // imageUrlToBase64 ya maneja diferentes métodos de carga
        // ¡Es clave para el modelo de visión!
        imageBase64 = await imageUrlToBase64(imageUrl)
      } catch (base64Error) {
        console.error('Error converting image to Base64:', base64Error)
        toast({
          title: "Error de Imagen",
          description: "No se pudo codificar la imagen para el análisis IA.",
          variant: "destructive"
        })
        throw new Error("Failed to encode image to Base64")
      }

      const severityCounts = {
        alto: imageDetections.filter(d => d.severity === "alto").length,
        medio: imageDetections.filter(d => d.severity === "medio").length,
        bajo: imageDetections.filter(d => d.severity === "bajo").length
      }

      const avgConfidence = imageDetections.reduce((sum, d) => sum + d.confidence, 0) / imageDetections.length

      // Llamar a la API de ChatGPT con la imagen
      const response = await fetch('/api/generate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detections: imageDetections.length,
          severityCounts,
          avgConfidence,
          // *** ENVIAMOS LA IMAGEN EN BASE64 ***
          imageBase64: imageBase64,
          language: selectedLanguage
        })
      })

      if (!response.ok) {
        throw new Error('Error al generar análisis')
      }

      const data = await response.json()

      setImageAnalysis(prev => ({
        ...prev,
        [imageId]: data.analysis
      }))

      toast({
        title: "Análisis Generado",
        description: "El análisis con IA se generó correctamente"
      })
    } catch (error: any) {
      console.error('Error generating AI analysis:', error)

      // Fallback: generar análisis básico sin IA
      const severityCounts = {
        alto: imageDetections.filter(d => d.severity === "alto").length,
        medio: imageDetections.filter(d => d.severity === "medio").length,
        bajo: imageDetections.filter(d => d.severity === "bajo").length
      }

      let analysis = `Se detectaron ${imageDetections.length} áreas con presencia de corrosión. `

      if (severityCounts.alto > 0) {
        analysis += `Se identificaron ${severityCounts.alto} área(s) de severidad alta que requieren intervención inmediata. `
      }
      if (severityCounts.medio > 0) {
        analysis += `${severityCounts.medio} área(s) presentan severidad media, recomendándose planificar mantenimiento preventivo. `
      }
      if (severityCounts.bajo > 0) {
        analysis += `${severityCounts.bajo} área(s) con severidad baja están en fase inicial de corrosión. `
      }

      analysis += "Se recomienda monitoreo continuo de las áreas afectadas."

      setImageAnalysis(prev => ({
        ...prev,
        [imageId]: analysis
      }))

      toast({
        title: "Análisis Básico Generado",
        description: "API de IA no disponible, se generó análisis básico",
        variant: "default"
      })
    } finally {
      setGeneratingAI(false)
    }
  }

  // Generar todos los análisis con IA
  const generateAllAnalyses = async () => {
    for (const img of markedImages) {
      const imgDetections = getImageDetections(img.url)
      if (imgDetections.length > 0 && !imageAnalysis[img.id]) {
        await generateAIAnalysis(img.id, img.url, imgDetections)
      }
    }
  }

  // Manejar cambio en el texto del análisis
  const handleAnalysisChange = (imageId: string, content: string) => {
    setImageAnalysis(prev => ({
      ...prev,
      [imageId]: content
    }))
  }

  // Preparar datos para exportación
  const prepareReportData = () => {
    return {
      projectData,
      images: markedImages.map((img, index) => ({
        id: img.id,
        filename: img.filename,
        url: img.url,
        timestamp: img.timestamp || new Date().toLocaleString('es-ES'),
        gps: imageGPS[img.id] || generateSimulatedGPS(index),
        detections: getImageDetections(img.url),
        analysis: imageAnalysis[img.id] || 'Sin análisis generado'
      }))
    }
  }

  // Abrir editor de informe
  const handleOpenReportEditor = async () => {
    if (markedImages.length === 0) {
      toast({
        title: "Sin Imágenes",
        description: "Debes marcar al menos una imagen en Análisis para generar el informe",
        variant: "destructive"
      })
      return
    }

    // Validar campos obligatorios
    const missing = validateRequiredFields()
    if (missing.length > 0) {
      setMissingFields(missing)
      setShowValidationErrors(true)
      setShowMissingFieldsDialog(true)
      return
    }

    // Verificar si hay análisis generados (advertencia pero permitir continuar)
    if (!hasAllAnalysis()) {
      setShowMissingAnalysisDialog(true)
      return
    }

    setGenerating(true)

    try {
      toast({
        title: "Generando Vista Previa",
        description: "Procesando imágenes y generando contenido editable..."
      })

      // Procesar imágenes con bounding boxes
      const processedImagesMap = await processImagesWithBoxes(
        markedImages.map(img => ({
          url: img.url,
          detections: getImageDetections(img.url)
        }))
      )

      // Preparar imágenes con mapas y análisis
      const imagesWithMaps = await Promise.all(
        markedImages.map(async (img) => {
          const gps = await extractGPSCoordinates(img.id, img.url, markedImages.indexOf(img))

          let mapBase64: string | null = null
          if (gps.hasGPS) {
            try {
              const mapUrl = getStaticMapProxyUrl(Number(gps.latitude), Number(gps.longitude))
              mapBase64 = await imageUrlToBase64(mapUrl)
            } catch (error) {
              console.error('Error loading map for editor:', error)
            }
          }

          return {
            id: img.id,
            filename: img.filename,
            url: img.url,
            urlWithBoxes: processedImagesMap.get(img.url) || img.url,
            timestamp: img.timestamp || new Date().toLocaleString('es-ES'),
            gps,
            detections: getImageDetections(img.url),
            analysis: imageAnalysis[img.id] || 'Sin análisis generado',
            mapImageBase64: mapBase64
          }
        })
      )

      // Cargar logo de RDT
      const rdtLogoResponse = await fetch('/logo/RDT.png')
      const rdtLogoBlob = await rdtLogoResponse.blob()
      const rdtLogoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(rdtLogoBlob)
      })

      // Preparar datos del reporte
      const reportData: ReportData = {
        projectData: {
          ...projectData
        },
        images: imagesWithMaps,
        language: selectedLanguage,
        rdtLogoBase64,
        clientLogoBase64: clientLogoBase64 || undefined,
        coverImageBase64: coverImageBase64 || undefined
      }

      // Generar HTML del informe
      const t = getTranslations(selectedLanguage)
      const htmlContent = generateReportHTML(reportData, t)

      setEditableReportHTML(htmlContent)
      setShowReportEditor(true)

      toast({
        title: "Editor Abierto",
        description: "Puedes editar el contenido del informe antes de exportar"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo generar la vista previa",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  // Validar campos obligatorios
  const validateRequiredFields = () => {
    const missing: string[] = []

    if (!projectData.projectName) missing.push("Nombre del Proyecto")
    if (!projectData.location) missing.push("Localización")
    if (!projectData.client) missing.push("Cliente")
    if (!projectData.inspectionDate) missing.push("Fecha de Inspección")
    if (!projectData.reportDate) missing.push("Fecha del Informe")
    if (!projectData.inspector) missing.push("Elaborado por")

    return missing
  }

  // Verificar si hay análisis generados
  const hasAllAnalysis = () => {
    return markedImages.every(img => imageAnalysis[img.id] && imageAnalysis[img.id] !== "Haz clic en 'Generar Análisis IA' para obtener un análisis automático, o escribe tu propio análisis aquí...")
  }

  // Exportar a Word
  const handleExportWord = async () => {
    if (markedImages.length === 0) {
      toast({
        title: "Sin Imágenes",
        description: "Debes marcar al menos una imagen en Análisis para generar el informe",
        variant: "destructive"
      })
      return
    }

    // Validar campos obligatorios
    const missing = validateRequiredFields()
    if (missing.length > 0) {
      setMissingFields(missing)
      setShowValidationErrors(true)
      setShowMissingFieldsDialog(true)
      return
    }

    // Verificar si hay análisis generados
    if (!hasAllAnalysis()) {
      setShowMissingAnalysisDialog(true)
      return
    }

    // Proceder con la exportación
    await performExport()
  }

  // Función que realiza la exportación real
  const performExport = async () => {
    setGenerating(true)

    try {
      toast({
        title: "Procesando Imágenes",
        description: "Dibujando bounding boxes en las imágenes..."
      })

      // Procesar imágenes con bounding boxes
      const imagesToProcess = markedImages.map(img => ({
        url: img.url,
        boxes: getImageDetections(img.url).map(d => ({
          x: d.bbox.x,
          y: d.bbox.y,
          w: d.bbox.w,
          h: d.bbox.h,
          label: "Corrosión",
          confidence: d.confidence,
          severity: d.severity as "alto" | "medio" | "bajo"
        }))
      }))

      const processedImagesMap = await processImagesWithBoxes(imagesToProcess)

      // Convertir mapas a base64 para exportación
      toast({
        title: "Convirtiendo Mapas",
        description: "Preparando imágenes de mapas para el documento..."
      })

      const imagesWithMaps = await Promise.all(
        markedImages.map(async (img, index) => {
          const gps = imageGPS[img.id] || generateSimulatedGPS(index)
          let mapBase64 = null

          // Convertir URL del mapa a base64 para incluir en el documento
          if (imageMaps[img.id] && gps.latitude && gps.longitude) {
            try {
              mapBase64 = await getStaticMapBase64({
                latitude: gps.latitude,
                longitude: gps.longitude,
                zoom: 18,
                width: 600,
                height: 400,
                mapType: 'hybrid'
              })
            } catch (error) {
              console.error(`Error converting map to base64 for ${img.id}:`, error)
            }
          }

          return {
            id: img.id,
            filename: img.filename,
            url: img.url,
            urlWithBoxes: processedImagesMap.get(img.url) || img.url,
            timestamp: img.timestamp || new Date().toLocaleString('es-ES'),
            gps,
            detections: getImageDetections(img.url),
            analysis: imageAnalysis[img.id] || 'Sin análisis generado',
            mapImageBase64: mapBase64
          }
        })
      )

      // Cargar logo de RDT
      const rdtLogoResponse = await fetch('/logo/RDT.png')
      const rdtLogoBlob = await rdtLogoResponse.blob()
      const rdtLogoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(rdtLogoBlob)
      })

      // Preparar datos del reporte con imágenes procesadas
      const reportData = {
        projectData: {
          ...projectData,
        },
        images: imagesWithMaps,
        language: selectedLanguage,
        rdtLogoBase64,
        clientLogoBase64: clientLogoBase64 || undefined,
        coverImageBase64: coverImageBase64 || undefined
      }

      await exportToWord(reportData)

      toast({
        title: "Informe Exportado",
        description: "El informe Word se ha descargado correctamente"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo exportar el informe",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  // Imprimir informe
  const handlePrint = async () => {
    if (markedImages.length === 0) {
      toast({
        title: "Sin Imágenes",
        description: "Debes marcar al menos una imagen en Análisis para imprimir el informe",
        variant: "destructive"
      })
      return
    }

    // Validar campos obligatorios
    const missing = validateRequiredFields()
    if (missing.length > 0) {
      setMissingFields(missing)
      setShowValidationErrors(true)
      setShowMissingFieldsDialog(true)
      return
    }

    // Verificar si hay análisis generados
    if (!hasAllAnalysis()) {
      setShowMissingAnalysisDialog(true)
      setPendingExport(true) // Marcar que queremos imprimir después de confirmar
      return
    }

    // CRÍTICO: Abrir la ventana INMEDIATAMENTE para evitar bloqueos del navegador
    // Esto debe hacerse ANTES de cualquier procesamiento async
    const printWindow = window.open('', '_blank', 'width=800,height=600')

    if (!printWindow) {
      toast({
        title: "Popup Bloqueado",
        description: "El navegador bloqueó la ventana de impresión. Por favor, permite los popups para este sitio.",
        variant: "destructive"
      })
      return
    }

    // Mostrar mensaje de carga en la ventana mientras procesamos
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Preparando informe...</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .loader {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            color: #333;
          }
          .spinner {
            border: 5px solid #f3f4f6;
            border-top: 5px solid #2563eb;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .progress {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="loader">
          <div class="spinner"></div>
          <h2>Preparando informe de inspección</h2>
          <p>Procesando ${markedImages.length} imágenes con bounding boxes...</p>
          <div class="progress">
            <p>⏳ Esto puede tomar unos momentos</p>
            <p>📦 Dibujando detecciones de corrosión</p>
            <p>🗺️ Convirtiendo mapas</p>
          </div>
        </div>
      </body>
      </html>
    `)

    try {
      toast({
        title: "Procesando Imágenes",
        description: "Dibujando bounding boxes en las imágenes..."
      })

      // Procesar imágenes con bounding boxes
      const imagesToProcess = markedImages.map(img => ({
        url: img.url,
        boxes: getImageDetections(img.url).map(d => ({
          x: d.bbox.x,
          y: d.bbox.y,
          w: d.bbox.w,
          h: d.bbox.h,
          label: "Corrosión",
          confidence: d.confidence,
          severity: d.severity as "alto" | "medio" | "bajo"
        }))
      }))

      const processedImagesMap = await processImagesWithBoxes(imagesToProcess)

      // Convertir mapas a base64 para impresión
      toast({
        title: "Convirtiendo Mapas",
        description: "Preparando imágenes de mapas para imprimir..."
      })

      const imagesWithMaps = await Promise.all(
        markedImages.map(async (img, index) => {
          const gps = imageGPS[img.id] || generateSimulatedGPS(index)
          let mapBase64 = null

          // Convertir URL del mapa a base64 para incluir en el documento
          if (imageMaps[img.id] && gps.latitude && gps.longitude) {
            try {
              mapBase64 = await getStaticMapBase64({
                latitude: gps.latitude,
                longitude: gps.longitude,
                zoom: 18,
                width: 600,
                height: 400,
                mapType: 'hybrid'
              })
            } catch (error) {
              console.error(`Error converting map to base64 for ${img.id}:`, error)
            }
          }

          return {
            id: img.id,
            filename: img.filename,
            url: img.url,
            urlWithBoxes: processedImagesMap.get(img.url) || img.url,
            timestamp: img.timestamp || new Date().toLocaleString('es-ES'),
            gps,
            detections: getImageDetections(img.url),
            analysis: imageAnalysis[img.id] || 'Sin análisis generado',
            mapImageBase64: mapBase64
          }
        })
      )

      // Cargar logo de RDT
      const rdtLogoResponse = await fetch('/logo/RDT.png')
      const rdtLogoBlob = await rdtLogoResponse.blob()
      const rdtLogoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(rdtLogoBlob)
      })

      // Preparar datos del reporte con imágenes procesadas
      const reportData = {
        projectData: {
          ...projectData,
        },
        images: imagesWithMaps,
        language: selectedLanguage,
        rdtLogoBase64,
        clientLogoBase64: clientLogoBase64 || undefined,
        coverImageBase64: coverImageBase64 || undefined
      }

      // Pasar la ventana ya abierta a printReport para que la use
      printReport(reportData, printWindow)

      toast({
        title: "Imprimiendo",
        description: "Se abrió el diálogo de impresión"
      })
    } catch (error: any) {
      // Si hay error, cerrar la ventana de impresión
      printWindow.close()

      toast({
        title: "Error",
        description: error.message || "No se pudo imprimir el informe",
        variant: "destructive"
      })
    }
  }

  // Guardar borrador de informe
  const handleSaveDraft = (name: string) => {
    try {
      saveReportDraft({
        name,
        projectData,
        markedImages: markedImages.map(img => ({
          id: img.id,
          filename: img.filename,
          url: img.url
        })),
        detections: markedImages.flatMap(img =>
          getImageDetections(img.url).map(d => ({
            image: d.image,
            class_name: d.class_name,
            severity: d.severity,
            confidence: d.confidence,
            bbox: d.bbox
          }))
        )
      })

      toast({
        title: "Borrador Guardado",
        description: `El borrador "${name}" se ha guardado correctamente`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el borrador",
        variant: "destructive"
      })
    }
  }

  // Cargar borrador de informe
  const handleLoadDraft = (id: string) => {
    try {
      const draft = loadReportDraft(id)
      if (!draft) {
        throw new Error('Borrador no encontrado')
      }

      // Cargar datos del proyecto
      setProjectData(draft.projectData)

      toast({
        title: "Borrador Cargado",
        description: `Se cargó el borrador "${draft.name}"`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el borrador",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-8">
          <div>
            <h1 className="text-xl font-semibold">Generación de Informes</h1>
            <p className="text-sm text-muted-foreground">
              {markedImages.length} {markedImages.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSessionDialogMode('save')
                setShowSessionDialog(true)
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Borrador
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSessionDialogMode('load')
                setShowSessionDialog(true)
              }}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Cargar Borrador
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateAllAnalyses}
              disabled={generatingAI || markedImages.length === 0}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {generatingAI ? "Generando..." : "Generar Análisis IA"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={markedImages.length === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenReportEditor}
              disabled={generating || markedImages.length === 0}
            >
              <Edit className="mr-2 h-4 w-4" />
              {generating ? "Generando..." : "Editar Informe"}
            </Button>
            <Button
              size="sm"
              onClick={handleExportWord}
              disabled={generating || markedImages.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              {generating ? "Generando..." : "Exportar a Word"}
            </Button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Mensaje informativo si no hay imágenes */}
          {markedImages.length === 0 && (
            <Card className="p-6 border-yellow-500/50 bg-yellow-500/10">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-500">No hay imágenes seleccionadas</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Puedes rellenar los datos del proyecto ahora. Para incluir imágenes en el informe,
                    ve a la página de <a href="/analisis" className="text-primary underline">Análisis</a> y
                    marca las imágenes usando los checkboxes.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Nota:</strong> Las imágenes se mantienen durante tu sesión de trabajo, pero
                    se perderán si recargas la página. Completa el flujo de trabajo sin recargar.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Mensaje de imágenes disponibles */}
          {markedImages.length > 0 && markedImages.some(img => !img.url) && (
            <Card className="p-6 border-red-500/50 bg-red-500/10">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-500">Algunas imágenes no están disponibles</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Las imágenes se perdieron al recargar la página. Por favor, vuelve a
                    <a href="/analisis" className="text-primary underline ml-1">Análisis</a>,
                    carga las imágenes de nuevo, y genera el informe sin recargar la página.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Datos del Proyecto */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-primary" />
              Datos del Proyecto
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work-number">Nº de Obra</Label>
                <Input
                  id="work-number"
                  value={projectData.workNumber}
                  onChange={(e) => setProjectData({...projectData, workNumber: e.target.value})}
                  placeholder="25.00015.45.41"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-number">Nº de Pedido</Label>
                <Input
                  id="order-number"
                  value={projectData.orderNumber}
                  onChange={(e) => setProjectData({...projectData, orderNumber: e.target.value})}
                  placeholder="4508838917"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="project-name" className={showValidationErrors && !projectData.projectName ? "text-red-500" : ""}>
                  Nombre del Proyecto {showValidationErrors && !projectData.projectName && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="project-name"
                  value={projectData.projectName}
                  onChange={(e) => setProjectData({...projectData, projectName: e.target.value})}
                  placeholder="Inspección de estructura metálica..."
                  className={showValidationErrors && !projectData.projectName ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="introduction">Introducción / Descripción de la Inspección</Label>
                <Textarea
                  id="introduction"
                  value={projectData.introduction}
                  onChange={(e) => setProjectData({...projectData, introduction: e.target.value})}
                  placeholder="Describe aquí el contexto de la inspección: ubicación específica, tipo de estructura inspeccionada, técnicas utilizadas, equipamiento empleado (cámaras, drones, etc.), condiciones de la inspección, objetivos del análisis..."
                  className="min-h-[100px] resize-y"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className={showValidationErrors && !projectData.location ? "text-red-500" : ""}>
                  Localización {showValidationErrors && !projectData.location && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="location"
                  value={projectData.location}
                  onChange={(e) => setProjectData({...projectData, location: e.target.value})}
                  placeholder="Ciudad, Provincia"
                  className={showValidationErrors && !projectData.location ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client" className={showValidationErrors && !projectData.client ? "text-red-500" : ""}>
                  Cliente {showValidationErrors && !projectData.client && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="client"
                  value={projectData.client}
                  onChange={(e) => setProjectData({...projectData, client: e.target.value})}
                  placeholder="Nombre de la empresa cliente"
                  className={showValidationErrors && !projectData.client ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspection-date" className={showValidationErrors && !projectData.inspectionDate ? "text-red-500" : ""}>
                  Fecha de Inspección {showValidationErrors && !projectData.inspectionDate && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="inspection-date"
                  type="date"
                  value={projectData.inspectionDate}
                  onChange={(e) => setProjectData({...projectData, inspectionDate: e.target.value})}
                  className={showValidationErrors && !projectData.inspectionDate ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-date" className={showValidationErrors && !projectData.reportDate ? "text-red-500" : ""}>
                  Fecha del Informe {showValidationErrors && !projectData.reportDate && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="report-date"
                  type="date"
                  value={projectData.reportDate}
                  onChange={(e) => setProjectData({...projectData, reportDate: e.target.value})}
                  className={showValidationErrors && !projectData.reportDate ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspector" className={showValidationErrors && !projectData.inspector ? "text-red-500" : ""}>
                  Elaborado por {showValidationErrors && !projectData.inspector && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="inspector"
                  value={projectData.inspector}
                  onChange={(e) => setProjectData({...projectData, inspector: e.target.value})}
                  placeholder="Nombre del Inspector"
                  className={showValidationErrors && !projectData.inspector ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewer">Revisado por</Label>
                <Input
                  id="reviewer"
                  value={projectData.reviewer}
                  onChange={(e) => setProjectData({...projectData, reviewer: e.target.value})}
                  placeholder="Nombre del Revisor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Idioma del Informe</Label>
                <select
                  id="language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'es' | 'en' | 'pt')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-logo">Logo del Cliente (opcional)</Label>
                <Input
                  id="client-logo"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        setClientLogoBase64(e.target?.result as string)
                        toast({
                          title: "Logo Cargado",
                          description: "Logo del cliente cargado correctamente"
                        })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-4">Datos para Portada</h3>
            <div className="grid grid-cols-1 gap-4">
              <GooglePlacesAutocomplete
                label="Buscar Ubicación (Autodetección GPS o manual)"
                placeholder="Ejemplo: Bilbao, Bizkaia, España"
                onPlaceSelected={(place) => {
                  console.log('[Informes] Place selected:', place)
                  setProjectData(prev => ({ ...prev, location: place.formatted }))
                  setAutoLocationLoaded(true)
                  toast({
                    title: "Ubicación Seleccionada",
                    description: place.formatted
                  })
                }}
              />
              <p className="text-sm text-muted-foreground -mt-2">
                💡 Se autocompleta automáticamente desde el GPS de la primera imagen, o busca manualmente una ubicación
              </p>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cover-image">Imagen Aérea para Portada (opcional)</Label>
                <Input
                  id="cover-image"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        setCoverImageBase64(e.target?.result as string)
                        toast({
                          title: "Imagen Cargada",
                          description: "Imagen aérea para portada cargada correctamente"
                        })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Si no se proporciona, se usará automáticamente el primer mapa disponible de las imágenes
                </p>
              </div>
            </div>
          </Card>

          {/* Imágenes con Análisis - Solo mostrar si hay imágenes marcadas */}
          {markedImages.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <ImageIcon className="h-5 w-5 text-accent" />
                Anexo Fotográfico con Análisis
              </h2>

              <div className="space-y-8">
              {markedImages.map((img, index) => {
                const imgDetections = getImageDetections(img.url)
                const gps = imageGPS[img.id] || generateSimulatedGPS(index)
                const boundingBoxes = imgDetections.map(d => ({
                  x: d.bbox.x,
                  y: d.bbox.y,
                  w: d.bbox.w,
                  h: d.bbox.h,
                  label: "Corrosión",
                  confidence: d.confidence,
                  severity: d.severity as "alto" | "medio" | "bajo"
                }))

                return (
                  <div key={img.id} className="border border-border rounded-lg p-4 space-y-4">
                    {/* Encabezado */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Fotografía {index + 1}</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateAIAnalysis(img.id, img.url, imgDetections)}
                        disabled={generatingAI}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar Análisis IA
                      </Button>
                    </div>

                    {/* Imagen con Bounding Boxes */}
                    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                      <AdvancedImageViewer
                        imageUrl={img.url}
                        imageName={img.filename}
                        boundingBoxes={boundingBoxes}
                        showBoundingBoxes={true}
                      />
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Archivo:</span> {img.filename}
                      </div>
                      <div>
                        <span className="font-medium">Fecha:</span> {img.timestamp || new Date().toLocaleString('es-ES')}
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">Coordenadas GPS:</span>
                        <span>{formatGPSCoordinates(gps.latitude, gps.longitude, gps.altitude)}</span>
                      </div>
                    </div>

                    {/* Mapa de Ubicación */}
                    {imageMaps[img.id] && (
                      <div className="border border-border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Ubicación Geográfica
                          </h4>
                          <div className="flex gap-3 text-xs">
                            <a
                              href={getOpenStreetMapUrl(gps.latitude, gps.longitude)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              🗺️ OpenStreetMap
                            </a>
                            <a
                              href={getGoogleMapsUrl(gps.latitude, gps.longitude)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              🌍 Google Maps
                            </a>
                          </div>
                        </div>
                        {mapErrors[img.id] ? (
                          <div className="w-full max-w-2xl mx-auto p-8 text-center border border-red-500/50 bg-red-500/10 rounded">
                            <p className="text-sm text-red-500">Error al cargar el mapa</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Coordenadas: {gps.latitude}, {gps.longitude}
                            </p>
                          </div>
                        ) : (
                          <img
                            src={imageMaps[img.id]!}
                            alt="Mapa de ubicación"
                            className="w-full max-w-2xl mx-auto rounded border border-border"
                            onError={(e) => {
                              console.error(`[Informes] Failed to load map image for ${img.id}`)
                              setMapErrors(prev => ({ ...prev, [img.id]: true }))
                            }}
                            onLoad={() => {
                              console.log(`[Informes] Map image loaded successfully for ${img.id}`)
                            }}
                          />
                        )}
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          {gps.latitude}, {gps.longitude}
                        </p>
                      </div>
                    )}

                    {/* Mensaje si no hay mapa disponible */}
                    {!imageMaps[img.id] && !mapErrors[img.id] && (
                      <div className="border border-border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Ubicación Geográfica
                          </h4>
                          <div className="flex gap-3 text-xs">
                            <a
                              href={getOpenStreetMapUrl(gps.latitude, gps.longitude)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              🗺️ OpenStreetMap
                            </a>
                            <a
                              href={getGoogleMapsUrl(gps.latitude, gps.longitude)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              🌍 Google Maps
                            </a>
                          </div>
                        </div>
                        <div className="w-full max-w-2xl mx-auto p-8 text-center border border-border bg-muted rounded">
                          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          {gps.latitude}, {gps.longitude}
                        </p>
                      </div>
                    )}

                    {/* Estadísticas de Detección */}
                    <div className="grid grid-cols-4 gap-4 p-3 bg-muted rounded-lg text-sm">
                      <div>
                        <div className="font-medium">Detecciones</div>
                        <div className="text-2xl font-bold">{imgDetections.length}</div>
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-severity-high" />
                          Extensa
                        </div>
                        <div className="text-2xl font-bold">{imgDetections.filter(d => d.severity === "alto").length}</div>
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-severity-medium" />
                          Moderada
                        </div>
                        <div className="text-2xl font-bold">{imgDetections.filter(d => d.severity === "medio").length}</div>
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-severity-low" />
                          Leve
                        </div>
                        <div className="text-2xl font-bold">{imgDetections.filter(d => d.severity === "bajo").length}</div>
                      </div>
                    </div>

                    {/* Análisis Editable */}
                    <div className="space-y-2">
                      <Label htmlFor={`analysis-${img.id}`}>Análisis Técnico (Editable)</Label>
                      <textarea
                        id={`analysis-${img.id}`}
                        className="w-full min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={imageAnalysis[img.id] || "Haz clic en 'Generar Análisis IA' para obtener un análisis automático, o escribe tu propio análisis aquí..."}
                        onChange={(e) => handleAnalysisChange(img.id, e.target.value)}
                        placeholder="Análisis técnico de la corrosión detectada..."
                      />
                    </div>
                  </div>
                )
              })}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Session Manager Dialog */}
      <SessionManager
        type="report"
        open={showSessionDialog}
        onOpenChange={setShowSessionDialog}
        mode={sessionDialogMode}
        onSave={handleSaveDraft}
        onLoad={handleLoadDraft}
      />

      {/* Editor de Informe Dialog */}
      {showReportEditor && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-4 z-50 flex items-center justify-center">
            <Card className="w-full h-full max-w-7xl flex flex-col bg-gray-50">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-white">
                <div>
                  <h2 className="text-xl font-semibold">Editor de Informe</h2>
                  <p className="text-sm text-muted-foreground">
                    Edita el contenido del informe antes de exportar
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={async () => {
                      // Exportar el contenido editado
                      const t = getTranslations(selectedLanguage)
                      const fullHTML = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${t.title} - ${projectData.projectName}</title>
  ${generateStyles()}
</head>
<body>
  ${editableReportHTML}
</body>
</html>
                      `
                      const blob = new Blob([fullHTML], { type: 'application/msword' })
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `Informe_${projectData.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      URL.revokeObjectURL(url)

                      toast({
                        title: "Informe Exportado",
                        description: "El informe editado se ha descargado correctamente"
                      })

                      setShowReportEditor(false)
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar a Word
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReportEditor(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>

              {/* Toolbar estilo Word */}
              <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-white shadow-sm">
                {/* Deshacer/Rehacer */}
                <div className="flex gap-0.5 pr-2 border-r">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeCommand('undo')}
                    title="Deshacer (Ctrl+Z)"
                    className="h-8 w-8 p-0"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeCommand('redo')}
                    title="Rehacer (Ctrl+Y)"
                    className="h-8 w-8 p-0"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tamaño de fuente */}
                <div className="flex gap-1 pr-2 border-r">
                  <select
                    onChange={(e) => applyFontSize(e.target.value)}
                    className="h-8 px-2 text-sm border rounded bg-white"
                    defaultValue="11pt"
                  >
                    <option value="8pt">8</option>
                    <option value="9pt">9</option>
                    <option value="10pt">10</option>
                    <option value="11pt">11</option>
                    <option value="12pt">12</option>
                    <option value="14pt">14</option>
                    <option value="16pt">16</option>
                    <option value="18pt">18</option>
                    <option value="20pt">20</option>
                    <option value="24pt">24</option>
                    <option value="32pt">32</option>
                  </select>
                </div>

                {/* Formato de texto */}
                <div className="flex gap-0.5 pr-2 border-r">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeCommand('bold')}
                    title="Negrita (Ctrl+B)"
                    className="h-8 w-8 p-0"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeCommand('italic')}
                    title="Cursiva (Ctrl+I)"
                    className="h-8 w-8 p-0"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeCommand('underline')}
                    title="Subrayado (Ctrl+U)"
                    className="h-8 w-8 p-0"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>

                {/* Color de texto */}
                <div className="flex gap-1 pr-2 border-r">
                  <input
                    type="color"
                    onChange={(e) => executeCommand('foreColor', e.target.value)}
                    title="Color de texto"
                    className="h-8 w-12 cursor-pointer border rounded"
                  />
                  <input
                    type="color"
                    onChange={(e) => executeCommand('hiliteColor', e.target.value)}
                    title="Color de fondo"
                    className="h-8 w-12 cursor-pointer border rounded"
                  />
                </div>

                {/* Alineación */}
                <div className="flex gap-0.5 pr-2 border-r">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeCommand('justifyLeft')}
                    title="Alinear a la izquierda"
                    className="h-8 w-8 p-0"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeCommand('justifyCenter')}
                    title="Centrar"
                    className="h-8 w-8 p-0"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeCommand('justifyRight')}
                    title="Alinear a la derecha"
                    className="h-8 w-8 p-0"
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeCommand('justifyFull')}
                    title="Justificar"
                    className="h-8 w-8 p-0"
                  >
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                </div>

                {/* Listas */}
                <div className="flex gap-0.5 pr-2 border-r">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeCommand('insertUnorderedList')}
                    title="Lista con viñetas"
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeCommand('insertOrderedList')}
                    title="Lista numerada"
                    className="h-8 w-8 p-0"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </div>

                {/* Formato */}
                <div className="flex gap-1">
                  <select
                    onChange={(e) => executeCommand('formatBlock', e.target.value)}
                    className="h-8 px-2 text-sm border rounded bg-white"
                    defaultValue="<p>"
                  >
                    <option value="<p>">Párrafo</option>
                    <option value="<h1>">Título 1</option>
                    <option value="<h2>">Título 2</option>
                    <option value="<h3>">Título 3</option>
                    <option value="<h4>">Título 4</option>
                  </select>
                </div>
              </div>

              {/* Área de edición estilo Word */}
              <div className="flex-1 overflow-auto p-8 bg-gray-100">
                <div className="max-w-[21cm] mx-auto bg-white shadow-lg">
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="min-h-[29.7cm] p-[2.54cm] focus:outline-none"
                    dangerouslySetInnerHTML={{ __html: editableReportHTML }}
                    onInput={(e) => {
                      setEditableReportHTML(e.currentTarget.innerHTML)
                    }}
                    style={{
                      fontFamily: 'Calibri, Arial, sans-serif',
                      fontSize: '11pt',
                      lineHeight: '1.5',
                      color: '#000',
                      width: '21cm',
                      minHeight: '29.7cm'
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Dialog de Campos Faltantes */}
      <AlertDialog open={showMissingFieldsDialog} onOpenChange={setShowMissingFieldsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">⚠️ Campos Obligatorios Incompletos</AlertDialogTitle>
            <AlertDialogDescription>
              Debes completar los siguientes campos obligatorios antes de generar el informe:
              <ul className="mt-3 list-disc list-inside space-y-1">
                {missingFields.map((field, index) => (
                  <li key={index} className="text-red-600 font-medium">{field}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowMissingFieldsDialog(false)
              // Scroll al formulario de datos
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Análisis Faltantes */}
      <AlertDialog open={showMissingAnalysisDialog} onOpenChange={setShowMissingAnalysisDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-yellow-600">⚠️ Análisis IA No Generados</AlertDialogTitle>
            <AlertDialogDescription>
              No se ha generado el análisis técnico automático para todas las imágenes.
              <br /><br />
              <strong>Opciones:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Generar los análisis automáticamente usando el botón "Generar Análisis IA"</li>
                <li>Escribir manualmente el análisis técnico en cada imagen</li>
                <li>Continuar sin análisis (no recomendado)</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowMissingAnalysisDialog(false)
              setPendingExport(false)
            }}>
              Volver
            </AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              setShowMissingAnalysisDialog(false)
              if (pendingExport) {
                setPendingExport(false)
                // Si venía de imprimir, redirigir a handlePrint
                // Para simplificar, dejamos que el usuario vuelva a hacer clic
              } else {
                // Continuar con la exportación
                await performExport()
              }
            }}>
              Continuar de todos modos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
