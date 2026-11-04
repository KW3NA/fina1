"use client"

import { UserCheck, Activity, Clock, Target } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { StatsCard } from "@/components/stats-card"

export default function UserInsightsPage() {
  const metrics = [
    { label: "New Users", value: "1,234", change: "+12%", icon: UserCheck },
    { label: "Active Sessions", value: "5,678", change: "+8%", icon: Activity },
    { label: "Avg. Session Time", value: "24 min", change: "+15%", icon: Clock },
    { label: "Course Completion", value: "89%", change: "+3%", icon: Target },
  ]

  const engagementData = [
    { hour: "9AM", users: 120 },
    { hour: "12PM", users: 180 },
    { hour: "3PM", users: 220 },
    { hour: "6PM", users: 150 },
    { hour: "9PM", users: 80 },
  ]

  const preferences = [
    { label: "Interactive Content", percentage: 85 },
    { label: "Video Learning", percentage: 72 },
    { label: "Text-based Material", percentage: 58 },
    { label: "Quizzes & Tests", percentage: 91 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <StatsCard
            key={index}
            value={metric.value}
            label={metric.label}
            change={metric.change}
            icon={metric.icon}
            color="text-orange-500"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl border">
          <h3 className="text-lg font-semibold mb-4">User Engagement by Hour</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={engagementData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Bar dataKey="users" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-xl border">
          <h3 className="text-lg font-semibold mb-4">Learning Preferences</h3>
          <div className="space-y-4">
            {preferences.map((pref, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{pref.label}</span>
                  <span className="text-sm">{pref.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pref.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
