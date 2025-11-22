import { mockPricingData } from "@/lib/mock-data"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Save, RotateCcw } from 'lucide-react'

export default function PricingManager() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Manager</h1>
          <p className="text-muted-foreground">Update package prices and agent rates.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full glass">
            <RotateCcw className="mr-2 h-4 w-4" />
            Discard Changes
          </Button>
          <Button className="rounded-full shadow-lg">
            <Save className="mr-2 h-4 w-4" />
            Publish Changes
          </Button>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Provider</th>
                <th className="px-6 py-3 font-medium">Package Name</th>
                <th className="px-6 py-3 font-medium">Size</th>
                <th className="px-6 py-3 font-medium">Current Price (GHS)</th>
                <th className="px-6 py-3 font-medium">Agent Price (GHS)</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {mockPricingData.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <Badge variant="outline">{pkg.provider}</Badge>
                  </td>
                  <td className="px-6 py-4 font-medium">{pkg.name}</td>
                  <td className="px-6 py-4">{pkg.size}</td>
                  <td className="px-6 py-4">
                    <Input 
                      type="number" 
                      defaultValue={pkg.price} 
                      className="w-24 h-8 bg-white/50 dark:bg-black/20"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Input 
                      type="number" 
                      defaultValue={pkg.agent_price || ''} 
                      className="w-24 h-8 bg-white/50 dark:bg-black/20"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
