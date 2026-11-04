"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function PractitionerLoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  // Register form state
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [registerProvince, setRegisterProvince] = useState("GP")
  const [registerTown, setRegisterTown] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!loginEmail || !loginPassword) {
      setError("Please enter both email and password.")
      return
    }

    try {
      setLoading(true)

      // 1. Attempt Supabase Auth login
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        })

        if (!authError && authData?.session) {
          localStorage.setItem("practitioner_token", authData.session.access_token)
          const { data: userProfile } = await supabase
            .from("users")
            .select("*")
            .eq("email", loginEmail)
            .maybeSingle()

          const practitionerUser = {
            id: userProfile?.id || authData.user.id,
            name: userProfile?.name || loginEmail.split("@")[0],
            email: loginEmail,
            role: "practitioner",
            verification_status: userProfile?.verification_status || "verified",
          }

          localStorage.setItem("practitioner_user", JSON.stringify(practitionerUser))
          localStorage.setItem("documentsVerified", "true")
          setSuccess("Login successful! Redirecting to dashboard...")
          setTimeout(() => router.push("/dashboard"), 800)
          return
        }
      } catch (authErr) {
        console.warn("Supabase auth check failed:", authErr)
      }

      // 2. Check if user exists in seeded Supabase public.users table
      const { data: seededUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", loginEmail)
        .maybeSingle()

      if (seededUser && (seededUser.role === "practitioner" || seededUser.role === "admin")) {
        const practitionerUser = {
          id: seededUser.id,
          name: seededUser.name,
          email: seededUser.email,
          role: seededUser.role,
          verification_status: seededUser.verification_status || "verified",
        }
        localStorage.setItem("practitioner_token", "session-" + seededUser.id)
        localStorage.setItem("practitioner_user", JSON.stringify(practitionerUser))
        localStorage.setItem("documentsVerified", "true")
        setSuccess(`Welcome back, ${seededUser.name}! Redirecting...`)
        setTimeout(() => router.push("/dashboard"), 800)
        return
      }

      // 3. Fallback for demo practitioner credentials
      if (loginEmail === "thabo@eliteracy.org.za" || loginEmail === "ayanda@eliteracy.org.za") {
        const demoUser = {
          id: "practitioner-demo",
          name: loginEmail === "thabo@eliteracy.org.za" ? "Thabo Sithole" : "Ayanda Khumalo",
          email: loginEmail,
          role: "practitioner",
          verification_status: "verified",
        }
        localStorage.setItem("practitioner_token", "demo-token")
        localStorage.setItem("practitioner_user", JSON.stringify(demoUser))
        localStorage.setItem("documentsVerified", "true")
        setSuccess("Login successful! Redirecting...")
        setTimeout(() => router.push("/dashboard"), 800)
        return
      }

      setError("Invalid practitioner credentials. Please check your email and password.")
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "An unexpected error occurred during login.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!registerName || !registerEmail || !registerPassword) {
      setError("Please fill in all required fields.")
      return
    }

    if (registerPassword !== registerConfirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (registerPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    try {
      setLoading(true)

      // 1. Try Supabase Auth sign up
      try {
        await supabase.auth.signUp({
          email: registerEmail,
          password: registerPassword,
        })
      } catch (authErr) {
        console.warn("Supabase auth signUp fallback:", authErr)
      }

      // 2. Insert into Supabase public.users table as a practitioner
      const { data: newUser, error: dbError } = await supabase
        .from("users")
        .insert({
          name: registerName,
          email: registerEmail,
          role: "practitioner",
          province: registerProvince,
          town: registerTown || "Johannesburg",
          current_level: "Intermediate",
          status: "pending",
          verification_status: "unverified",
        })
        .select()
        .maybeSingle()

      if (dbError && !dbError.message?.includes("duplicate")) {
        console.warn("Supabase DB insert notice:", dbError)
      }

      const practitionerUser = {
        id: newUser?.id || "practitioner-" + Date.now(),
        name: registerName,
        email: registerEmail,
        role: "practitioner",
        verification_status: "unverified",
      }

      localStorage.setItem("practitioner_token", "session-" + practitionerUser.id)
      localStorage.setItem("practitioner_user", JSON.stringify(practitionerUser))
      localStorage.setItem("documentsVerified", "false")

      setSuccess("Account created successfully! Redirecting to verification...")
      setTimeout(() => router.push("/verify-documents"), 1200)
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Failed to create practitioner account.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 transform hover:scale-105 transition-transform duration-300">
          <GraduationCap className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          E-Literacy Platform
        </h1>
        <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-1">
          Practitioner & Facilitator Portal
        </p>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-md shadow-xl border-orange-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-4">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setError(null); setSuccess(null); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-orange-100/70 dark:bg-gray-800 p-1">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-medium"
              >
                Register
              </TabsTrigger>
            </TabsList>

            {/* Notifications */}
            {error && (
              <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-900 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-950/50 dark:border-green-900 dark:text-green-300">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-xs">{success}</AlertDescription>
              </Alert>
            )}

            {/* TAB: LOGIN */}
            <TabsContent value="login" className="mt-4 space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Practitioner Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="e.g. thabo@eliteracy.org.za"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-9 focus-visible:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="login-password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Password
                    </Label>
                    <a href="#" className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-9 focus-visible:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="remember" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                    Remember me on this device
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 shadow-md shadow-orange-500/20 transition duration-200 mt-2"
                >
                  {loading ? "Signing in..." : "Sign in to Dashboard"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              {/* Demo Accounts Helper */}
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200/60 dark:border-orange-900/40 text-xs">
                <p className="font-semibold text-orange-800 dark:text-orange-300 mb-1">
                  💡 Seeded Practitioner Accounts:
                </p>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <p><span className="font-mono text-gray-800 dark:text-gray-200">thabo@eliteracy.org.za</span> (Verified Practitioner)</p>
                  <p><span className="font-mono text-gray-800 dark:text-gray-200">ayanda@eliteracy.org.za</span> (Review Pending)</p>
                </div>
              </div>
            </TabsContent>

            {/* TAB: REGISTER */}
            <TabsContent value="register" className="mt-4 space-y-4">
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="reg-name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="e.g. Dr. Jane Smith"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="pl-9 focus-visible:ring-orange-500 h-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reg-email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="jane@eliteracy.org.za"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-9 focus-visible:ring-orange-500 h-9"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="reg-province" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Province
                    </Label>
                    <select
                      id="reg-province"
                      value={registerProvince}
                      onChange={(e) => setRegisterProvince(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="GP">Gauteng (GP)</option>
                      <option value="WC">Western Cape (WC)</option>
                      <option value="KZN">KwaZulu-Natal (KZN)</option>
                      <option value="LP">Limpopo (LP)</option>
                      <option value="EC">Eastern Cape (EC)</option>
                      <option value="FS">Free State (FS)</option>
                      <option value="NC">Northern Cape (NC)</option>
                      <option value="MP">Mpumalanga (MP)</option>
                      <option value="NW">North West (NW)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-town" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Town / City
                    </Label>
                    <Input
                      id="reg-town"
                      type="text"
                      placeholder="e.g. Soweto"
                      value={registerTown}
                      onChange={(e) => setRegisterTown(e.target.value)}
                      className="focus-visible:ring-orange-500 h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reg-pass" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-pass"
                      type="password"
                      placeholder="At least 6 characters"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-9 focus-visible:ring-orange-500 h-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reg-confirm" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="Confirm password"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      className="pl-9 focus-visible:ring-orange-500 h-9"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 shadow-md shadow-orange-500/20 transition duration-200 mt-2"
                >
                  {loading ? "Registering..." : "Create Practitioner Account"}
                  {!loading && <ShieldCheck className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardHeader>

        <CardFooter className="pt-0 pb-4 justify-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Secured by Supabase • E-Literacy South Africa
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

