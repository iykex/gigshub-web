import { TopNav } from "@/components/nav/top-nav"
import { Footer } from "@/components/footer"

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex-1 flex flex-col relative bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            {/* Background Glow */}
            <div
                className="absolute inset-0 z-0 blur-[80px] pointer-events-none select-none
          bg-[radial-gradient(circle_at_top_center,rgba(70,130,180,0.5),transparent_70%)]
          dark:bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.03),transparent_70%)]"
            />

            <div className="relative z-10 flex-1 flex flex-col">
                <TopNav />
                <div className="flex-grow py-8 flex flex-col relative max-w-6xl mx-auto px-3 sm:px-6 pt-0 pb-4 w-full">
                    {children}
                </div>
                <Footer />
            </div>
        </div>
    )
}
