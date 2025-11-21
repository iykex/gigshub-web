
"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Store } from "lucide-react"

export default function AdminStorePage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Store & Pricing</h3>
                <p className="text-sm text-muted-foreground">
                    Update data bundle prices and store settings.
                </p>
            </div>
            <GlassCard className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <Store className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h2 className="text-xl font-semibold">Store Management Module</h2>
                <p className="text-muted-foreground max-w-md mt-2">
                    This module is currently under development. It will allow you to manage product listings, update prices, and toggle availability.
                </p>
            </GlassCard>
        </div>
    )
}
