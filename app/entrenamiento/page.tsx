"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Square, Download, FolderOpen, Settings2 } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const mockTrainingData = [
  { epoch: 0, map: 0, loss: 2.5 },
  { epoch: 10, map: 0.45, loss: 1.8 },
  { epoch: 20, map: 0.62, loss: 1.2 },
  { epoch: 30, map: 0.75, loss: 0.8 },
  { epoch: 40, map: 0.83, loss: 0.5 },
  { epoch: 50, map: 0.88, loss: 0.3 },
]

export default function EntrenamientoPage() {
  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <main className="flex flex-1 flex-col overflow-auto">
        {/* Top Toolbar */}
        <div className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm">
              <Play className="mr-2 h-4 w-4" />
              Iniciar Entrenamiento
            </Button>
            <Button variant="outline" size="sm">
              <Square className="mr-2 h-4 w-4" />
              Detener
            </Button>
            <Button variant="outline" size="sm">
              <FolderOpen className="mr-2 h-4 w-4" />
              Cargar Dataset
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
                  <div className="h-full w-1/2 bg-primary transition-all" />
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

            {/* Training Configuration */}
            <Card className="p-6">
              <h3 className="mb-4 text-sm font-medium">Configuración Actual</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground">Modelo Base</div>
                  <div className="mt-1 font-medium">YOLOv8n</div>
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
                  <div className="text-sm text-muted-foreground">Clases</div>
                  <div className="mt-1 font-medium">3 (Bajo, Medio, Alto)</div>
                </div>
              </div>
            </Card>

            {/* Saved Models */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium">Modelos Guardados</h3>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
              <div className="space-y-2">
                {[
                  { name: "yolov8n_rust_v3.pt", date: "2024-01-15", map: "88.2%", size: "6.2 MB" },
                  { name: "yolov8n_rust_v2.pt", date: "2024-01-10", map: "85.7%", size: "6.2 MB" },
                  { name: "yolov8n_rust_v1.pt", date: "2024-01-05", map: "82.1%", size: "6.2 MB" },
                ].map((model) => (
                  <div
                    key={model.name}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-accent/50"
                  >
                    <div>
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.date}</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">mAP: </span>
                        <span className="font-medium">{model.map}</span>
                      </div>
                      <div className="text-muted-foreground">{model.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
