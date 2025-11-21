
"use client"

import { useAuth } from "@/contexts/auth-context"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Wallet } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function WalletPage() {
    const { user } = useAuth()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Wallet</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your funds and view transaction history.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Balance Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 p-8 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-black/10 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">Current Balance</p>
                                <h2 className="text-4xl font-bold tracking-tight">
                                    GHS {user?.wallet_balance?.toFixed(2) || '0.00'}
                                </h2>
                            </div>
                            <Wallet className="h-8 w-8 text-blue-200/50" />
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                <Plus className="mr-2 h-4 w-4" /> Top Up
                            </Button>
                            <Button variant="secondary" className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                <ArrowUpRight className="mr-2 h-4 w-4" /> Transfer
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Stats */}
                <div className="grid gap-4">
                    <GlassCard className="flex flex-col justify-center items-center text-center space-y-2">
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            <ArrowDownLeft className="h-6 w-6" />
                        </div>
                        <div className="font-semibold">Total Deposited</div>
                        <div className="text-2xl font-bold">GHS 0.00</div>
                    </GlassCard>
                    <GlassCard className="flex flex-col justify-center items-center text-center space-y-2">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div className="font-semibold">Total Spent</div>
                        <div className="text-2xl font-bold">GHS 0.00</div>
                    </GlassCard>
                </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Transactions</h3>
                <GlassCard className="p-0 overflow-hidden">
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No transactions yet.</p>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
