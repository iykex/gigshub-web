import { notFound } from 'next/navigation'
import { PackageCard } from "@/components/store/package-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { getDB } from "@/lib/db"
import { PricingPackage } from "@/types"

interface ProviderPageProps {
  params: Promise<{
    provider: string
  }>
}

async function getPackagesByProvider(provider: string): Promise<PricingPackage[]> {
  try {
    const db = await getDB()
    if (!db) return []

    const result = await db.prepare(`
      SELECT 
        id, provider, name, size, price, agent_price, product_code,
        COALESCE(is_active, 1) as is_active,
        updated_by, 
        COALESCE(updated_at, datetime('now')) as updated_at,
        COALESCE(version, 1) as version
      FROM pricing 
      WHERE LOWER(provider) = LOWER(?) 
      ORDER BY price ASC
    `).bind(provider).all()

    return (result.results as PricingPackage[]) || []
  } catch (error) {
    console.error('Error fetching packages:', error)
    return []
  }
}

async function getAllProviders(): Promise<string[]> {
  try {
    const db = await getDB()
    if (!db) return []

    const result = await db.prepare(`
      SELECT DISTINCT provider FROM pricing ORDER BY provider
    `).all()

    return ((result.results as { provider: string }[]) || []).map(r => r.provider)
  } catch (error) {
    console.error('Error fetching providers:', error)
    return []
  }
}

export async function generateStaticParams() {
  const providers = await getAllProviders()
  return providers.map((provider) => ({
    provider: provider.toLowerCase(),
  }))
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { provider } = await params
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1)

  // Check if provider exists
  const allProviders = await getAllProviders()
  if (!allProviders.map(p => p.toLowerCase()).includes(provider.toLowerCase())) {
    notFound()
  }

  const packages = await getPackagesByProvider(providerName)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full glass" asChild>
          <Link href="/store">
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back to store</span>
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {providerName} Data Packages
          </h1>
          <p className="text-muted-foreground">
            {packages.length} packages available
          </p>
        </div>
      </div>

      {packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No packages available for this provider.</p>
        </div>
      )}
    </div>
  )
}
