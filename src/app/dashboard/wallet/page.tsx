import { useAuth } from "@/contexts/auth-context"
import { Link } from "react-router-dom"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, CreditCard, Wallet, Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import useSWR from "swr"
import { Skeleton } from "@/components/ui/skeleton"

// Define the structure of a transaction
interface Transaction {
    id: string
    type: 'topup' | 'purchase' | 'transfer' | 'admin_credit' | 'admin_debit'
    reference: string
    change: number
    balance_after: number
    created_at: string
}

// Define the structure of wallet data returned from the API
interface WalletData {
    balance: number
    transactions: Transaction[]
}

const fetcher = (url: string): Promise<WalletData> => fetch(url).then((res) => res.json())

export default function WalletPage() {
    const { user } = useAuth()

    const { data, isLoading } = useSWR<WalletData>(user ? `/api/user/wallet?userId=${user.id}` : null, fetcher)

    const balance = data?.balance ?? user?.wallet_balance ?? 0
    const transactions = data?.transactions || []

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
                <div className="relative overflow-hidden bg-white/50 dark:bg-gray-900/50 rounded-xl p-8 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-black/10 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">Current Balance</p>
                                <h2 className="text-4xl font-bold tracking-tight">
                                    {isLoading ? <Skeleton className="h-10 w-40 bg-white/20" /> : `GHS ${balance.toFixed(2)}`}
                                </h2>
                            </div>
                            <Wallet className="h-8 w-8 text-blue-200/50" />
                        </div>

                        <div className="flex gap-3">
                            <Link to="/wallet/topup" className="flex-1">
                                <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                    <Plus className="mr-2 h-4 w-4" /> Top Up
                                </Button>
                            </Link>

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
                        <div className="text-2xl font-bold">GHS {transactions.filter((t: Transaction) => t.type === 'topup').reduce((acc: number, t: Transaction) => acc + t.change, 0).toFixed(2)}</div>
                    </GlassCard>
                    <GlassCard className="flex flex-col justify-center items-center text-center space-y-2">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div className="font-semibold">Total Spent</div>
                        <div className="text-2xl font-bold">GHS {transactions.filter((t: Transaction) => t.type === 'purchase').reduce((acc: number, t: Transaction) => acc + t.change, 0).toFixed(2)}</div>
                    </GlassCard>
                </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Recent Transactions</h3>
                <GlassCard className="p-0 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <p>No transactions yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Reference</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Balance After</th>
                                        <th className="px-6 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {transactions.map((t: Transaction) => (
                                        <tr key={t.id} className="hover:bg-muted/50">
                                            <td className="px-6 py-4 capitalize">{t.type}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{t.reference}</td>
                                            <td className={`px-6 py-4 font-medium ${(t.type === 'topup' || t.type === 'admin_credit') ? 'text-green-600' : 'text-red-600'}`}>
                                                {(t.type === 'topup' || t.type === 'admin_credit') ? '+' : '-'}GHS {t.change.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">GHS {t.balance_after.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    )
}
