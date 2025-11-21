
"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { CheckCircle } from "lucide-react"

export default function AdminValidationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Agent Validations</h3>
                <p className="text-sm text-muted-foreground">
                    Review and approve new agent registration requests.
                </p>
            </div>
            <GlassCard className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <CheckCircle className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h2 className="text-xl font-semibold">Agent Validation Module</h2>
                <p className="text-muted-foreground max-w-md mt-2">
                    This module is currently under development. It will list pending agent applications for your review and approval.
                </p>
            </GlassCard>
        </div>
    )
}
