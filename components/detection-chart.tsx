"use client"

import { Card } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { date: "Jan", detections: 45, severity: 12 },
  { date: "Feb", detections: 52, severity: 18 },
  { date: "Mar", detections: 48, severity: 15 },
  { date: "Apr", detections: 61, severity: 22 },
  { date: "May", detections: 55, severity: 19 },
  { date: "Jun", detections: 67, severity: 28 },
]

export function DetectionChart() {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Detection Trends</h3>
          <p className="text-sm text-muted-foreground">Monthly rust detection analysis</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-1" />
            <span className="text-muted-foreground">Total Detections</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-2" />
            <span className="text-muted-foreground">High Severity</span>
          </div>
        </div>
      </div>

      <ChartContainer
        config={{
          detections: {
            label: "Detections",
            color: "hsl(var(--chart-1))",
          },
          severity: {
            label: "High Severity",
            color: "hsl(var(--chart-2))",
          },
        }}
        className="h-[300px]"
      >
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" tickLine={false} axisLine={false} />
          <YAxis className="text-xs" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="detections"
            stroke="hsl(var(--chart-1))"
            fill="hsl(var(--chart-1))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="severity"
            stroke="hsl(var(--chart-2))"
            fill="hsl(var(--chart-2))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  )
}
