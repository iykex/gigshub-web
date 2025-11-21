
"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Users, ShoppingBag, CreditCard, CheckCircle, MessageSquare, Store, ArrowRight, TrendingUp, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminDashboard() {
  const { data: stats, error, isLoading } = useSWR('/api/admin/stats', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false
  })

  const adminModules = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      href: "/dashboard/admin/users",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Order Management",
      description: "View and process customer orders",
      icon: ShoppingBag,
      href: "/dashboard/admin/orders",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Wallet Topups",
      description: "Approve manual wallet funding requests",
      icon: CreditCard,
      href: "/dashboard/admin/topups",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Agent Validations",
      description: "Review and approve agent applications",
      icon: CheckCircle,
      href: "/dashboard/admin/validations",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "SMS Campaigns",
      description: "Manage bulk SMS pricing and routes",
      icon: MessageSquare,
      href: "/dashboard/admin/sms",
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      title: "Store & Pricing",
      description: "Update product prices and inventory",
      icon: Store,
      href: "/dashboard/admin/store",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of system performance and management modules.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-24" /> : `GHS ${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            +20.1% from last month
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Users</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalUsers || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            +180 since last hour
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Orders</h3>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalOrders || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            +19% from last month
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pending Validations</h3>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-12" /> : stats?.pendingValidations || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Requires attention
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminModules.map((module) => (
          <Link key={module.title} href={module.href}>
            <GlassCard className="h-full hover:bg-muted/50 transition-colors group cursor-pointer relative overflow-hidden">
              <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${module.color}`}>
                <module.icon className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${module.bg} ${module.color}`}>
                  <module.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{module.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {module.description}
                </p>
                <Button variant="ghost" className="p-0 h-auto font-medium group-hover:translate-x-1 transition-transform">
                  Access Module <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
