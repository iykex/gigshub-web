import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Wallet, TrendingUp, History, Plus } from 'lucide-react'

export default function AgentDashboard() {
  return (
    <div>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agent Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Agent.</p>
          </div>
          <Button className="rounded-full shadow-lg" asChild>
            <Link href="/store">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Wallet Balance</span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">GHS 450.00</div>
            <Link href="/dashboard/agent/wallet">
              <Button variant="link" className="px-0 h-auto text-xs text-primary">
                Top up wallet &rarr;
              </Button>
            </Link>
          </GlassCard>

          <GlassCard className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Sales</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">GHS 1,240.00</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </GlassCard>

          <GlassCard className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
              <History className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Last order 2 mins ago</p>
          </GlassCard>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Reference</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-mono">REF-{Math.random().toString(36).substring(7).toUpperCase()}</td>
                      <td className="px-6 py-4">Data Purchase</td>
                      <td className="px-6 py-4 font-medium">GHS 25.00</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                          Success
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">Just now</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
