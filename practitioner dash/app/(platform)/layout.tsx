"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { isDocumentVerified } from "@/lib/verification"
import { ShieldAlert, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isVerified, setIsVerified] = useState<boolean>(true)

  useEffect(() => {
    // Check authentication
    const token = typeof window !== "undefined" ? localStorage.getItem("practitioner_token") : null
    
    if (!token) {
      setIsAuthenticated(false)
      router.push("/login")
      return
    }

    setIsAuthenticated(true)
    setIsVerified(isDocumentVerified())
  }, [router])

  // Show loading spinner while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm font-medium text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      {/* Non-blocking verification banner if practitioner documents are pending */}
      {!isVerified && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>
              <strong>Document Verification Pending:</strong> Complete verification to access full accredited certification issuance.
            </span>
          </div>
          <Link
            href="/verify-documents"
            className="font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 flex items-center space-x-1 underline ml-4"
          >
            <span>Upload Documents</span>
            <ArrowRight className="h-3.5 w-3.5 inline" />
          </Link>
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
