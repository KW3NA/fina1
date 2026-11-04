"use client"

import { useState, useEffect } from "react"
import { Search, Bell, User, GraduationCap, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [practitionerName, setPractitionerName] = useState("Practitioner")
  const router = useRouter()

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("practitioner_user")
      if (userStr) {
        const u = JSON.parse(userStr)
        if (u.name) setPractitionerName(u.name)
      }
    } catch {}
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("practitioner_token")
    localStorage.removeItem("practitioner_user")
    router.push("/login")
  }

  return (
    <div className="bg-card px-6 py-4 flex items-center justify-between border-b">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">E-Learning Platform</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {practitionerName}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>

        <Button variant="ghost" size="icon" onClick={() => router.push("/profile")} title="Profile">
          <User className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="icon" title="Notifications">
          <Bell className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 ml-2"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
