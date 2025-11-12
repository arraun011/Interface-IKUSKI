"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Grid2x2, List, X, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ImageItem {
  id: string
  url: string
  filename: string
  size?: string
  timestamp?: string
}

interface ImageGalleryProps {
  images: ImageItem[]
  selectedImageId?: string | null
  onSelectImage: (image: ImageItem) => void
  onRemoveImage?: (imageId: string) => void
  showMetadata?: boolean
  // Report marking
  markedForReport?: string[]
  onToggleMarkForReport?: (imageId: string) => void
  showReportMarkers?: boolean
}

export function ImageGallery({
  images,
  selectedImageId,
  onSelectImage,
  onRemoveImage,
  showMetadata = false,
  markedForReport = [],
  onToggleMarkForReport,
  showReportMarkers = false
}: ImageGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredImages = images.filter(img =>
    img.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col">
      {/* Search and View Controls */}
      <div className="border-b border-border p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar imágenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 rounded-lg border border-border p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("grid")}
            >
              <Grid2x2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Image Count and Report Info */}
      <div className="border-b border-border px-3 py-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filteredImages.length} {filteredImages.length === 1 ? "imagen" : "imágenes"}
            {searchTerm && ` (filtradas de ${images.length})`}
          </p>
          {showReportMarkers && markedForReport.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              <FileText className="mr-1 h-3 w-3" />
              {markedForReport.length} para informe
            </Badge>
          )}
        </div>
      </div>

      {/* Images Grid/List */}
      <div className="flex-1 overflow-auto p-3">
        {filteredImages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "No se encontraron imágenes" : "No hay imágenes cargadas"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className={`group relative cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md ${
                  selectedImageId === img.id
                    ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "border-border hover:border-primary"
                }`}
                onClick={() => onSelectImage(img)}
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>

                {/* Report Checkbox */}
                {showReportMarkers && onToggleMarkForReport && (
                  <div
                    className="absolute left-2 top-2 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-background/90 backdrop-blur">
                      <Checkbox
                        checked={markedForReport.includes(img.id)}
                        onCheckedChange={() => onToggleMarkForReport(img.id)}
                      />
                    </div>
                  </div>
                )}

                {/* Remove Button */}
                {onRemoveImage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveImage(img.id)
                    }}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 opacity-0 transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3 text-destructive-foreground" />
                  </button>
                )}

                {/* Selection Indicator */}
                {selectedImageId === img.id && (
                  <div className={`absolute ${showReportMarkers ? "left-10" : "left-2"} top-2`}>
                    <Badge variant="default" className="text-xs">
                      Seleccionada
                    </Badge>
                  </div>
                )}

                {/* Metadata */}
                {showMetadata && (
                  <div className="bg-card/95 p-2 backdrop-blur">
                    <p className="truncate text-xs font-medium" title={img.filename}>
                      {img.filename}
                    </p>
                    {img.size && (
                      <p className="text-xs text-muted-foreground">{img.size}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredImages.map((img) => (
              <Card
                key={img.id}
                className={`cursor-pointer p-3 transition-all hover:shadow-sm ${
                  selectedImageId === img.id
                    ? "border-primary ring-2 ring-primary"
                    : ""
                }`}
                onClick={() => onSelectImage(img)}
              >
                <div className="flex items-center gap-3">
                  {/* Report Checkbox */}
                  {showReportMarkers && onToggleMarkForReport && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={markedForReport.includes(img.id)}
                        onCheckedChange={() => onToggleMarkForReport(img.id)}
                      />
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded border border-border">
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium" title={img.filename}>
                      {img.filename}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      {img.size && <span>{img.size}</span>}
                      {img.timestamp && (
                        <>
                          {img.size && <span>•</span>}
                          <span>{img.timestamp}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  {onRemoveImage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveImage(img.id)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
