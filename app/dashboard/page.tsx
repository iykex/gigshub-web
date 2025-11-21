"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { GlassCard } from "@/components/ui/glass-card"
import { Wallet, ShoppingBag, ArrowUpRight, Plus, History } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { user } = useAuth()

  // Fetch real-time wallet balance
  const { data: walletData } = useSWR(
    user ? `/api/user/wallet?userId=${user.id}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  // Get time of day greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{greeting}, {user?.name?.split(' ')[0] || 'User'}!</h1>
          {/* <p className="text-muted-foreground">Here's what's happening with your account today.</p> */}
        </div>
        <Button className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700" asChild>
          <Link href="/store">
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
          <Link href="/dashboard/wallet">
            <Button variant="link" className="px-0 h-auto text-xs text-blue-600 dark:text-blue-400">
              Top up wallet <ArrowUpRight className="ml-1 w-3 h-3" />
            </Button>
          </Link>
        </GlassCard>

        <GlassCard className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
            <ShoppingBag className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">Start purchasing data bundles</p>
        </GlassCard>

        <GlassCard className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Account Status</span>
            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 capitalize">
              Active
            </span>
          </div>
          <div className="text-lg font-medium capitalize mt-2">{user?.role || 'User'} Account</div>
          <p className="text-xs text-muted-foreground">Member since {new Date().getFullYear()}</p>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/orders">View all</Link>
          </Button>
        </div>

        <GlassCard className="p-0 overflow-hidden min-h-[200px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No recent transactions found</p>
            <Button variant="link" asChild>
              <Link href="/store">Make your first purchase</Link>
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}