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

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast({ title: "Login successful!" })
      navigate("/stores")
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Background Glow */}
      <div
        className="absolute inset-0 z-0 blur-[80px] pointer-events-none select-none
          bg-[radial-gradient(circle_at_top_center,rgba(70,130,180,0.5),transparent_70%)]
          dark:bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.03),transparent_70%)]"
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <HomeNavbar />
        <main className="flex-grow flex flex-col items-center justify-center w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <GlassCard className="w-full p-6 sm:p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
                <p className="text-muted-foreground text-sm mt-2">Sign in to continue to your account</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password">
                      <Button variant="link" className="px-0 text-xs h-auto font-normal">
                        Forgot Password?
                      </Button>
                    </Link>
                  </div>
                  <PasswordInput
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup">
                  <Button variant="link" className="px-0 font-semibold text-primary">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}