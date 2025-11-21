import { ProviderCard } from "@/components/store/provider-card"
import { getAllProviders, getPackagesByProvider } from "@/lib/mock-data"
import { TopNav } from "@/components/nav/top-nav"

export default function StorePage() {
  const providers = getAllProviders()

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
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Choose Your Provider
              </h1>
              <p className="text-muted-foreground text-lg">
                Select your mobile network provider to view available data packages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => {
                const packageCount = getPackagesByProvider(provider).length
                return (
                  <ProviderCard
                    key={provider}
                    provider={provider}
                    packageCount={packageCount}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}
