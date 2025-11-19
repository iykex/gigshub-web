import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Users, Package, DollarSign, Settings } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your platform settings and users.</p>
        </div>
        <Button variant="outline" className="rounded-full glass" asChild>
          <Link href="/dashboard/admin/pricing">
            <Settings className="mr-2 h-4 w-4" />
            Manage Pricing
          </Link>
        </Button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Users</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">1,234</div>
        </GlassCard>

        <GlassCard className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Active Agents</span>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">56</div>
        </GlassCard>

        <GlassCard className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">GHS 45,230</div>
        </GlassCard>

        <GlassCard className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Active Packages</span>
            <Package className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">38</div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="space-y-4">
          <h3 className="font-semibold text-lg">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">MTN API</span>
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Telecel API</span>
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AirtelTigo API</span>
              <span className="flex h-2 w-2 rounded-full bg-yellow-500"></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Paystack Payments</span>
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="font-semibold text-lg">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 text-sm">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  A
                </div>
                <div>
                  <p className="font-medium">New agent registration</p>
                  <p className="text-muted-foreground text-xs">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
