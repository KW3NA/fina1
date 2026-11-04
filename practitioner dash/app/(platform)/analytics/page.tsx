"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts"

export default function AnalyticsPage() {
  const completionData = [
    { name: "Completed", value: 65, color: "#10b981" },
    { name: "In Progress", value: 25, color: "#f59e0b" },
    { name: "Not Started", value: 10, color: "#ef4444" },
  ]

  const skillData = [
    { skill: "Basic", score: 78 },
    { skill: "Intermediate", score: 85 },
    { skill: "Advanced", score: 72 },
    { skill: "Expert", score: 89 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Advanced Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl border">
          <h3 className="text-lg font-semibold mb-4">Learning Path Completion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-1 gap-2 mt-4">
            {completionData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border">
          <h3 className="text-lg font-semibold mb-4">Skill Assessment Scores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={skillData}>
              <XAxis dataKey="skill" />
              <YAxis />
              <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border">
        <h3 className="text-lg font-semibold mb-6">Predictive Learning Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">92%</div>
            <p className="text-sm text-muted-foreground mt-2">Predicted Completion Rate</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">15.2</div>
            <p className="text-sm text-muted-foreground mt-2">Avg. Learning Hours</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">4.7</div>
            <p className="text-sm text-muted-foreground mt-2">Satisfaction Score</p>
          </div>
        </div>
      </div>
    </div>
  )
}
