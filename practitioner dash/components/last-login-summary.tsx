"use client"

import { Clock } from "lucide-react"

export function LastLoginSummary() {
  // Mock last login data - in a real app, this would come from an API or context
  const lastLogin = new Date()
  lastLogin.setHours(lastLogin.getHours() - 3) // Mock: 3 hours ago

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'less than an hour ago'
    if (diffInHours === 1) return '1 hour ago'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'yesterday'
    return `${diffInDays} days ago`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-card p-6 rounded-xl border mb-6">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-1">Welcome back!</h2>
          <p className="text-muted-foreground">
            Your last login was <span className="font-medium text-foreground">{formatTimeAgo(lastLogin)}</span> on{' '}
            <span className="font-medium text-foreground">{formatDate(lastLogin)}</span>. Since then, there have been:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-background p-3 rounded-lg border">
              <div className="text-2xl font-bold text-orange-500">12</div>
              <div className="text-sm text-muted-foreground">New Learners</div>
            </div>
            <div className="bg-background p-3 rounded-lg border">
              <div className="text-2xl font-bold text-green-500">8</div>
              <div className="text-sm text-muted-foreground">Course Completions</div>
            </div>
            <div className="bg-background p-3 rounded-lg border">
              <div className="text-2xl font-bold text-blue-500">95%</div>
              <div className="text-sm text-muted-foreground">Average Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 