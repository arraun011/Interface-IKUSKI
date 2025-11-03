"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Download, FileText } from "lucide-react"

export function DetectionPanel() {
  const detections = [
    {
      id: 1,
      severity: "critical",
      confidence: 94,
      area: "245 cm²",
      location: "Section A-1",
      coordinates: "X: 1024, Y: 768",
    },
    {
      id: 2,
      severity: "warning",
      confidence: 87,
      area: "156 cm²",
      location: "Section A-2",
      coordinates: "X: 2048, Y: 1152",
    },
    {
      id: 3,
      severity: "low",
      confidence: 72,
      area: "89 cm²",
      location: "Section B-1",
      coordinates: "X: 512, Y: 1536",
    },
  ]

  return (
    <div className="flex w-80 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Detection Results</h2>
        <p className="text-sm text-muted-foreground">3 rust areas detected</p>
      </div>

      {/* Summary Stats */}
      <div className="border-b border-border p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="text-xs text-muted-foreground">Total Area</div>
            <div className="text-lg font-semibold">490 cm²</div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="text-xs text-muted-foreground">Avg Confidence</div>
            <div className="text-lg font-semibold">84.3%</div>
          </div>
        </div>
      </div>

      {/* Detection List */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {detections.map((detection) => (
            <Card key={detection.id} className="cursor-pointer p-3 transition-colors hover:bg-muted/50">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      detection.severity === "critical"
                        ? "text-destructive"
                        : detection.severity === "warning"
                          ? "text-accent"
                          : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-medium">Detection #{detection.id}</span>
                </div>
                <Badge
                  variant={detection.severity === "critical" ? "destructive" : "secondary"}
                  className="text-xs capitalize"
                >
                  {detection.severity}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="font-medium text-foreground">{detection.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Area:</span>
                  <span className="font-medium text-foreground">{detection.area}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium text-foreground">{detection.location}</span>
                </div>
                <div className="text-xs text-muted-foreground/70">{detection.coordinates}</div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="border-t border-border p-4">
        <div className="space-y-2">
          <Button className="w-full gap-2" size="sm">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" className="w-full gap-2 bg-transparent" size="sm">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>
    </div>
  )
}
