"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Wallet, TrendingUp, History, Plus, ShoppingBag, ArrowUpRight } from 'lucide-react'
import { useAuth } from "@/contexts/auth-context"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AgentDashboard() {
  const { user } = useAuth()

  // Fetch real-time wallet balance
  const { data: walletData } = useSWR(
    user ? `/api/user/wallet?userId=${user.id}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  // Fetch agent statistics
  const { data: statsData } = useSWR(user ? `/api/user/stats?userId=${user.id}` : null, fetcher, {
    refreshInterval: 60000, // Refresh every minute
  })

  // Get time of day greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{greeting}, Agent {user?.name?.split(' ')[0] || 'User'}!</h1>
            <p className="text-muted-foreground">Manage your agent operations and track your performance.</p>
          </div>
          <Button className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/stores">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="space-y-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Wallet Balance</span>
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              GHS {walletData?.balance?.toFixed(2) || '0.00'}
            </div>
            <Link href="/dashboard/agent/wallet">
              <Button variant="link" className="px-0 h-auto text-xs text-blue-600 dark:text-blue-400">
                Top up wallet <ArrowUpRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </GlassCard>

          <GlassCard className="space-y-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
              <ShoppingBag className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {statsData?.totalOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {statsData?.successfulOrders || 0} successful
            </p>
          </GlassCard>

          <GlassCard className="space-y-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Commission Earned</span>
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
              GHS {statsData?.commissionEarned?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">From completed orders</p>
          </GlassCard>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/agent/orders">View all</Link>
            </Button>
          </div>
          <GlassCard className="p-0 overflow-hidden">
            {!statsData || !statsData.recentOrders || statsData.recentOrders.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No recent orders found</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/stores">Start processing orders</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 font-medium">Order ID</th>
                      <th className="px-6 py-3 font-medium">Product</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {statsData.recentOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                        <td className="px-6 py-4">{order.product_name}</td>
                        <td className="px-6 py-4 font-medium">GHS {order.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${order.status === 'success'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : order.status === 'pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
