import { TopNav } from "@/components/nav/top-nav"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { LayoutDashboard, User, Settings, Wallet, ShoppingBag } from "lucide-react"

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: <User className="w-4 h-4" />,
  },
  {
    title: "Wallet",
    href: "/dashboard/wallet",
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-4 h-4" />,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-4 shadow-sm">
                  <SidebarNav items={sidebarNavItems} />
                </div>
              </div>
            </aside>

            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
