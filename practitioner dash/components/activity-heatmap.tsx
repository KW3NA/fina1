"use client"

import { useTheme } from "next-themes"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function ActivityHeatmap() {
  const { theme } = useTheme()
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; value: number } | null>(null)

  const heatmapData = [
    { day: "Mon", hour: 9, value: 85 },
    { day: "Mon", hour: 10, value: 92 },
    { day: "Mon", hour: 11, value: 78 },
    { day: "Mon", hour: 14, value: 95 },
    { day: "Mon", hour: 15, value: 88 },
    { day: "Mon", hour: 16, value: 73 },
    { day: "Tue", hour: 9, value: 90 },
    { day: "Tue", hour: 10, value: 87 },
    { day: "Tue", hour: 11, value: 82 },
    { day: "Tue", hour: 14, value: 91 },
    { day: "Tue", hour: 15, value: 85 },
    { day: "Tue", hour: 16, value: 79 },
    { day: "Wed", hour: 9, value: 88 },
    { day: "Wed", hour: 10, value: 94 },
    { day: "Wed", hour: 11, value: 86 },
    { day: "Wed", hour: 14, value: 89 },
    { day: "Wed", hour: 15, value: 92 },
    { day: "Wed", hour: 16, value: 81 },
    { day: "Thu", hour: 9, value: 93 },
    { day: "Thu", hour: 10, value: 89 },
    { day: "Thu", hour: 11, value: 84 },
    { day: "Thu", hour: 14, value: 96 },
    { day: "Thu", hour: 15, value: 90 },
    { day: "Thu", hour: 16, value: 77 },
    { day: "Fri", hour: 9, value: 87 },
    { day: "Fri", hour: 10, value: 91 },
    { day: "Fri", hour: 11, value: 83 },
    { day: "Fri", hour: 14, value: 88 },
    { day: "Fri", hour: 15, value: 86 },
    { day: "Fri", hour: 16, value: 75 },
  ]

  const getHeatmapColor = (value: number) => {
    const isDark = theme === "dark"
    if (value >= 90) return isDark ? "#dc2626" : "#ef4444"
    if (value >= 80) return isDark ? "#ea580c" : "#f97316"
    if (value >= 70) return isDark ? "#ca8a04" : "#eab308"
    return isDark ? "#16a34a" : "#22c55e"
  }

  return (
    <div className="bg-card p-6 rounded-xl border transition-all duration-200 hover:shadow-lg">
      <h3 className="text-lg font-semibold mb-6">Learning Activity Heatmap</h3>
      <div className="space-y-2">
        <div className="flex space-x-2 text-sm font-medium">
          <div className="w-12"></div>
          {[9, 10, 11, 14, 15, 16].map((hour) => (
            <div key={hour} className="w-12 text-center">
              {hour}:00
            </div>
          ))}
        </div>
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
          <div key={day} className="flex space-x-2 items-center">
            <div className="w-12 text-sm font-medium">{day}</div>
            {[9, 10, 11, 14, 15, 16].map((hour) => {
              const data = heatmapData.find((d) => d.day === day && d.hour === hour)
              const value = data?.value || 0
              const isHovered = hoveredCell?.day === day && hoveredCell?.hour === hour
              return (
                <div
                  key={`${day}-${hour}`}
                  className={cn(
                    "w-12 h-8 rounded flex items-center justify-center text-xs font-medium text-white cursor-help transition-all duration-200",
                    isHovered && "scale-110 shadow-lg"
                  )}
                  style={{ 
                    backgroundColor: getHeatmapColor(value),
                    opacity: hoveredCell && !isHovered ? 0.5 : 1
                  }}
                  onMouseEnter={() => setHoveredCell({ day, hour, value })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {value}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {hoveredCell && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">
            {hoveredCell.day} {hoveredCell.hour}:00
          </p>
          <p className="text-sm text-muted-foreground">
            Activity Level: {hoveredCell.value}%
          </p>
        </div>
      )}
    </div>
  )
}
