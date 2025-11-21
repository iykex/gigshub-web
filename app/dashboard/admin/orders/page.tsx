
"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { ShoppingBag } from "lucide-react"

export default function AdminOrdersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Manage Orders</h3>
                <p className="text-sm text-muted-foreground">
                    Track and process customer data bundle orders.
                </p>
            </div>
            <GlassCard className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h2 className="text-xl font-semibold">Order Management Module</h2>
                <p className="text-muted-foreground max-w-md mt-2">
                    This module is currently under development. It will allow you to view all orders, update statuses, and process refunds.
                </p>
            </GlassCard>
        </div>
    )
}
