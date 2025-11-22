import { TopNav } from "@/components/nav/top-nav"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Outlet, useLocation, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { hasPermission, Role } from "@/lib/permissions"
import { useEffect, useRef } from "react"
import { toast } from "@/lib/toast"
import { Footer } from "@/components/footer"

export default function DashboardLayout() {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const hasShownToast = useRef(false)

  // Check permissions and redirect if necessary
  useEffect(() => {
    if (!user || loading) return

    // Check admin panel access
    if (pathname.startsWith('/dashboard/admin') && !hasPermission(user.role as Role, 'access_admin_panel')) {
      if (!hasShownToast.current) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the Admin Panel.",
          variant: "destructive"
        })
        hasShownToast.current = true
      }
      navigate('/dashboard', { replace: true })
      return
    }

    // Check agent panel access
    if (pathname.startsWith('/dashboard/agent') && !hasPermission(user.role as Role, 'access_agent_panel')) {
      if (!hasShownToast.current) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the Agent Panel.",
          variant: "destructive"
        })
        hasShownToast.current = true
      }
      navigate('/dashboard', { replace: true })
      return
    }

    // Prevent agents from accessing regular user dashboard routes
    // (except /dashboard which will redirect them to /dashboard/agent in the page component)
    const regularUserRoutes = ['/dashboard/wallet', '/dashboard/orders', '/dashboard/profile', '/dashboard/settings']
    if (user.role === 'agent' && regularUserRoutes.some(route => pathname.startsWith(route))) {
      if (!hasShownToast.current) {
        toast({
          title: "Access Denied",
          description: "Agents cannot access regular user pages. Please use the Agent Panel.",
          variant: "destructive"
        })
        hasShownToast.current = true
      }
      navigate('/dashboard/agent', { replace: true })
      return
    }

    // Reset toast flag when on allowed path
    hasShownToast.current = false
  }, [pathname, user, loading, navigate])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Early return for unauthorized access - prevents rendering
  if (pathname.startsWith('/dashboard/admin') && !hasPermission(user.role as Role, 'access_admin_panel')) {
    return null // Return null to prevent blank page flash
  }

  if (pathname.startsWith('/dashboard/agent') && !hasPermission(user.role as Role, 'access_agent_panel')) {
    return null // Return null to prevent blank page flash
  }

  // Prevent agents from accessing regular user dashboard routes
  const regularUserRoutes = ['/dashboard/wallet', '/dashboard/orders', '/dashboard/profile', '/dashboard/settings']
  if (user.role === 'agent' && regularUserRoutes.some(route => pathname.startsWith(route))) {
    return null // Return null to prevent blank page flash
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Background Glow */}
      <div
        className="fixed inset-0 z-0 blur-[80px] pointer-events-none select-none
          bg-[radial-gradient(circle_at_top_center,rgba(70,130,180,0.15),transparent_70%)]
          dark:bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.03),transparent_70%)]"
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <TopNav />

        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <AppSidebar />

            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
