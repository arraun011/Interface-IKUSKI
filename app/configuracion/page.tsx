"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Key, FolderOpen, Palette, Save } from "lucide-react"
import { useState } from "react"

export default function ConfiguracionPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <div className="flex-1 overflow-auto">
        <div className="flex h-16 items-center justify-between border-b border-border px-8">
          <div>
            <h1 className="text-xl font-semibold">Configuración</h1>
            <p className="text-sm text-muted-foreground">Ajusta los parámetros del sistema</p>
          </div>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            {saved ? "Guardado ✓" : "Guardar Cambios"}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6 p-8">
          <div className="col-span-2 space-y-6">
            {/* Model Configuration */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Brain className="h-5 w-5 text-primary" />
                Configuración del Modelo
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model-select">Modelo YOLO Activo</Label>
                  <Select defaultValue="yolov8n">
                    <SelectTrigger id="model-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yolov8n">YOLOv8n (Rápido)</SelectItem>
                      <SelectItem value="yolov8s">YOLOv8s (Balanceado)</SelectItem>
                      <SelectItem value="yolov8m">YOLOv8m (Preciso)</SelectItem>
                      <SelectItem value="yolov8l">YOLOv8l (Muy Preciso)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="confidence">Umbral de Confianza</Label>
                    <div className="flex items-center gap-2">
                      <Input id="confidence" type="number" min="0" max="1" step="0.05" defaultValue="0.5" />
                      <span className="text-sm text-muted-foreground">50%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iou">Umbral IoU (NMS)</Label>
                    <div className="flex items-center gap-2">
                      <Input id="iou" type="number" min="0" max="1" step="0.05" defaultValue="0.45" />
                      <span className="text-sm text-muted-foreground">45%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="img-size">Tamaño de Imagen (px)</Label>
                  <Select defaultValue="640">
                    <SelectTrigger id="img-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="320">320x320 (Rápido)</SelectItem>
                      <SelectItem value="640">640x640 (Recomendado)</SelectItem>
                      <SelectItem value="1280">1280x1280 (Alta calidad)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="phash" defaultChecked />
                  <Label htmlFor="phash" className="cursor-pointer">
                    Activar filtro pHash (eliminar duplicados)
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="clahe" defaultChecked />
                  <Label htmlFor="clahe" className="cursor-pointer">
                    Aplicar corrección CLAHE (mejorar contraste)
                  </Label>
                </div>
              </div>
            </Card>

            {/* API Keys */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Key className="h-5 w-5 text-accent" />
                Claves API
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key (GPT-4)</Label>
                  <Input id="openai-key" type="password" placeholder="sk-..." />
                  <p className="text-xs text-muted-foreground">Necesaria para generación de informes con IA</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="azure-key">Azure Computer Vision (Opcional)</Label>
                  <Input id="azure-key" type="password" placeholder="Clave de Azure..." />
                </div>
              </div>
            </Card>

            {/* Paths Configuration */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <FolderOpen className="h-5 w-5 text-primary" />
                Rutas y Directorios
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataset-path">Ruta de Datasets</Label>
                  <div className="flex gap-2">
                    <Input id="dataset-path" defaultValue="C:/IKUSKI/data/datasets" readOnly />
                    <Button variant="outline" size="sm">
                      Cambiar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="models-path">Ruta de Modelos</Label>
                  <div className="flex gap-2">
                    <Input id="models-path" defaultValue="C:/IKUSKI/data/models" readOnly />
                    <Button variant="outline" size="sm">
                      Cambiar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reports-path">Ruta de Informes</Label>
                  <div className="flex gap-2">
                    <Input id="reports-path" defaultValue="C:/IKUSKI/reports" readOnly />
                    <Button variant="outline" size="sm">
                      Cambiar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Settings */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Palette className="h-5 w-5" />
                Apariencia
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select defaultValue="light">
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select defaultValue="es">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="eu">Euskera</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Clasificación de Severidad</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[var(--severity-low)]" />
                    <span className="text-sm font-medium">Bajo</span>
                  </div>
                  <span className="text-xs text-muted-foreground">0-30%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[var(--severity-medium)]" />
                    <span className="text-sm font-medium">Medio</span>
                  </div>
                  <span className="text-xs text-muted-foreground">30-70%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[var(--severity-high)]" />
                    <span className="text-sm font-medium">Alto</span>
                  </div>
                  <span className="text-xs text-muted-foreground">70-100%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Sistema</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Versión</span>
                  <span className="font-mono">v1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ONNX Runtime</span>
                  <span className="font-mono">1.16.3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">OpenCV</span>
                  <span className="font-mono">4.8.1</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
