"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download, Eye, Sparkles, MapPin, Image as ImageIcon, Printer } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAnalysisState } from "@/contexts/analysis-context"
import { useToast } from "@/hooks/use-toast"
import { AdvancedImageViewer } from "@/components/advanced-image-viewer"
import { extractGPSFromImage, generateSimulatedGPS } from "@/lib/exif-utils"
import { exportToWord, printReport } from "@/lib/report-export"
import { getLogoBase64 } from "@/lib/logo-utils"
import { processImagesWithBoxes } from "@/lib/image-with-boxes"
import { getStaticMapImageUrl, getStaticMapBase64, getStaticMapProxyUrl, getOpenStreetMapUrl, getGoogleMapsUrl, formatGPSCoordinates } from "@/lib/maps-utils"

export default function InformesPage() {
  const { state: { markedForReport, loadedImages, detections } } = useAnalysisState()
  const { toast } = useToast()

  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)

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
    inspectionDate: new Date().toISOString().split('T')[0],
    reportDate: new Date().toISOString().split('T')[0],
    inspector: "",
    reviewer: "",
    client: ""
  })

  // Editor de análisis por imagen (contenido editable)
  const [imageAnalysis, setImageAnalysis] = useState<{[key: string]: string}>({})

  // Cache de coordenadas GPS por imagen
  const [imageGPS, setImageGPS] = useState<{[key: string]: any}>({})
  const [loadingGPS, setLoadingGPS] = useState(false)

  // Cache de URLs de mapas (para visualización en UI)
  const [imageMaps, setImageMaps] = useState<{[key: string]: string | null}>({})

  // Logo en base64
  const [logoBase64, setLogoBase64] = useState<string>('')

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

  // Generar URLs de mapas usando proxy después de tener las coordenadas GPS
  useEffect(() => {
    const generateMapUrls = () => {
      if (markedImages.length === 0 || Object.keys(imageGPS).length === 0) return

      for (const img of markedImages) {
        const gps = imageGPS[img.id]
        if (gps && gps.latitude && gps.longitude && !imageMaps[img.id]) {
          // Generar URL del mapa usando proxy (evita CORS)
          const mapProxyUrl = getStaticMapProxyUrl({
            latitude: gps.latitude,
            longitude: gps.longitude,
            zoom: 17,
            width: 600,
            height: 400,
            mapType: 'roadmap'
          })
          setImageMaps(prev => ({ ...prev, [img.id]: mapProxyUrl }))
        }
      }
    }

    generateMapUrls()
  }, [imageGPS, markedImages.length])

  // Generar análisis con IA
  const generateAIAnalysis = async (imageId: string, imageDetections: any[]) => {
    setGeneratingAI(true)

    try {
      const severityCounts = {
        alto: imageDetections.filter(d => d.severity === "alto").length,
        medio: imageDetections.filter(d => d.severity === "medio").length,
        bajo: imageDetections.filter(d => d.severity === "bajo").length
      }

      const avgConfidence = imageDetections.reduce((sum, d) => sum + d.confidence, 0) / imageDetections.length

      // Llamar a la API de ChatGPT
      const response = await fetch('/api/generate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detections: imageDetections.length,
          severityCounts,
          avgConfidence
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
        await generateAIAnalysis(img.id, imgDetections)
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
                zoom: 17,
                width: 600,
                height: 400,
                mapType: 'roadmap'
              })
            } catch (error) {
              console.error(`Error converting map to base64 for ${img.id}:`, error)
            }
          }

          return {
            id: img.id,
            filename: img.filename,
            url: processedImagesMap.get(img.url) || img.url,
            timestamp: img.timestamp || new Date().toLocaleString('es-ES'),
            gps,
            detections: getImageDetections(img.url),
            analysis: imageAnalysis[img.id] || 'Sin análisis generado',
            mapImageBase64: mapBase64
          }
        })
      )

      // Preparar datos del reporte con imágenes procesadas
      const reportData = {
        projectData,
        images: imagesWithMaps
      }

      await exportToWord(reportData, logoBase64)

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
                zoom: 17,
                width: 600,
                height: 400,
                mapType: 'roadmap'
              })
            } catch (error) {
              console.error(`Error converting map to base64 for ${img.id}:`, error)
            }
          }

          return {
            id: img.id,
            filename: img.filename,
            url: processedImagesMap.get(img.url) || img.url,
            timestamp: img.timestamp || new Date().toLocaleString('es-ES'),
            gps,
            detections: getImageDetections(img.url),
            analysis: imageAnalysis[img.id] || 'Sin análisis generado',
            mapImageBase64: mapBase64
          }
        })
      )

      // Preparar datos del reporte con imágenes procesadas
      const reportData = {
        projectData,
        images: imagesWithMaps
      }

      printReport(reportData, logoBase64)

      toast({
        title: "Imprimiendo",
        description: "Se abrió el diálogo de impresión"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo imprimir el informe",
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
                <Label htmlFor="project-name">Nombre del Proyecto</Label>
                <Input
                  id="project-name"
                  value={projectData.projectName}
                  onChange={(e) => setProjectData({...projectData, projectName: e.target.value})}
                  placeholder="Inspección de estructura metálica..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localización</Label>
                <Input
                  id="location"
                  value={projectData.location}
                  onChange={(e) => setProjectData({...projectData, location: e.target.value})}
                  placeholder="Ciudad, Provincia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Input
                  id="client"
                  value={projectData.client}
                  onChange={(e) => setProjectData({...projectData, client: e.target.value})}
                  placeholder="Nombre de la empresa cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspector">Elaborado por</Label>
                <Input
                  id="inspector"
                  value={projectData.inspector}
                  onChange={(e) => setProjectData({...projectData, inspector: e.target.value})}
                  placeholder="Nombre del Inspector"
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
                        onClick={() => generateAIAnalysis(img.id, imgDetections)}
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
                        <img
                          src={imageMaps[img.id]!}
                          alt="Mapa de ubicación"
                          className="w-full max-w-2xl mx-auto rounded border border-border"
                        />
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
                          Alta
                        </div>
                        <div className="text-2xl font-bold">{imgDetections.filter(d => d.severity === "alto").length}</div>
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-severity-medium" />
                          Media
                        </div>
                        <div className="text-2xl font-bold">{imgDetections.filter(d => d.severity === "medio").length}</div>
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-severity-low" />
                          Baja
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
    </div>
  )
}
