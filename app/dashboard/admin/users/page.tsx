
"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Users } from "lucide-react"

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Manage Users & Agents</h3>
                <p className="text-sm text-muted-foreground">
                    View and manage all registered users and agents.
                </p>
            </div>
            <GlassCard className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <Users className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h2 className="text-xl font-semibold">User Management Module</h2>
                <p className="text-muted-foreground max-w-md mt-2">
                    This module is currently under development. It will allow you to view user details, change roles, and manage account statuses.
                </p>
            </GlassCard>
        </div>
    )
}
