"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if practitioner is authenticated
    const token = typeof window !== "undefined" ? localStorage.getItem("practitioner_token") : null

    if (token) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-950 dark:to-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading Practitioner Portal...</p>
      </div>
    </div>
  )
}
