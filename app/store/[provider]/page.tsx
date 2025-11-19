import { notFound } from 'next/navigation'
import { PackageCard } from "@/components/store/package-card"
import { getPackagesByProvider, getAllProviders } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"

interface ProviderPageProps {
  params: Promise<{
    provider: string
  }>
}

export async function generateStaticParams() {
  const providers = getAllProviders()
  return providers.map((provider) => ({
    provider: provider.toLowerCase(),
  }))
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { provider } = await params
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1)
  
  // Check if provider exists
  const allProviders = getAllProviders()
  if (!allProviders.map(p => p.toLowerCase()).includes(provider.toLowerCase())) {
    notFound()
  }

  const packages = getPackagesByProvider(providerName)

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} package={pkg} />
        ))}
      </div>
    </div>
  )
}
