"use client"

import { usePathname, useRouter } from "next/navigation"
import { BarChart3, FileText, User, GraduationCap, PieChart, Settings, HelpCircle, MessageSquare, Briefcase, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: User, label: "User Insights", href: "/user-insights" },
  { icon: GraduationCap, label: "Courses", href: "/courses" },
  { icon: PieChart, label: "Analytics", href: "/analytics" },
  { icon: Briefcase, label: "Opportunities", href: "/opportunities" },
  { icon: ShieldCheck, label: "Verify Documents", href: "/verify-documents" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div 
      className={`relative min-h-screen bg-card border-r transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-16'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-4">
        <h2 className={`text-lg font-semibold mb-4 text-orange-500 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          Navigation
        </h2>
      </div>

      <nav className="space-y-2 px-2">
        {sidebarItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-300 ${
              pathname === item.href ? "bg-orange-500 text-white hover:bg-orange-600" : ""
            } ${isExpanded ? 'px-4' : 'px-2'}`}
            onClick={() => router.push(item.href)}
          >
            <item.icon className="w-5 h-5" />
            <span className={`ml-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
              {item.label}
            </span>
          </Button>
        ))}
      </nav>

      <div className={`mt-8 pt-8 border-t transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="space-y-2 px-2">
          <Button variant="ghost" className={`w-full justify-start transition-all duration-300 ${isExpanded ? 'px-4' : 'px-2'}`}>
            <HelpCircle className="w-5 h-5" />
            <span className={`ml-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Help & Support
            </span>
          </Button>
          <Button variant="ghost" className={`w-full justify-start transition-all duration-300 ${isExpanded ? 'px-4' : 'px-2'}`}>
            <MessageSquare className="w-5 h-5" />
            <span className={`ml-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Feedback
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
