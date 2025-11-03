"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Eye, Sparkles } from "lucide-react"
import { useState } from "react"

export default function InformesPage() {
  const [generating, setGenerating] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => setGenerating(false), 3000)
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 overflow-auto">
        <div className="flex h-16 items-center justify-between border-b border-border px-8">
          <div>
            <h1 className="text-xl font-semibold">Generación de Informes</h1>
            <p className="text-sm text-muted-foreground">Crea reportes automáticos con análisis IA</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Vista Previa
            </Button>
            <Button size="sm" onClick={handleGenerate} disabled={generating}>
              <Download className="mr-2 h-4 w-4" />
              {generating ? "Generando..." : "Generar Informe"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 p-8">
          {/* Configuration Panel */}
          <div className="col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5 text-primary" />
                Configuración del Informe
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Nombre del Proyecto</Label>
                    <Input id="project-name" placeholder="Ej: Inspección Puente A-23" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inspection-date">Fecha de Inspección</Label>
                    <Input id="inspection-date" type="date" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input id="location" placeholder="Ej: Bilbao, País Vasco" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspector">Inspector Responsable</Label>
                  <Input id="inspector" placeholder="Nombre del inspector" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Formato de Exportación</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">DOCX</SelectItem>
                      <SelectItem value="both">PDF + DOCX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observaciones generales de la inspección..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-accent" />
                Análisis con IA
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Sparkles className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium">Análisis Descriptivo con LLM</div>
                      <div className="text-sm text-muted-foreground">GPT-4 generará descripciones automáticas</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Secciones a Incluir</Label>
                  <div className="space-y-2">
                    {[
                      "Resumen Ejecutivo",
                      "Estadísticas de Detección",
                      "Análisis de Severidad",
                      "Imágenes con Anotaciones",
                      "Recomendaciones",
                      "Conclusiones",
                    ].map((section) => (
                      <label key={section} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">{section}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Reports */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Informes Recientes</h2>
              <div className="space-y-3">
                {[
                  { name: "Puente A-23", date: "2024-01-15", detections: 47 },
                  { name: "Torre Industrial B", date: "2024-01-12", detections: 23 },
                  { name: "Estructura C-45", date: "2024-01-08", detections: 31 },
                ].map((report, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{report.name}</div>
                        <div className="text-xs text-muted-foreground">{report.detections} detecciones</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Estadísticas</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Informes</span>
                  <span className="text-2xl font-bold">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Este Mes</span>
                  <span className="text-2xl font-bold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Detecciones Totales</span>
                  <span className="text-2xl font-bold">1,247</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
