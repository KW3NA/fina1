"use client"

import { useState, useEffect, useCallback } from "react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Tooltip } from "recharts"
import { Users, Star, Trophy, Award, CheckCircle, UserCheck } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { FilterDropdown } from "@/components/filter-dropdown"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { LastLoginSummary } from "@/components/last-login-summary"
import { supabase } from "@/lib/supabase"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border/50 rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-muted-foreground">{entry.name}:</span>
            <span className="text-sm font-medium">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border/50 rounded-lg p-3 shadow-lg">
        <p className="font-medium">{payload[0].name}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
          <span className="text-sm text-muted-foreground">Value:</span>
          <span className="text-sm font-medium">{payload[0].value.toLocaleString()}</span>
        </div>
      </div>
    )
  }
  return null
}

function isPdfExport() {
  if (typeof window !== 'undefined') {
    return document.body.classList.contains('pdf-export')
  }
  return false
}

interface ProvinceMetric {
  province_code: string
  province_name: string
  learner_count: number
  beginner_count: number
  intermediate_count: number
  advanced_count: number
  hub_count: number
}

interface Enrollment {
  id: string
  user_id: string
  course_id: string
  completed: boolean
  last_accessed_at: string
  users?: { name: string }
  courses?: { title: string }
}

export default function DashboardPage() {
  const [selectedProvince, setSelectedProvince] = useState("All Provinces")
  const [selectedSkill, setSelectedSkill] = useState("All Levels")
  const [loading, setLoading] = useState(true)

  // ── Live data from Supabase ───────────────────────────────────────────────
  const [provinceMetrics, setProvinceMetrics] = useState<ProvinceMetric[]>([])
  const [recentEnrollments, setRecentEnrollments] = useState<Enrollment[]>([])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const [metricsRes, enrollmentsRes] = await Promise.all([
        supabase.from('province_metrics').select('*').order('learner_count', { ascending: false }),
        supabase
          .from('enrollments')
          .select('id, user_id, course_id, completed, last_accessed_at, users(name), courses(title)')
          .order('last_accessed_at', { ascending: false })
          .limit(10),
      ])

      if (metricsRes.data) setProvinceMetrics(metricsRes.data)
      if (enrollmentsRes.data) setRecentEnrollments(enrollmentsRes.data as any)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboardData() }, [fetchDashboardData])

  // ── Computed values ───────────────────────────────────────────────────────
  const totals = provinceMetrics.reduce(
    (acc, m) => ({
      learners: acc.learners + m.learner_count,
      beginners: acc.beginners + m.beginner_count,
      intermediate: acc.intermediate + m.intermediate_count,
      advanced: acc.advanced + m.advanced_count,
    }),
    { learners: 0, beginners: 0, intermediate: 0, advanced: 0 }
  )

  const filteredMetrics = selectedProvince === "All Provinces"
    ? provinceMetrics
    : provinceMetrics.filter(m => m.province_name === selectedProvince)

  const literacyData = [
    { name: "Beginner", value: filteredMetrics.reduce((s, m) => s + m.beginner_count, 0) },
    { name: "Intermediate", value: filteredMetrics.reduce((s, m) => s + m.intermediate_count, 0) },
    { name: "Advanced", value: filteredMetrics.reduce((s, m) => s + m.advanced_count, 0) },
  ]

  const ageData = [
    { name: "18-25", value: 25, color: "#f97316" },
    { name: "26-35", value: 30, color: "#3b82f6" },
    { name: "36-45", value: 20, color: "#10b981" },
    { name: "46+", value: 25, color: "#ef4444" },
  ]

  const trendData = provinceMetrics.map(m => ({
    month: m.province_code,
    users: m.learner_count,
    completion: m.hub_count * 10,
  }))

  const stats = [
    { value: totals.learners.toLocaleString(), label: "Total Learners", icon: Users, change: "Live", color: "text-orange-500" },
    { value: totals.beginners.toLocaleString(), label: "Beginners", icon: Star, change: "Live", color: "text-blue-500" },
    { value: totals.intermediate.toLocaleString(), label: "Intermediate", icon: Trophy, change: "Live", color: "text-green-500" },
    { value: totals.advanced.toLocaleString(), label: "Advanced", icon: Award, change: "Live", color: "text-purple-500" },
  ]

  const provinceOptions = ["All Provinces", ...provinceMetrics.map(m => m.province_name)]

  return (
    <div className="space-y-6" data-dashboard-export>
      <LastLoginSummary />

      {loading && (
        <div className="text-center py-4 text-muted-foreground text-sm">Loading live data from Supabase…</div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <FilterDropdown
          value={selectedProvince}
          onChange={setSelectedProvince}
          options={provinceOptions}
        />
        <FilterDropdown
          value={selectedSkill}
          onChange={setSelectedSkill}
          options={["All Levels", "Beginner", "Intermediate", "Advanced"]}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Literacy Distribution */}
        <div className={`bg-card p-6 rounded-xl border transition-all duration-200 hover:shadow-lg literacy-chart ${isPdfExport() ? 'bg-white' : ''}`}>
          <h3 className="text-lg font-semibold mb-6">Literacy Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={literacyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isPdfExport() ? '#000000' : 'currentColor' }} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`} tick={{ fill: isPdfExport() ? '#000000' : 'currentColor' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} className="transition-all duration-200 hover:opacity-80" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Province Distribution */}
        <div className={`bg-card p-6 rounded-xl border transition-all duration-200 hover:shadow-lg age-chart ${isPdfExport() ? 'bg-white' : ''}`}>
          <h3 className="text-lg font-semibold mb-6">Province Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={provinceMetrics.slice(0, 5).map((m, i) => ({
                  name: m.province_name,
                  value: m.learner_count,
                  fill: ["#f97316","#3b82f6","#10b981","#ef4444","#8b5cf6"][i]
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => isPdfExport() ? `${name}: ${value}` : ''}
                labelLine={isPdfExport()}
              >
                {provinceMetrics.slice(0, 5).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={["#f97316","#3b82f6","#10b981","#ef4444","#8b5cf6"][index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {provinceMetrics.slice(0, 4).map((m, i) => (
              <div key={m.province_code} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ["#f97316","#3b82f6","#10b981","#ef4444"][i] }} />
                <span className="text-sm text-muted-foreground">{m.province_code}</span>
                <span className="text-sm font-medium">{m.learner_count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className={`heatmap-chart ${isPdfExport() ? 'bg-white p-6 rounded-xl border' : ''}`}>
        <ActivityHeatmap />
      </div>

      {/* Trend Analysis */}
      <div className={`bg-card p-6 rounded-xl border transition-all duration-200 hover:shadow-lg trend-chart ${isPdfExport() ? 'bg-white' : ''}`}>
        <h3 className="text-lg font-semibold mb-6">Learners by Province</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: isPdfExport() ? '#000000' : 'currentColor' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: isPdfExport() ? '#000000' : 'currentColor' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="users" stroke="#f97316" fill="#f97316" fillOpacity={0.1} name="Learners" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="bg-card p-6 rounded-xl border transition-all duration-200 hover:shadow-lg">
        <h3 className="text-lg font-semibold mb-6">Recent Enrollment Activity</h3>
        <div className="space-y-4">
          {recentEnrollments.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No recent activity found.</p>
          ) : (
            recentEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={`p-2 rounded-full transition-colors ${
                  enrollment.completed
                    ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                }`}>
                  {enrollment.completed ? <CheckCircle className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{(enrollment as any).users?.name ?? 'Learner'}</p>
                  <p className="text-sm text-muted-foreground">{(enrollment as any).courses?.title ?? 'Course'}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(enrollment.last_accessed_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
