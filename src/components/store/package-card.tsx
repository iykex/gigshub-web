import { Link } from "react-router-dom"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PricingPackage } from "@/types"
import { Wifi } from 'lucide-react'

interface PackageCardProps {
  package: PricingPackage
  showAgentPrice?: boolean
}

export function PackageCard({ package: pkg, showAgentPrice = false }: PackageCardProps) {
  const displayPrice = showAgentPrice && pkg.agent_price ? pkg.agent_price : pkg.price

  return (
    <GlassCard className="flex flex-col space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{pkg.size}</h3>
            <p className="text-sm text-muted-foreground">{pkg.name}</p>
          </div>
        </div>
        {showAgentPrice && pkg.agent_price && pkg.agent_price < pkg.price && (
          <Badge variant="secondary" className="text-xs">Agent Price</Badge>
        )}
      </div>

      <div className="flex items-end justify-between pt-2 border-t border-border/50">
        <div>
          <p className="text-2xl font-bold text-primary">GHS {displayPrice.toFixed(2)}</p>
          {showAgentPrice && pkg.agent_price && pkg.agent_price < pkg.price && (
            <p className="text-xs text-muted-foreground line-through">GHS {pkg.price.toFixed(2)}</p>
          )}
        </div>
        <Button size="sm" className="rounded-full" asChild>
          <Link to={`/checkout?package=${pkg.id}`}>
            Buy Now
          </Link>
        </Button>
      </div>
    </GlassCard>
  )
}
