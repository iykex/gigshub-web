
"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Users, ShoppingBag, CreditCard, CheckCircle, MessageSquare, Store, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const adminLinks = [
  {
    title: "Manage Users & Agents",
    description: "View, edit, and manage all user and agent accounts.",
    icon: Users,
    href: "/dashboard/admin/users",
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/20"
  },
  {
    title: "Manage Orders",
    description: "Track and process customer data bundle orders.",
    icon: ShoppingBag,
    href: "/dashboard/admin/orders",
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/20"
  },
  {
    title: "Manage Topups",
    description: "Oversee wallet top-up requests and transactions.",
    icon: CreditCard,
    href: "/dashboard/admin/topups",
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/20"
  },
  {
    title: "Agent Validations",
    description: "Review and approve new agent registration requests.",
    icon: CheckCircle,
    href: "/dashboard/admin/validations",
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/20"
  },
  {
    title: "Bulk SMS Campaign",
    description: "Send promotional SMS messages to user groups.",
    icon: MessageSquare,
    href: "/dashboard/admin/sms",
    color: "text-pink-500",
    bg: "bg-pink-100 dark:bg-pink-900/20"
  },
  {
    title: "Store & Pricing",
    description: "Update data bundle prices and store settings.",
    icon: Store,
    href: "/dashboard/admin/store",
    color: "text-cyan-500",
    bg: "bg-cyan-100 dark:bg-cyan-900/20"
  }
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your platform, users, and operations from one central hub.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((link) => (
          <GlassCard key={link.title} className="flex flex-col justify-between h-full hover:border-blue-500/50 transition-colors">
            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${link.bg}`}>
                <link.icon className={`w-6 h-6 ${link.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{link.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-between mt-6 group" asChild>
              <Link href={link.href}>
                Access Module
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
