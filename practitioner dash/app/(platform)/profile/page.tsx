"use client"

import { User, Mail, Phone, Shield, FileText, BookOpen, Settings, Award, BarChart3, Users } from "lucide-react"

export default function ProfilePage() {
  const recentActivity = [
    { action: "Updated user permissions", time: "2 hours ago", type: "admin" },
    { action: "Generated monthly report", time: "1 day ago", type: "report" },
    { action: "Reviewed course content", time: "3 days ago", type: "content" },
    { action: "System maintenance completed", time: "1 week ago", type: "system" },
  ]

  const achievements = [
    { title: "Platform Expert", description: "5 years of service", icon: Award },
    { title: "Data Analyst", description: "1000+ reports generated", icon: BarChart3 },
    { title: "User Champion", description: "Helped 10k+ users", icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <User className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Alexander Mitchell</h1>
          <p className="text-lg text-muted-foreground">Platform Administrator</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="flex items-center space-x-1 text-sm">
              <Mail className="w-4 h-4" />
              <span>alexander.mitchell@example.com</span>
            </span>
            <span className="flex items-center space-x-1 text-sm">
              <Phone className="w-4 h-4" />
              <span>+27 123 456 789</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl border lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`p-2 rounded-full ${
                    activity.type === "admin"
                      ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                      : activity.type === "report"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                        : activity.type === "content"
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                          : "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
                  }`}
                >
                  {activity.type === "admin" ? (
                    <Shield className="w-4 h-4" />
                  ) : activity.type === "report" ? (
                    <FileText className="w-4 h-4" />
                  ) : activity.type === "content" ? (
                    <BookOpen className="w-4 h-4" />
                  ) : (
                    <Settings className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reports Generated</span>
                <span className="font-semibold">147</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Users Managed</span>
                <span className="font-semibold">24,567</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Courses Reviewed</span>
                <span className="font-semibold">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">System Uptime</span>
                <span className="font-semibold text-green-500">99.9%</span>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border">
            <h3 className="text-lg font-semibold mb-4">Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400 rounded-lg">
                    <achievement.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
