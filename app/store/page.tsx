import { ProviderCard } from "@/components/store/provider-card"
import { getAllProviders, getPackagesByProvider } from "@/lib/mock-data"
import { TopNav } from "@/components/nav/top-nav"

export default function StorePage() {
  const providers = getAllProviders()

  return (  
    <div>
      <TopNav />
        <div className="flex-grow py-8 min-h-screen flex flex-col relative max-w-6xl mx-auto px-3 sm:px-6 pt-0 pb-4">
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

  )
}
