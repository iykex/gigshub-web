import { getDB } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"

interface ProviderStats {
  provider: string
  count: number
}

async function getProviderStats(): Promise<ProviderStats[]> {
  const db = await getDB()
  const result = db.prepare(`
    SELECT provider, COUNT(*) as count 
    FROM pricing 
    GROUP BY provider 
    ORDER BY provider
  `).all() as { results: ProviderStats[] }

  return result.results || []
}

const providerConfig: Record<string, { gradient: string; logo: string; description: string }> = {
  'MTN': {
    gradient: 'linear-gradient(135deg, #FFCC00 0%, #FFB800 100%)',
    logo: '/logos/mtn.png',
    description: 'MTN Data Bundles'
  },
  'AirtelTigo': {
    gradient: 'linear-gradient(135deg, #0078d4 0%, #0078d4 100%)',
    logo: '/logos/airteltigo.png',
    description: 'AirtelTigo Data Bundles'
  },
  'Telecel': {
    gradient: 'linear-gradient(135deg, #e74c3c 0%, #e74c3c 100%)',
    logo: '/logos/telecel.png',
    description: 'Telecel Data Bundles'
  }
}

export default async function StorePage() {
  const providers = await getProviderStats()

  return (
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
          const config = providerConfig[provider.provider]
          if (!config) return null

          return (
            <Link
              key={provider.provider}
              href={`/store/${provider.provider.toLowerCase()}`}
              className="group"
            >
              <div
                className="relative rounded-[28px] p-5 overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer"
                style={{
                  background: config.gradient,
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: `
                    0 20px 60px rgba(0, 0, 0, 0.25),
                    0 8px 24px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                  `,
                }}
              >
                {/* Glassy overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(0, 0, 0, 0.1) 100%)',
                  }}
                />

                <div className="relative flex items-center gap-4">
                  {/* Logo */}
                  <div
                    className="w-16 h-16 rounded-[18px] flex items-center justify-center overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.12),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.05)
                      `,
                    }}
                  >
                    <Image
                      src={config.logo}
                      alt={provider.provider}
                      width={64}
                      height={64}
                      className="object-cover scale-110"
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-0.5 drop-shadow-lg">
                      {provider.provider}
                    </h3>
                    <p className="text-white/90 text-xs font-medium drop-shadow">
                      {provider.count} packages available
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
