"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Download, Play, Filter, ImageIcon } from "lucide-react"
import { useState } from "react"

export default function AnalisisPage() {
  const [detections, setDetections] = useState([
    {
      id: 1,
      image: "IMG_0234.jpg",
      severity: "alto",
      confidence: 0.94,
      bbox: { x: 120, y: 80, w: 200, h: 150 },
      timestamp: "2024-01-15 14:23",
    },
    {
      id: 2,
      image: "IMG_0235.jpg",
      severity: "medio",
      confidence: 0.87,
      bbox: { x: 340, y: 120, w: 180, h: 140 },
      timestamp: "2024-01-15 14:24",
    },
    {
      id: 3,
      image: "IMG_0236.jpg",
      severity: "bajo",
      confidence: 0.76,
      bbox: { x: 220, y: 200, w: 160, h: 120 },
      timestamp: "2024-01-15 14:25",
    },
  ])

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

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Cargar Imágenes
            </Button>
            <Button variant="default" size="sm">
              <Play className="mr-2 h-4 w-4" />
              Analizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar Resultados
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Viewer Area */}
          <div className="flex flex-1 flex-col">
            {/* Image Viewer */}
            <div className="flex flex-1 items-center justify-center bg-muted/20 p-8">
              <div className="relative flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-card">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Selecciona una imagen de la lista o carga nuevas imágenes
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Formatos soportados: JPG, PNG, TIFF</p>
                </div>
              </div>
            </div>

            {/* Detection Info Bar */}
            <div className="border-t border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs text-muted-foreground">Detecciones</div>
                    <div className="text-lg font-semibold">{detections.length}</div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <div className="text-xs text-muted-foreground">Confianza Media</div>
                    <div className="text-lg font-semibold">85.7%</div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-severity-high" />
                      <span className="text-sm">1</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-severity-medium" />
                      <span className="text-sm">1</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-severity-low" />
                      <span className="text-sm">1</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Modelo: YOLOv8n_rust_v3.pt</div>
              </div>
            </div>
          </div>

          {/* Right Panel - Detections List */}
          <div className="w-96 border-l border-border bg-card">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b border-border p-4">
                <h3 className="text-sm font-medium">Detecciones Encontradas</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {detections.length} áreas de corrosión identificadas
                </p>
              </div>

              {/* Detections List */}
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-3">
                  {detections.map((detection) => (
                    <Card key={detection.id} className="cursor-pointer p-4 transition-colors hover:bg-accent/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${getSeverityColor(detection.severity)}`} />
                            <span className="text-sm font-medium capitalize">{detection.severity}</span>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">{detection.image}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{detection.timestamp}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{(detection.confidence * 100).toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">confianza</div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Posición: </span>
                          <span className="font-medium">
                            {detection.bbox.x}, {detection.bbox.y}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tamaño: </span>
                          <span className="font-medium">
                            {detection.bbox.w}×{detection.bbox.h}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Processing Options */}
              <div className="border-t border-border p-4">
                <h3 className="mb-3 text-sm font-medium">Opciones de Procesamiento</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span>Filtro de duplicados (pHash)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span>Corrección CLAHE</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Extraer metadatos EXIF</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
