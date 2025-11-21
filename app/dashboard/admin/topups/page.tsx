
"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { CreditCard } from "lucide-react"

export default function AdminTopupsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Manage Topups</h3>
                <p className="text-sm text-muted-foreground">
                    Oversee wallet top-up requests and transactions.
                </p>
            </div>
            <GlassCard className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <CreditCard className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h2 className="text-xl font-semibold">Topup Management Module</h2>
                <p className="text-muted-foreground max-w-md mt-2">
                    This module is currently under development. It will allow you to verify and approve manual wallet top-up requests.
                </p>
            </GlassCard>
        </div>
    )
}
