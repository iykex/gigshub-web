"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { GlassCard } from "@/components/ui/glass-card"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { toast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { sendPasswordResetEmail } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sendPasswordResetEmail(email)
      toast({ title: "Password reset email sent!" })
      router.push("/login")
    } catch (error) {
      toast({ title: "Failed to send email", description: "Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative max-w-6xl mx-auto px-3 sm:px-6 pt-0 pb-4">
      <HomeNavbar />
      <div className="flex-grow flex items-center justify-center">
        <GlassCard className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="text-gray-500 dark:text-gray-400">Enter your email to reset your password</p>
          </div>
          <form onSubmit={handlePasswordReset} className="space-y-6">
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Remember your password?{" "}
            <Link href="/login" passHref>
              <Button variant="link" className="px-0">
                Sign In
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
      <Footer />
    </div>
  )
}