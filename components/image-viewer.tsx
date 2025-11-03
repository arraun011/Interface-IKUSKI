"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Grid3x3,
  Layers,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ImageViewer() {
  const [showDetections, setShowDetections] = useState(true)
  const [opacity, setOpacity] = useState([75])

  return (
    <div className="relative flex flex-1 flex-col bg-muted/30">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Inspection_2024_001.jpg</span>
            <span className="text-xs text-muted-foreground">Bridge Section A - North Face</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Processed
          </Badge>
          <span className="text-xs text-muted-foreground">4096 × 3072 px</span>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Placeholder for drone image with rust detection overlay */}
        <div className="flex h-full items-center justify-center bg-muted/50">
          <img src="/aerial-drone-view-of-industrial-metal-structure-wi.jpg" alt="Drone inspection" className="h-full w-full object-contain" />

          {/* Detection Overlay */}
          {showDetections && (
            <div className="absolute inset-0" style={{ opacity: opacity[0] / 100 }}>
              {/* Simulated detection boxes */}
              <div className="absolute left-[20%] top-[30%] h-32 w-40 border-2 border-destructive bg-destructive/10">
                <div className="absolute -top-6 left-0 rounded bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                  Rust 94%
                </div>
              </div>
              <div className="absolute left-[60%] top-[45%] h-24 w-32 border-2 border-accent bg-accent/10">
                <div className="absolute -top-6 left-0 rounded bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                  Rust 87%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Controls - Bottom Left */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          <div className="flex gap-1 rounded-lg border border-border bg-card/95 p-1 shadow-lg backdrop-blur">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1 rounded-lg border border-border bg-card/95 p-1 shadow-lg backdrop-blur">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Detection Toggle - Bottom Right */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <div className="rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-medium">Detections</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowDetections(!showDetections)}
              >
                {showDetections ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Opacity</span>
              <Slider
                value={opacity}
                onValueChange={setOpacity}
                max={100}
                step={5}
                className="w-24"
                disabled={!showDetections}
              />
              <span className="text-xs font-medium">{opacity[0]}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
