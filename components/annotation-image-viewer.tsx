"use client"

import { useState, useEffect, useRef } from "react"
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch"
import { Button } from "@/components/ui/button"
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  RefreshCw,
  Move,
  Grid3x3,
  Crosshair,
  Hand
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface AnnotationBox {
  id: string
  x: number
  y: number
  width: number
  height: number
  severity: "bajo" | "medio" | "alto"
}

interface AnnotationImageViewerProps {
  imageUrl: string | null
  imageName?: string
  boxes: AnnotationBox[]
  onBoxAdd: (box: Omit<AnnotationBox, "id">) => void
  onBoxDelete?: (boxId: string) => void
  selectedSeverity: "bajo" | "medio" | "alto"
  drawingEnabled?: boolean
}

export function AnnotationImageViewer({
  imageUrl,
  imageName,
  boxes,
  onBoxAdd,
  onBoxDelete,
  selectedSeverity,
  drawingEnabled = true
}: AnnotationImageViewerProps) {
  const [showGrid, setShowGrid] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const [isDrawingMode, setIsDrawingMode] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentBox, setCurrentBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null)
  const [selectedBox, setSelectedBox] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const transformRef = useRef<ReactZoomPanPinchRef>(null)

  const severityColors = {
    bajo: "rgba(34, 197, 94, 0.8)",
    medio: "rgba(234, 179, 8, 0.8)",
    alto: "rgba(239, 68, 68, 0.8)"
  }

  const severityBgColors = {
    bajo: "rgba(34, 197, 94, 0.15)",
    medio: "rgba(234, 179, 8, 0.15)",
    alto: "rgba(239, 68, 68, 0.15)"
  }

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageNaturalSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      })
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

  // Manejar inicio de dibujo
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingMode || !drawingEnabled || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setCurrentBox({ startX: x, startY: y, endX: x, endY: y })
  }

  // Manejar movimiento del mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentBox || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCurrentBox({ ...currentBox, endX: x, endY: y })
  }

  // Finalizar dibujo
  const handleMouseUp = () => {
    if (!isDrawing || !currentBox || !imageRef.current || !imageNaturalSize) {
      setIsDrawing(false)
      setCurrentBox(null)
      return
    }

    const rect = imageRef.current.getBoundingClientRect()

    // Calcular el factor de escala entre la imagen renderizada y su tamaño natural
    const scaleX = imageNaturalSize.width / rect.width
    const scaleY = imageNaturalSize.height / rect.height

    // Convertir coordenadas a píxeles de imagen natural
    const x1 = Math.min(currentBox.startX, currentBox.endX) * scaleX
    const y1 = Math.min(currentBox.startY, currentBox.endY) * scaleY
    const x2 = Math.max(currentBox.startX, currentBox.endX) * scaleX
    const y2 = Math.max(currentBox.startY, currentBox.endY) * scaleY

    const width = x2 - x1
    const height = y2 - y1

    // Solo agregar si el box es suficientemente grande
    if (width > 10 && height > 10) {
      onBoxAdd({
        x: x1,
        y: y1,
        width,
        height,
        severity: selectedSeverity
      })
    }

    setIsDrawing(false)
    setCurrentBox(null)
  }

  const fitToView = () => {
    if (transformRef.current) {
      transformRef.current.centerView(1)
    }
  }

  if (!imageUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8">
        <div className="text-center">
          <Move className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            Carga una imagen para comenzar a etiquetar
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Dibuja bounding boxes sobre las áreas de corrosión
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
          <div className="flex items-center gap-2">
            {boxes.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <span className="text-xs">{boxes.length} anotación{boxes.length !== 1 ? 'es' : ''}</span>
              </Badge>
            )}
            <Badge variant={isDrawingMode ? "default" : "outline"} className="gap-1">
              {isDrawingMode ? <Crosshair className="h-3 w-3" /> : <Hand className="h-3 w-3" />}
              <span className="text-xs">{isDrawingMode ? "Dibujar" : "Navegar"}</span>
            </Badge>
          </div>
        </div>
      )}

      {/* Main Image Area with Zoom/Pan */}
      <div className="relative flex-1 overflow-hidden">
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.3}
          maxScale={8}
          centerOnInit
          wheel={{ step: 0.1, disabled: isDrawingMode }}
          panning={{ disabled: isDrawingMode }}
          doubleClick={{ mode: "reset", disabled: isDrawingMode }}
        >
          {({ zoomIn, zoomOut, resetTransform, centerView }) => (
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
                <div className="relative">
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

                  {/* Drawing Overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      cursor: isDrawingMode ? "crosshair" : "grab"
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {/* Bounding Boxes */}
                    {imageRef.current && imageNaturalSize && boxes.map((box) => {
                      const rect = imageRef.current!.getBoundingClientRect()
                      const scaleX = rect.width / imageNaturalSize.width
                      const scaleY = rect.height / imageNaturalSize.height

                      return (
                        <div
                          key={box.id}
                          className="absolute"
                          style={{
                            left: `${box.x * scaleX}px`,
                            top: `${box.y * scaleY}px`,
                            width: `${box.width * scaleX}px`,
                            height: `${box.height * scaleY}px`,
                            border: `2px solid ${severityColors[box.severity]}`,
                            backgroundColor: severityBgColors[box.severity],
                            borderRadius: "4px",
                            pointerEvents: "auto"
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedBox(box.id)
                          }}
                        >
                          {/* Label */}
                          <div
                            className="absolute -top-6 left-0 rounded px-2 py-0.5 text-xs font-medium text-white shadow-lg"
                            style={{
                              backgroundColor: severityColors[box.severity],
                              whiteSpace: "nowrap"
                            }}
                          >
                            {box.severity.toUpperCase()}
                          </div>

                          {/* Delete button on hover/selection */}
                          {(selectedBox === box.id) && onBoxDelete && (
                            <button
                              className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation()
                                onBoxDelete(box.id)
                                setSelectedBox(null)
                              }}
                            >
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )
                    })}

                    {/* Current drawing box */}
                    {isDrawing && currentBox && (
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: `${Math.min(currentBox.startX, currentBox.endX)}px`,
                          top: `${Math.min(currentBox.startY, currentBox.endY)}px`,
                          width: `${Math.abs(currentBox.endX - currentBox.startX)}px`,
                          height: `${Math.abs(currentBox.endY - currentBox.startY)}px`,
                          border: `2px dashed ${severityColors[selectedSeverity]}`,
                          backgroundColor: severityBgColors[selectedSeverity],
                          borderRadius: "4px"
                        }}
                      />
                    )}
                  </div>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={fitToView}
                    title="Ajustar a Vista"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <div className="my-1 h-px bg-border" />
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
                    variant={isDrawingMode ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsDrawingMode(!isDrawingMode)}
                    title={isDrawingMode ? "Modo Navegación" : "Modo Dibujo"}
                  >
                    {isDrawingMode ? <Crosshair className="h-4 w-4" /> : <Hand className="h-4 w-4" />}
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
      </div>

      {/* Help Text */}
      <div className="border-t border-border bg-card px-4 py-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Modo Dibujo:</span> Arrastra para crear bounding box •
          <span className="font-medium ml-2">Modo Navegación:</span> Rueda del mouse para zoom, arrastra para mover
        </p>
      </div>
    </div>
  )
}
