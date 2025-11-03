"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download, Eye, FileCheck } from "lucide-react"
import { useState } from "react"

export default function InformesPage() {
  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => setGenerating(false), 3000)
  }

  const reportSections = [
    { id: "cover", label: "Portada", checked: true },
    { id: "index", label: "Índice", checked: true },
    { id: "intro", label: "Introducción y Contexto", checked: true },
    { id: "scope", label: "Alcance de la Inspección", checked: true },
    { id: "references", label: "Referencias Normativas", checked: false },
    { id: "methodology", label: "Metodología (Dron + IA)", checked: true },
    { id: "technical", label: "Observaciones Técnicas", checked: true },
    { id: "results", label: "Condición Observada / Resultados", checked: true },
    { id: "measurements", label: "Mediciones y Datos Técnicos", checked: true },
    { id: "severity", label: "Análisis de Severidad", checked: true },
    { id: "photos", label: "Anexo Fotográfico", checked: true },
    { id: "maps", label: "Vista de Ubicación (Google Maps)", checked: true },
    { id: "conclusions", label: "Conclusiones", checked: true },
    { id: "recommendations", label: "Recomendaciones", checked: true },
  ]

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 overflow-auto">
        <div className="flex h-16 items-center justify-between border-b border-border px-8">
          <div>
            <h1 className="text-xl font-semibold">Generación de Informes</h1>
            <p className="text-sm text-muted-foreground">Informes técnicos profesionales con análisis IA</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="mr-2 h-4 w-4" />
              {showPreview ? "Ocultar" : "Vista Previa"}
            </Button>
            <Button size="sm" onClick={handleGenerate} disabled={generating}>
              <Download className="mr-2 h-4 w-4" />
              {generating ? "Generando..." : "Generar Informe"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 p-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5 text-primary" />
                Datos del Proyecto
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="work-number">Nº de Obra</Label>
                    <Input id="work-number" placeholder="25.00015.45.41" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order-number">Nº de Pedido</Label>
                    <Input id="order-number" placeholder="4508838917" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-name">Nombre del Proyecto</Label>
                  <Input id="project-name" placeholder="Inspección de estructura metálica..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installation-code">Código de Instalación</Label>
                  <Input id="installation-code" placeholder="1-1-01-VCD-050006-PES00028" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localización</Label>
                  <Input id="location" placeholder="Puente sobre Río, Ciudad, Provincia" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inspection-date">Fecha de Inspección</Label>
                    <Input id="inspection-date" type="date" defaultValue="2025-01-15" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-date">Fecha del Informe</Label>
                    <Input id="report-date" type="date" defaultValue="2025-01-20" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inspector">Elaborado por</Label>
                    <Input id="inspector" placeholder="Nombre del Inspector" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewer">Revisado por</Label>
                    <Input id="reviewer" placeholder="Nombre del Revisor" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Cliente / Organización</Label>
                  <Input id="client" placeholder="Nombre de la empresa cliente" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <FileCheck className="h-5 w-5 text-accent" />
                Configuración del Informe
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Formato de Exportación</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">DOCX (Word)</SelectItem>
                      <SelectItem value="both">PDF + DOCX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Secciones del Informe</Label>
                  <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                    {reportSections.map((section) => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <Checkbox id={section.id} defaultChecked={section.checked} />
                        <label
                          htmlFor={section.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {section.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-analysis">Análisis IA (GPT-4)</Label>
                  <Select defaultValue="enabled">
                    <SelectTrigger id="ai-analysis">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Activado - Análisis completo</SelectItem>
                      <SelectItem value="summary">Solo resumen ejecutivo</SelectItem>
                      <SelectItem value="disabled">Desactivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto de la Inspección</Label>
                  <Textarea
                    id="subject"
                    placeholder="Inspección visual con registro fotográfico, medición de espesuras y evaluación de la protección anticorrosiva..."
                    className="min-h-[60px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observaciones Adicionales</Label>
                  <Textarea
                    id="notes"
                    placeholder="Notas complementarias sobre la inspección..."
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {showPreview ? (
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Vista Previa del Informe</h2>

                <div className="max-h-[800px] space-y-6 overflow-y-auto rounded-lg border-2 border-border bg-white p-8 text-foreground shadow-lg">
                  {/* Cover Page */}
                  <div className="space-y-8 border-b-2 border-border pb-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-3xl font-bold text-primary">IKUSKI</div>
                        <div className="text-xs text-muted-foreground">AI RUST DETECTION</div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>Dirección de Inspección</div>
                        <div>Enero 2025</div>
                      </div>
                    </div>

                    <div className="space-y-4 border-y border-border py-6 text-center">
                      <h1 className="text-2xl font-bold uppercase">Relatório de Inspeção</h1>
                      <h2 className="text-xl font-semibold text-primary">Inspection Report</h2>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="font-semibold">Cliente:</span>
                        <span>Empresa Industrial S.A.</span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="font-semibold">Obra nº:</span>
                        <span>25.00015.45.41</span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="font-semibold">Nº relatório:</span>
                        <span>2501</span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="font-semibold">Localización:</span>
                        <span>Puente Industrial, Bilbao, País Vasco</span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="font-semibold">Asunto:</span>
                        <span>
                          Inspección visual mediante dron con registro fotográfico y detección automática de corrosión
                          mediante IA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Index */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold">ÍNDICE</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>1. Introducción</span>
                        <span>1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Alcance de la Inspección</span>
                        <span>1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3. Referencias Normativas</span>
                        <span>2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>4. Observaciones Complementarias</span>
                        <span>3</span>
                      </div>
                      <div className="flex justify-between">
                        <span>5. Condición Observada</span>
                        <span>4</span>
                      </div>
                      <div className="flex justify-between">
                        <span>6. Conclusiones</span>
                        <span>8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>7. Vista de Ubicación</span>
                        <span>9</span>
                      </div>
                      <div className="flex justify-between">
                        <span>8. Anexo Fotográfico</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>

                  {/* Introduction */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold">1. Introducción</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Se realizó una inspección mediante captura aérea con dron equipado con cámara de alta resolución
                      de la estructura metálica del Puente Industrial. Las imágenes capturadas fueron procesadas
                      mediante sistema de visión artificial para detectar automáticamente áreas con presencia de
                      corrosión y clasificarlas según su nivel de severidad.
                    </p>
                  </div>

                  {/* Scope */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold">2. Alcance de la Inspección</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      El trabajo de inspección consistió en la evaluación de la condición/integridad de la estructura
                      metálica, teniendo en cuenta:
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      <li>Estructura metálica - evaluación del estado y protección anticorrosiva</li>
                      <li>Detección automática de corrosión mediante modelo entrenado</li>
                      <li>Clasificación de severidad (Bajo, Medio, Alto)</li>
                      <li>Registro fotográfico georreferenciado</li>
                      <li>Analisis de envolvente y accesibilidad</li>
                    </ul>
                  </div>

                  {/* References */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold">3. Referencias Normativas</h3>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      <li>ISO 8501-1 - Preparación de substratos de acero antes de la aplicación de pinturas</li>
                      <li>ISO 4628 - Evaluación de la degradación de revestimientos</li>
                      <li>UNE-EN ISO 12944 - Protección de estructuras de acero frente a la corrosión</li>
                      <li>Especificaciones técnicas del cliente</li>
                      <li>Proyecto de construcción de la estructura</li>
                    </ul>
                  </div>

                  {/* Technical Observations */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold">4. Observaciones Complementarias</h3>
                    <p className="text-sm font-semibold">Características de la estructura:</p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      <li>Estructura metálica en acero al carbono</li>
                      <li>Protección anticorrosiva mediante pintura epoxi</li>
                      <li>Exposición a ambiente industrial (categoría C4)</li>
                      <li>Año de construcción: 2015</li>
                      <li>Última inspección: Enero 2023</li>
                    </ul>
                    <p className="mt-3 text-sm font-semibold">Metodología de inspección:</p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      <li>Captura aérea mediante dron DJI Mavic 3 Enterprise</li>
                      <li>Cámara de 20MP con zoom óptico 56x</li>
                      <li>Procesamiento mediante visión artificial entrenada</li>
                      <li>Georreferenciación de todas las imágenes capturadas</li>
                      <li>Clasificación automática en tres niveles de severidad</li>
                    </ul>
                  </div>

                  {/* Results Table */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold">5. Condición Observada</h3>
                    <p className="text-sm font-semibold">5.1 - Inspección Visual de la Estructura Metálica</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      La estructura metálica evidencia diversos puntos de corrosión distribuidos a lo largo de su
                      superficie. Se identificaron 47 áreas con presencia de corrosión, clasificadas según su nivel de
                      severidad:
                    </p>
                    <table className="w-full border border-border text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border border-border p-2 text-left font-semibold">Nivel de Severidad</th>
                          <th className="border border-border p-2 text-center font-semibold">Nº Detecciones</th>
                          <th className="border border-border p-2 text-center font-semibold">Porcentaje</th>
                          <th className="border border-border p-2 text-center font-semibold">Confianza Media</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-2">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full bg-severity-low"></span>
                              Bajo (Low)
                            </span>
                          </td>
                          <td className="border border-border p-2 text-center">23</td>
                          <td className="border border-border p-2 text-center">48.9%</td>
                          <td className="border border-border p-2 text-center">87.3%</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-2">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full bg-severity-medium"></span>
                              Medio (Medium)
                            </span>
                          </td>
                          <td className="border border-border p-2 text-center">18</td>
                          <td className="border border-border p-2 text-center">38.3%</td>
                          <td className="border border-border p-2 text-center">91.2%</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-2">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full bg-severity-high"></span>
                              Alto (High)
                            </span>
                          </td>
                          <td className="border border-border p-2 text-center">6</td>
                          <td className="border border-border p-2 text-center">12.8%</td>
                          <td className="border border-border p-2 text-center">94.7%</td>
                        </tr>
                        <tr className="bg-muted font-semibold">
                          <td className="border border-border p-2">Total</td>
                          <td className="border border-border p-2 text-center">47</td>
                          <td className="border border-border p-2 text-center">100%</td>
                          <td className="border border-border p-2 text-center">89.8%</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Detailed Findings */}
                    <p className="mt-4 text-sm font-semibold">5.2 - Hallazgos Principales</p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      <li>Corrosión ligera/moderada en zonas de unión soldada (fotografías 1 a 8)</li>
                      <li>Degradación de la protección anticorrosiva en áreas expuestas a mayor humedad</li>
                      <li>Corrosión severa localizada en 6 puntos críticos que requieren intervención inmediata</li>
                      <li>Las mediciones de espesor no evidencian pérdida significativa de material</li>
                      <li>La estructura mantiene su integridad estructural general</li>
                    </ul>
                  </div>

                  {/* Conclusions */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold">6. Conclusiones</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      No se identificó ningún riesgo inmediato a la integridad estructural. Se recomienda, sin embargo,
                      en una próxima intervención realizar las siguientes tareas:
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      <li>Intervención inmediata en las 6 áreas de severidad alta detectadas</li>
                      <li>Beneficiación total de la protección anticorrosiva en áreas afectadas</li>
                      <li>Planificar mantenimiento preventivo para áreas de severidad media</li>
                      <li>Monitoreo continuo mediante inspecciones periódicas con dron</li>
                      <li>Realizar nueva inspección en 6 meses para evaluar evolución</li>
                    </ul>
                  </div>

                  {/* Google Maps */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold">7. Vista de Ubicación</h3>
                    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        [Mapa de Google Maps con ubicación de la estructura]
                        <br />
                        Coordenadas: 43.2627° N, 2.9253° W
                      </div>
                    </div>
                  </div>

                  {/* Photo Annex */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">8. Anexo Fotográfico</h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            [Fotografía 1 - Imagen de dron con detección marcada]
                          </div>
                        </div>
                        <p className="text-xs font-semibold">Fotografía 1</p>
                        <p className="text-xs text-muted-foreground">
                          Corrosión moderada en viga principal. Nivel de severidad: Medio.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Coordenadas GPS: 43.2627° N, 2.9253° W | Altitud: 45m | Fecha: 15/01/2025 10:23
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            [Fotografía 2 - Imagen de dron con detección marcada]
                          </div>
                        </div>
                        <p className="text-xs font-semibold">Fotografía 2</p>
                        <p className="text-xs text-muted-foreground">
                          Corrosión severa en unión soldada. Nivel de severidad: Alto.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Coordenadas GPS: 43.2629° N, 2.9251° W | Altitud: 48m | Fecha: 15/01/2025 10:25
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            [Fotografía 3 - Imagen de dron con detección marcada]
                          </div>
                        </div>
                        <p className="text-xs font-semibold">Fotografía 3</p>
                        <p className="text-xs text-muted-foreground">
                          Corrosión ligera en superficie lateral. Nivel de severidad: Bajo.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Coordenadas GPS: 43.2625° N, 2.9255° W | Altitud: 42m | Fecha: 15/01/2025 10:28
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t-2 border-border pt-6 text-center">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Data da Inspeção: 15/01/2025</span>
                        <span>Elaborado por: Ing. María González</span>
                        <span>Data: 20/01/2025</span>
                      </div>
                      <div className="pt-4 font-semibold">
                        Generado por IKUSKI - Sistema de Detección de Corrosión mediante IA
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold">Informes Recientes</h2>
                <div className="space-y-3">
                  {[
                    {
                      name: "Puente Industrial A-23",
                      code: "1901",
                      date: "15 Ene 2025",
                      detections: 47,
                      severity: "high",
                    },
                    {
                      name: "Torre Metálica B-15",
                      code: "1902",
                      date: "12 Ene 2025",
                      detections: 23,
                      severity: "medium",
                    },
                    {
                      name: "Estructura C-45",
                      code: "1903",
                      date: "08 Ene 2025",
                      detections: 31,
                      severity: "medium",
                    },
                    { name: "Tanque D-12", code: "1904", date: "05 Ene 2025", detections: 15, severity: "low" },
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
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Nº {report.code}</span>
                            <span>•</span>
                            <span>{report.detections} detecciones</span>
                            <span>•</span>
                            <span>{report.date}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Estadísticas de Informes</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-xs text-muted-foreground">Total Informes</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-xs text-muted-foreground">Este Mes</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-xs text-muted-foreground">Detecciones Totales</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-xs text-muted-foreground">Áreas Inspeccionadas</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
