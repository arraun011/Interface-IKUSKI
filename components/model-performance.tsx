import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const metrics = [
  { label: "Precision", value: 94.2, color: "bg-chart-1" },
  { label: "Recall", value: 91.8, color: "bg-chart-2" },
  { label: "F1 Score", value: 93.0, color: "bg-chart-3" },
  { label: "mAP@0.5", value: 89.5, color: "bg-chart-4" },
]

export function ModelPerformance() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Model Performance</h3>
        <p className="text-sm text-muted-foreground">YOLOv8 Rust Detection Model</p>
      </div>

      <div className="space-y-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{metric.label}</span>
              <span className="font-mono font-semibold">{metric.value}%</span>
            </div>
            <Progress value={metric.value} className="h-2" />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-muted p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Model Version</span>
          <span className="font-mono font-medium">v2.3.1</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last Updated</span>
          <span className="font-medium">2024-01-10</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Training Images</span>
          <span className="font-medium">12,847</span>
        </div>
      </div>
    </Card>
  )
}
