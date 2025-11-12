"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Upload, Save, Download, Trash2, ChevronLeft, ChevronRight, Plus, X, FileUp } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { AnnotationImageViewer, AnnotationBox } from "@/components/annotation-image-viewer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import yaml from "js-yaml"

interface ImageAnnotation {
  filename: string
  image: string
  boxes: AnnotationBox[]
}

interface ClassDefinition {
  id: string
  name: string
  color: string
}

export default function EtiquetadoPage() {
  const [images, setImages] = useState<ImageAnnotation[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedSeverity, setSelectedSeverity] = useState<"bajo" | "medio" | "alto">("bajo")
  const [boxes, setBoxes] = useState<AnnotationBox[]>([])
  const [classes, setClasses] = useState<ClassDefinition[]>([
    { id: "bajo", name: "bajo", color: "#22c55e" },
    { id: "medio", name: "medio", color: "#f59e0b" },
    { id: "alto", name: "alto", color: "#ef4444" }
  ])
  const [newClassName, setNewClassName] = useState("")
  const { toast } = useToast()

  const severityColors = {
    bajo: "#22c55e",
    medio: "#f59e0b",
    alto: "#ef4444"
  }

  // Cargar imágenes
  const handleLoadImages = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*'
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files) as File[]
      const newImages: ImageAnnotation[] = []

      for (const file of files) {
        const reader = new FileReader()
        reader.onload = (event) => {
          newImages.push({
            filename: file.name,
            image: event.target?.result as string,
            boxes: []
          })

          if (newImages.length === files.length) {
            setImages(newImages)
            setCurrentImageIndex(0)
            setBoxes([])
            toast({
              title: "Imágenes Cargadas",
              description: `${files.length} imágenes cargadas correctamente`
            })
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  // Agregar nuevo box
  const handleBoxAdd = (box: Omit<AnnotationBox, "id">) => {
    const newBox: AnnotationBox = {
      id: Date.now().toString(),
      ...box
    }

    setBoxes([...boxes, newBox])

    toast({
      title: "Anotación Agregada",
      description: `Severidad: ${box.severity.toUpperCase()}`
    })
  }

  // Eliminar box
  const handleDeleteBox = (id: string) => {
    setBoxes(boxes.filter(box => box.id !== id))

    toast({
      title: "Anotación Eliminada",
      description: "La anotación ha sido eliminada"
    })
  }

  // Añadir nueva clase
  const handleAddClass = () => {
    if (!newClassName.trim()) {
      toast({
        title: "Error",
        description: "Introduce un nombre para la clase",
        variant: "destructive"
      })
      return
    }

    // Verificar que no exista ya
    if (classes.some(c => c.name.toLowerCase() === newClassName.toLowerCase())) {
      toast({
        title: "Error",
        description: "Ya existe una clase con ese nombre",
        variant: "destructive"
      })
      return
    }

    // Generar color aleatorio
    const colors = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    const newClass: ClassDefinition = {
      id: newClassName.toLowerCase().replace(/\s+/g, '_'),
      name: newClassName,
      color: randomColor
    }

    setClasses([...classes, newClass])
    setNewClassName("")

    toast({
      title: "Clase Añadida",
      description: `La clase "${newClassName}" ha sido creada`
    })
  }

  // Eliminar clase
  const handleDeleteClass = (classId: string) => {
    // No permitir eliminar si solo queda una clase
    if (classes.length <= 1) {
      toast({
        title: "Error",
        description: "Debe haber al menos una clase",
        variant: "destructive"
      })
      return
    }

    // Eliminar boxes de esa clase también
    const updatedBoxes = boxes.filter(box => box.severity !== classId)
    setBoxes(updatedBoxes)

    // Eliminar la clase
    const updatedClasses = classes.filter(c => c.id !== classId)
    setClasses(updatedClasses)

    // Si era la clase seleccionada, cambiar a la primera disponible
    if (selectedSeverity === classId) {
      setSelectedSeverity(updatedClasses[0].id as any)
    }

    toast({
      title: "Clase Eliminada",
      description: `La clase ha sido eliminada junto con sus anotaciones`
    })
  }

  // Cargar anotaciones desde YAML
  const handleLoadAnnotations = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.yaml,.yml'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = yaml.load(text) as any

        if (!data.annotations || !Array.isArray(data.annotations)) {
          toast({
            title: "Error",
            description: "El archivo YAML debe contener un array 'annotations'",
            variant: "destructive"
          })
          return
        }

        // Cargar anotaciones
        let loadedCount = 0
        data.annotations.forEach((ann: any) => {
          if (ann.boxes && Array.isArray(ann.boxes)) {
            ann.boxes.forEach((box: any) => {
              if (box.x !== undefined && box.y !== undefined && box.width !== undefined && box.height !== undefined) {
                const newBox: AnnotationBox = {
                  id: Date.now().toString() + Math.random(),
                  x: box.x,
                  y: box.y,
                  width: box.width,
                  height: box.height,
                  severity: (box.class || box.severity || "bajo") as any
                }
                boxes.push(newBox)
                loadedCount++
              }
            })
          }
        })

        setBoxes([...boxes])

        toast({
          title: "Anotaciones Cargadas",
          description: `${loadedCount} anotaciones cargadas desde ${file.name}`
        })
      } catch (error) {
        console.error('Error loading annotations:', error)
        toast({
          title: "Error",
          description: "No se pudo leer el archivo YAML",
          variant: "destructive"
        })
      }
    }
    input.click()
  }

  // Guardar anotaciones de la imagen actual
  const handleSaveCurrentImage = () => {
    if (!images[currentImageIndex]) return

    const updatedImages = [...images]
    updatedImages[currentImageIndex].boxes = boxes
    setImages(updatedImages)

    toast({
      title: "Anotaciones Guardadas",
      description: `${boxes.length} anotaciones guardadas para ${images[currentImageIndex].filename}`
    })
  }

  // Navegar entre imágenes
  const handleNextImage = () => {
    handleSaveCurrentImage()
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
      setBoxes(images[currentImageIndex + 1].boxes)
    }
  }

  const handlePrevImage = () => {
    handleSaveCurrentImage()
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
      setBoxes(images[currentImageIndex - 1].boxes)
    }
  }

  // Exportar a formato YOLO
  const handleExportYOLO = async () => {
    try {
      const response = await fetch('/api/dataset/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Dataset Exportado",
          description: `${data.stats.train} train, ${data.stats.val} val`
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar el dataset",
        variant: "destructive"
      })
    }
  }

  const currentImage = images[currentImageIndex]
  const totalAnnotations = images.reduce((sum, img) => sum + img.boxes.length, 0)

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLoadImages}>
              <Upload className="mr-2 h-4 w-4" />
              Cargar Imágenes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveCurrentImage}
              disabled={!currentImage}
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleExportYOLO}
              disabled={images.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar YOLO
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadAnnotations}
            >
              <FileUp className="mr-2 h-4 w-4" />
              Cargar Anotaciones (.yaml)
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Total anotaciones: {totalAnnotations}
            </span>
            {currentImage && (
              <span className="text-sm text-muted-foreground">
                Imagen {currentImageIndex + 1} de {images.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Canvas Area */}
          <div className="flex flex-1 flex-col">
            {/* Image Navigation Controls */}
            {currentImage && (
              <div className="flex h-12 items-center justify-between border-b border-border bg-card/50 px-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevImage}
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextImage}
                    disabled={currentImageIndex === images.length - 1}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">{currentImage.filename}</span>
              </div>
            )}

            {/* Annotation Viewer with Zoom/Pan */}
            <div className="flex-1 overflow-hidden">
              <AnnotationImageViewer
                imageUrl={currentImage?.image || null}
                imageName={currentImage?.filename}
                boxes={boxes}
                onBoxAdd={handleBoxAdd}
                onBoxDelete={handleDeleteBox}
                selectedSeverity={selectedSeverity}
                drawingEnabled={true}
              />
            </div>
          </div>

          {/* Right Panel - Annotation Tools */}
          <div className="w-80 border-l border-border bg-card">
            <div className="flex h-full flex-col">
              {/* Class Management */}
              <div className="border-b border-border p-4">
                <h3 className="mb-3 text-sm font-medium">Clases ({classes.length})</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Selecciona la clase antes de dibujar el bounding box
                </p>

                {/* Class List */}
                <div className="mb-3 space-y-2">
                  {classes.map((cls) => (
                    <div key={cls.id} className="flex items-center gap-2">
                      <Button
                        variant={selectedSeverity === cls.id ? "default" : "outline"}
                        className="flex-1 justify-start"
                        onClick={() => setSelectedSeverity(cls.id as any)}
                        style={{
                          backgroundColor: selectedSeverity === cls.id ? cls.color : undefined,
                          borderColor: cls.color
                        }}
                      >
                        <div
                          className="mr-2 h-3 w-3 rounded-full"
                          style={{ backgroundColor: cls.color }}
                        />
                        {cls.name}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 flex-shrink-0"
                        onClick={() => handleDeleteClass(cls.id)}
                        disabled={classes.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add New Class */}
                <div className="space-y-2 border-t border-border pt-3">
                  <Label htmlFor="new-class" className="text-xs">Añadir Nueva Clase</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-class"
                      placeholder="Nombre de clase"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddClass()
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={handleAddClass}
                      disabled={!newClassName.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Annotations List */}
              <div className="flex-1 overflow-auto p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    Anotaciones ({boxes.length})
                  </h3>
                  {boxes.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBoxes([])}
                    >
                      Limpiar Todo
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {boxes.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No hay anotaciones todavía.
                      <br />
                      Dibuja un bounding box en la imagen.
                    </p>
                  ) : (
                    boxes.map((box, index) => (
                      <div
                        key={box.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-2 hover:bg-accent/50"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: severityColors[box.severity] }}
                          />
                          <div>
                            <div className="text-sm font-medium">
                              {box.severity.toUpperCase()} #{index + 1}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round(box.width)}×{Math.round(box.height)}px
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBox(box.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dataset Stats */}
              <div className="border-t border-border p-4">
                <h3 className="mb-3 text-sm font-medium">División del Dataset</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Train (80%)</span>
                    <span className="font-medium">
                      {Math.floor(images.filter(img => img.boxes.length > 0).length * 0.8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Val (20%)</span>
                    <span className="font-medium">
                      {Math.ceil(images.filter(img => img.boxes.length > 0).length * 0.2)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between font-semibold">
                      <span>Total Imágenes</span>
                      <span>{images.length}</span>
                    </div>
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
