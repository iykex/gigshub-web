"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { GlassCard } from "@/components/ui/glass-card"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { toast } from "@/lib/toast"

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      await signup(email, password, username, phone)
      toast({ title: "Signup successful!" })
      navigate("/dashboard")
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col relative bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Background Glow */}
      <div
        className="absolute inset-0 z-0 blur-[80px] pointer-events-none select-none
          bg-[radial-gradient(circle_at_top_center,rgba(70,130,180,0.5),transparent_70%)]
          dark:bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.03),transparent_70%)]"
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <HomeNavbar />
        <main className="flex-grow flex flex-col relative max-w-6xl mx-auto px-3 sm:px-3 pt-0 pb-4 w-full">
          <div className="flex-grow flex items-center justify-center py-4 md:py-8">
            <GlassCard className="w-full max-w-md">
              <div className="text-center mb-4 md:mb-6">
                <h1 className="text-2xl font-bold">Create an Account</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Join us and get started</p>
              </div>
              <form onSubmit={handleSignup} className="space-y-3 md:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="yourusername"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0501234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <PasswordInput
                    id="confirm-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login">
                  <Button variant="link" className="px-0">
                    Sign In
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}