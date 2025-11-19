import { TopNav } from "@/components/nav/top-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div>
        <TopNav />
        <main className="flex-grow py-8 min-h-screen flex flex-col relative max-w-6xl mx-auto px-3 sm:px-6 pt-0 pb-4">
          {children}
        </main>
      </div>
  )
}
