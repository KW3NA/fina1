"use client"

import { useState, useEffect } from "react"
import { Monitor, Bell, User, Shield, Save, ChevronDown, FileCheck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { isDocumentVerified, isVerificationSkipped, resetVerification, getVerificationDate } from "@/lib/verification"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isSkipped, setIsSkipped] = useState(false)
  const [verificationDate, setVerificationDate] = useState<Date | null>(null)
  
  useEffect(() => {
    setIsVerified(isDocumentVerified())
    setIsSkipped(isVerificationSkipped())
    setVerificationDate(getVerificationDate())
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleResetVerification = () => {
    if (confirm("Are you sure you want to reset document verification? You will need to upload documents again.")) {
      resetVerification()
      router.push("/verify-documents")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <div className="bg-card p-6 rounded-xl border transition-all duration-200 hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Monitor className="w-5 h-5" />
            <span>Appearance</span>
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2">Theme</Label>
              <div className="mt-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card p-6 rounded-xl border transition-all duration-200 hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
                  notifications ? "bg-orange-500 hover:bg-orange-600" : "bg-muted hover:bg-muted/80"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out",
                    notifications ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Browser notifications</p>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
                  pushNotifications ? "bg-orange-500 hover:bg-orange-600" : "bg-muted hover:bg-muted/80"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out",
                    pushNotifications ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-card p-6 rounded-xl border transition-all duration-200 hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Account</span>
          </h3>
          <div className="space-y-4">
            <div className="group">
              <Label htmlFor="name" className="group-hover:text-orange-500 transition-colors">Full Name</Label>
              <Input 
                id="name" 
                type="text" 
                defaultValue="Alexander Mitchell" 
                className="mt-1 transition-colors focus:border-orange-500 focus:ring-orange-500/20" 
              />
            </div>
            <div className="group">
              <Label htmlFor="email" className="group-hover:text-orange-500 transition-colors">Email</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue="alexander.mitchell@example.com" 
                className="mt-1 transition-colors focus:border-orange-500 focus:ring-orange-500/20" 
              />
            </div>
            <div className="group">
              <Label htmlFor="role" className="group-hover:text-orange-500 transition-colors">Role</Label>
              <Select defaultValue="administrator">
                <SelectTrigger className="mt-1 transition-colors focus:border-orange-500 focus:ring-orange-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrator" className="hover:bg-orange-500/10 focus:bg-orange-500/10">Administrator</SelectItem>
                  <SelectItem value="manager" className="hover:bg-orange-500/10 focus:bg-orange-500/10">Manager</SelectItem>
                  <SelectItem value="instructor" className="hover:bg-orange-500/10 focus:bg-orange-500/10">Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-card p-6 rounded-xl border transition-all duration-200 hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security</span>
          </h3>
          <div className="space-y-4">
            <div className="group">
              <Label htmlFor="current-password" className="group-hover:text-orange-500 transition-colors">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                className="mt-1 transition-colors focus:border-orange-500 focus:ring-orange-500/20" 
              />
            </div>
            <div className="group">
              <Label htmlFor="new-password" className="group-hover:text-orange-500 transition-colors">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                className="mt-1 transition-colors focus:border-orange-500 focus:ring-orange-500/20" 
              />
            </div>
            <div className="group">
              <Label htmlFor="confirm-password" className="group-hover:text-orange-500 transition-colors">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                className="mt-1 transition-colors focus:border-orange-500 focus:ring-orange-500/20" 
              />
            </div>
          </div>
        </div>

        {/* Document Verification */}
        <div className="bg-card p-6 rounded-xl border transition-all duration-200 hover:shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <FileCheck className="w-5 h-5" />
            <span>Document Verification</span>
          </h3>
          <div className="space-y-4">
            {isVerified ? (
              <>
                <Alert>
                  <FileCheck className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong>Verified</strong> - Your documents were verified on{" "}
                    {verificationDate?.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="outline" 
                  onClick={handleResetVerification}
                  className="w-full hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-950"
                >
                  Re-verify Documents
                </Button>
              </>
            ) : isSkipped ? (
              <>
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <strong>Skipped</strong> - You skipped document verification. We recommend completing this for full account security.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={() => router.push("/verify-documents")}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  Complete Verification Now
                </Button>
              </>
            ) : (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your documents are not verified. Please complete verification.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={() => router.push("/verify-documents")}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  Verify Documents Now
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "flex items-center space-x-2 transition-all duration-200",
            "bg-orange-500 hover:bg-orange-600 focus:ring-orange-500/20",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Save className={cn("w-4 h-4", isSaving && "animate-spin")} />
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </Button>
      </div>
    </div>
  )
}
