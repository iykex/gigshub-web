
"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function OrdersPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-medium">Orders</h3>
                    <p className="text-sm text-muted-foreground">
                        View and track your data bundle purchases.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/stores">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        New Order
                    </Link>
                </Button>
            </div>
            <Separator />

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search orders..."
                        className="pl-9 bg-white/50 dark:bg-gray-900/50"
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {/* Orders List */}
            <GlassCard className="p-0 overflow-hidden min-h-[300px] flex flex-col items-center justify-center text-center">
                <div className="p-8 space-y-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">No orders yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                            You haven't placed any orders yet. Visit the store to purchase data bundles.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="mt-4">
                        <Link href="/stores">Go to Store</Link>
                    </Button>
                </div>
            </GlassCard>
        </div>
    )
}
