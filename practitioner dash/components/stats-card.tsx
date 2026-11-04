import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  value: string
  label: string
  change: string
  icon: LucideIcon
  color: string
}

export function StatsCard({ value, label, change, icon: Icon, color }: StatsCardProps) {
  return (
    <div className="bg-card p-6 rounded-xl border transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className={`text-sm mt-1 ${change.includes("+") ? "text-green-500" : "text-red-500"}`}>
            {change} from last month
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted">
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  )
}
