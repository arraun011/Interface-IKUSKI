"use client"

import { useState, useEffect, useRef } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  RefreshCw,
  Move,
  Grid3x3
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface BoundingBox {
  x: number
  y: number
  w: number
  h: number
  label?: string
  confidence?: number
  severity?: "alto" | "medio" | "bajo"
}

interface AdvancedImageViewerProps {
  imageUrl: string | null
  imageName?: string
  boundingBoxes?: BoundingBox[]
  showBoundingBoxes?: boolean
  imageSize?: { width: number; height: number }
}

export function AdvancedImageViewer({
  imageUrl,
  imageName,
  boundingBoxes = [],
  showBoundingBoxes = true,
  imageSize
}: AdvancedImageViewerProps) {
  const [showDetections, setShowDetections] = useState(showBoundingBoxes)
  const [detectionOpacity, setDetectionOpacity] = useState([75])
  const [rotation, setRotation] = useState(0)
  const [showGrid, setShowGrid] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setShowDetections(showBoundingBoxes && boundingBoxes.length > 0)
  }, [showBoundingBoxes, boundingBoxes])

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageNaturalSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      })
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "alto":
        return "rgba(239, 68, 68, 0.8)" // red-500
      case "medio":
        return "rgba(234, 179, 8, 0.8)" // yellow-500
      case "bajo":
        return "rgba(34, 197, 94, 0.8)" // green-500
      default:
        return "rgba(59, 130, 246, 0.8)" // blue-500
    }
  }

  const getSeverityBgColor = (severity?: string) => {
    switch (severity) {
      case "alto":
        return "rgba(239, 68, 68, 0.2)"
      case "medio":
        return "rgba(234, 179, 8, 0.2)"
      case "bajo":
        return "rgba(34, 197, 94, 0.2)"
      default:
        return "rgba(59, 130, 246, 0.2)"
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  if (!imageUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8">
        <div className="text-center">
          <Move className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            Selecciona una imagen para visualizar
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Usa zoom, pan y otras herramientas para analizar la imagen
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative flex h-full flex-col bg-muted/20">
      {/* Top Info Bar */}
      {imageName && (
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
          <div>
            <p className="text-sm font-medium">{imageName}</p>
            {imageNaturalSize && (
              <p className="text-xs text-muted-foreground">
                {imageNaturalSize.width} × {imageNaturalSize.height} px
              </p>
            )}
          </div>
          {boundingBoxes.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <span className="text-xs">{boundingBoxes.length} detección{boundingBoxes.length !== 1 ? 'es' : ''}</span>
            </Badge>
          )}
        </div>
      )}

      {/* Main Image Area with Zoom/Pan */}
      <div className="relative flex-1 overflow-hidden">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={8}
          centerOnInit
          wheel={{ step: 0.1 }}
          doubleClick={{ mode: "reset" }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%"
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <div
                  className="relative"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: "transform 0.3s ease"
                  }}
                >
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt={imageName || "Image"}
                    className="max-h-[calc(100vh-200px)] max-w-full object-contain"
                    onLoad={handleImageLoad}
                    style={{
                      userSelect: "none"
                    }}
                  />

                  {/* Grid Overlay */}
                  {showGrid && (
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: "50px 50px"
                      }}
                    />
                  )}

                  {/* Bounding Boxes Overlay */}
                  {showDetections && boundingBoxes.length > 0 && imageRef.current && (
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        opacity: detectionOpacity[0] / 100
                      }}
                    >
                      {boundingBoxes.map((bbox, idx) => {
                        const imgElement = imageRef.current
                        if (!imgElement) return null

                        // Calculate actual rendered image dimensions
                        const renderedWidth = imgElement.offsetWidth
                        const renderedHeight = imgElement.offsetHeight

                        // Scale bounding box coordinates to match rendered image
                        const scaleX = renderedWidth / (imageNaturalSize?.width || renderedWidth)
                        const scaleY = renderedHeight / (imageNaturalSize?.height || renderedHeight)

                        return (
                          <div
                            key={idx}
                            className="absolute"
                            style={{
                              left: `${bbox.x * scaleX}px`,
                              top: `${bbox.y * scaleY}px`,
                              width: `${bbox.w * scaleX}px`,
                              height: `${bbox.h * scaleY}px`,
                              border: `2px solid ${getSeverityColor(bbox.severity)}`,
                              backgroundColor: getSeverityBgColor(bbox.severity),
                              borderRadius: "4px"
                            }}
                          >
                            {/* Label */}
                            {(bbox.label || bbox.confidence !== undefined) && (
                              <div
                                className="absolute -top-6 left-0 rounded px-2 py-0.5 text-xs font-medium text-white shadow-lg"
                                style={{
                                  backgroundColor: getSeverityColor(bbox.severity),
                                  whiteSpace: "nowrap"
                                }}
                              >
                                {bbox.label || "Detección"}
                                {bbox.confidence !== undefined && ` ${(bbox.confidence * 100).toFixed(0)}%`}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </TransformComponent>

              {/* Zoom Controls - Bottom Left */}
              <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                <div className="flex flex-col gap-1 rounded-lg border border-border bg-card/95 p-1 shadow-lg backdrop-blur">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => zoomIn()}
                    title="Acercar (Zoom In)"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => zoomOut()}
                    title="Alejar (Zoom Out)"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => resetTransform()}
                    title="Restablecer Vista"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <div className="my-1 h-px bg-border" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setRotation((r) => r + 90)}
                    title="Rotar 90°"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={showGrid ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowGrid(!showGrid)}
                    title="Mostrar/Ocultar Cuadrícula"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleFullscreen}
                    title="Pantalla Completa"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </TransformWrapper>

        {/* Detection Controls - Bottom Right */}
        {boundingBoxes.length > 0 && (
          <div className="absolute bottom-4 right-4">
            <div className="rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-medium">Detecciones</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowDetections(!showDetections)}
                  title={showDetections ? "Ocultar Detecciones" : "Mostrar Detecciones"}
                >
                  {showDetections ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Opacidad</span>
                <Slider
                  value={detectionOpacity}
                  onValueChange={setDetectionOpacity}
                  max={100}
                  min={10}
                  step={5}
                  className="w-24"
                  disabled={!showDetections}
                />
                <span className="w-8 text-xs font-medium">{detectionOpacity[0]}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="border-t border-border bg-card px-4 py-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Tip:</span> Usa la rueda del mouse para zoom, doble clic para restablecer, arrastra para mover la imagen
        </p>
      </div>
    </div>
  )
}
