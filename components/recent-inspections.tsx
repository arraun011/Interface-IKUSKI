import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"

const inspections = [
  {
    id: "INS-2024-001",
    location: "Bridge Section A-12",
    date: "2024-01-15",
    status: "critical",
    detections: 23,
    confidence: 94.2,
  },
  {
    id: "INS-2024-002",
    location: "Pipeline Zone B-8",
    date: "2024-01-14",
    status: "warning",
    detections: 12,
    confidence: 89.7,
  },
  {
    id: "INS-2024-003",
    location: "Storage Tank C-5",
    date: "2024-01-14",
    status: "normal",
    detections: 3,
    confidence: 96.1,
  },
  {
    id: "INS-2024-004",
    location: "Tower Structure D-3",
    date: "2024-01-13",
    status: "warning",
    detections: 8,
    confidence: 91.5,
  },
]

export function RecentInspections() {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recent Inspections</h3>
          <p className="text-sm text-muted-foreground">Latest drone analysis results</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {inspections.map((inspection) => (
          <div
            key={inspection.id}
            className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                {inspection.status === "critical" && <AlertTriangle className="h-6 w-6 text-destructive" />}
                {inspection.status === "warning" && <AlertCircle className="h-6 w-6 text-accent" />}
                {inspection.status === "normal" && <CheckCircle2 className="h-6 w-6 text-chart-5" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-medium">{inspection.id}</p>
                  <Badge
                    variant={
                      inspection.status === "critical"
                        ? "destructive"
                        : inspection.status === "warning"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {inspection.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{inspection.location}</p>
                <p className="text-xs text-muted-foreground">{inspection.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium">{inspection.detections} detections</p>
                <p className="text-xs text-muted-foreground">{inspection.confidence}% confidence</p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
