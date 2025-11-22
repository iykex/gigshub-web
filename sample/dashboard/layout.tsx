import { TopNav } from "@/components/nav/top-nav"
import { AppSidebar } from "@/components/dashboard/app-sidebar"

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

        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <AppSidebar />

            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
