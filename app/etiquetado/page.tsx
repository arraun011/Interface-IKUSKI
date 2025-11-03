"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Upload, Save, Download, ZoomIn, ZoomOut, RotateCw, Trash2 } from "lucide-react"
import { useState } from "react"

export default function EtiquetadoPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<"bajo" | "medio" | "alto" | null>(null)
  const [annotations, setAnnotations] = useState<number>(0)

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
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar YOLO
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Anotaciones: {annotations}</span>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Canvas Area */}
          <div className="flex flex-1 flex-col">
            {/* Image Controls */}
            <div className="flex h-12 items-center justify-center gap-2 border-b border-border bg-card/50">
              <Button variant="ghost" size="sm">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <RotateCw className="h-4 w-4" />
              </Button>
              <div className="mx-4 h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground">100%</span>
            </div>

            {/* Canvas */}
            <div className="flex flex-1 items-center justify-center bg-muted/20 p-8">
              <div className="relative flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-card">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Arrastra una imagen aquí o haz clic en "Cargar Imágenes"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Annotation Tools */}
          <div className="w-80 border-l border-border bg-card">
            <div className="flex h-full flex-col">
              {/* Severity Selection */}
              <div className="border-b border-border p-4">
                <h3 className="mb-3 text-sm font-medium">Nivel de Severidad</h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedSeverity === "bajo" ? "default" : "outline"}
                    className="w-full justify-start bg-severity-low hover:bg-severity-low/90"
                    onClick={() => setSelectedSeverity("bajo")}
                  >
                    <div className="mr-2 h-3 w-3 rounded-full bg-severity-low" />
                    Bajo
                  </Button>
                  <Button
                    variant={selectedSeverity === "medio" ? "default" : "outline"}
                    className="w-full justify-start bg-severity-medium hover:bg-severity-medium/90"
                    onClick={() => setSelectedSeverity("medio")}
                  >
                    <div className="mr-2 h-3 w-3 rounded-full bg-severity-medium" />
                    Medio
                  </Button>
                  <Button
                    variant={selectedSeverity === "alto" ? "default" : "outline"}
                    className="w-full justify-start bg-severity-high hover:bg-severity-high/90"
                    onClick={() => setSelectedSeverity("alto")}
                  >
                    <div className="mr-2 h-3 w-3 rounded-full bg-severity-high" />
                    Alto
                  </Button>
                </div>
              </div>

              {/* Annotations List */}
              <div className="flex-1 overflow-auto p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium">Anotaciones</h3>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {annotations === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">No hay anotaciones todavía</p>
                  ) : null}
                </div>
              </div>

              {/* Dataset Stats */}
              <div className="border-t border-border p-4">
                <h3 className="mb-3 text-sm font-medium">Estadísticas del Dataset</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Train (80%)</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Val (10%)</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Test (10%)</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
