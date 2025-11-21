
"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { MessageSquare } from "lucide-react"

export default function AdminSMSPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Bulk SMS Campaign</h3>
                <p className="text-sm text-muted-foreground">
                    Send promotional SMS messages to user groups.
                </p>
            </div>
            <GlassCard className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h2 className="text-xl font-semibold">SMS Campaign Module</h2>
                <p className="text-muted-foreground max-w-md mt-2">
                    This module is currently under development. It will allow you to compose and send bulk SMS to filtered user lists.
                </p>
            </GlassCard>
        </div>
    )
}
