import { Link } from "react-router-dom"
import { GlassCard } from "@/components/ui/glass-card"
import { ArrowRight } from 'lucide-react'

interface ProviderCardProps {
  provider: string
  packageCount: number
}

export function ProviderCard({ provider, packageCount }: ProviderCardProps) {
  const providerColors = {
    MTN: 'from-yellow-400 to-yellow-600',
    Telecel: 'from-red-400 to-red-600',
    AirtelTigo: 'from-blue-400 to-blue-600',
  }

  const color = providerColors[provider as keyof typeof providerColors] || 'from-gray-400 to-gray-600'

  return (
    <Link to={`/stores/${provider.toLowerCase()}`}>
      <GlassCard className="group cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${color} text-white text-sm font-semibold`}>
              {provider}
            </div>
            <p className="text-sm text-muted-foreground">
              {packageCount} packages available
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </GlassCard>
    </Link>
  )
}
