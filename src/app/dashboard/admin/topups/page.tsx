import { GlassCard } from "@/components/ui/glass-card"
import { CreditCard, Check, X, MoreHorizontal, Loader2, Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR, { mutate } from "swr"
import { toast } from "@/lib/toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Topup {
    id: string
    user_name: string
    user_email: string
    amount: number
    reference: string
    payment_method: string
    status: string
    created_at: string
}

interface TopupsResponse {
    topups: Topup[]
    pagination: {
        totalPages: number
    }
}

interface ErrorResponse {
    error: string
}

interface User {
    id: string
    name: string
    email: string
    role?: string
}

const fetcher = (url: string): Promise<TopupsResponse> => fetch(url).then((res) => res.json())

export default function AdminTopupsPage() {
    const [page, setPage] = useState(1)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [isManualTxOpen, setIsManualTxOpen] = useState(false)
    const [manualTx, setManualTx] = useState({
        userId: "",
        userEmail: "",
        amount: "",
        type: "credit",
        description: ""
    })
    const [isProcessing, setIsProcessing] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)

    const fetchUsers = async () => {
        setIsLoadingUsers(true)
        try {
            const res = await fetch('/api/admin/users?limit=100') // Fetch up to 100 users for now
            const data = await res.json() as { users: User[] }
            if (data.users) {
                setUsers(data.users)
            }
        } catch (error) {
            console.error("Failed to fetch users", error)
            toast({
                title: "Error",
                description: "Failed to load user list",
                variant: "destructive"
            })
        } finally {
            setIsLoadingUsers(false)
        }
    }

    // Fetch users when dialog opens
    const handleOpenManualTx = () => {
        setIsManualTxOpen(true)
        fetchUsers()
    }

    const { data, error, isLoading } = useSWR<TopupsResponse>(`/api/admin/topups?page=${page}&limit=10`, fetcher, {
        refreshInterval: 10000, // Poll every 10 seconds
        revalidateOnFocus: false
    })

    const topups: Topup[] = data?.topups || []
    const totalPages = data?.pagination?.totalPages || 1

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setProcessingId(id)
        try {
            const res = await fetch('/api/admin/topups/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action })
            })

            if (!res.ok) {
                const err = await res.json() as ErrorResponse
                throw new Error(err.error || 'Failed to process request')
            }

            toast({
                title: "Success",
                description: `Topup request ${action}ed successfully.`,
            })

            // Revalidate the data
            mutate(`/api/admin/topups?page=${page}&limit=10`)
            // Also revalidate stats as revenue might change
            mutate('/api/admin/stats')

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setProcessingId(null)
        }
    }

    const handleManualTransaction = async () => {
        if (!manualTx.userId || !manualTx.amount || parseFloat(manualTx.amount) <= 0) {
            toast({
                title: "Invalid Input",
                description: "Please provide valid user ID and amount.",
                variant: "destructive"
            })
            return
        }

        setIsProcessing(true)
        try {
            const res = await fetch('/api/admin/wallet/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: manualTx.userId,
                    amount: parseFloat(manualTx.amount),
                    type: manualTx.type,
                    description: manualTx.description || `Admin ${manualTx.type}`
                })
            })

            if (!res.ok) {
                const err = await res.json() as ErrorResponse
                throw new Error(err.error || 'Failed to process transaction')
            }

            toast({
                title: "Success",
                description: `Successfully ${manualTx.type === 'credit' ? 'credited' : 'debited'} GHS ${manualTx.amount}.`,
            })

            setIsManualTxOpen(false)
            setManualTx({ userId: "", userEmail: "", amount: "", type: "credit", description: "" })
            mutate(`/api/admin/topups?page=${page}&limit=10`)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const fetchUserByEmail = async (email: string) => {
        if (!email) return
        try {
            const res = await fetch(`/api/auth/me?email=${email}`)
            if (res.ok) {
                const data = await res.json() as { user: User }
                if (data.user) {
                    setManualTx(prev => ({ ...prev, userId: data.user.id, userEmail: email }))
                }
            }
        } catch (error) {
            console.error("Failed to fetch user", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-medium">Manage Topups</h3>
                    <p className="text-sm text-muted-foreground">
                        Oversee wallet top-up requests and transactions.
                    </p>
                </div>
                <Button onClick={handleOpenManualTx}>
                    <Plus className="w-4 h-4 mr-2" />
                    Manual Transaction
                </Button>
            </div>

            {/* Desktop Table */}
            <GlassCard className="hidden md:block p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3">Reference</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Method</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : topups.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                                        No topup requests found.
                                    </td>
                                </tr>
                            ) : (
                                topups.map((topup) => (
                                    <tr key={topup.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                            {topup.reference}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{topup.user_name || 'Unknown'}</div>
                                            <div className="text-xs text-muted-foreground">{topup.user_email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">GHS {topup.amount?.toFixed(2)}</td>
                                        <td className="px-6 py-4">{topup.payment_method}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${topup.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                    topup.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                        topup.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                {topup.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(topup.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {topup.status === 'pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                        onClick={() => handleAction(topup.id, 'approve')}
                                                        disabled={!!processingId}
                                                    >
                                                        {processingId === topup.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={() => handleAction(topup.id, 'reject')}
                                                        disabled={!!processingId}
                                                    >
                                                        {processingId === topup.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="ghost" size="icon" disabled>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <GlassCard key={i} className="p-4">
                            <div className="flex justify-between mb-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </GlassCard>
                    ))
                ) : topups.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No topup requests found.</div>
                ) : (
                    topups.map((topup) => (
                        <GlassCard key={topup.id} className="p-4">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="font-mono text-xs text-muted-foreground mb-1">{topup.reference}</div>
                                    <div className="font-medium">GHS {topup.amount?.toFixed(2)}</div>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                    ${topup.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                        topup.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                            topup.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                    {topup.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="text-muted-foreground text-xs">User</p>
                                    <p className="font-medium mt-1">{topup.user_name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground">{topup.user_email}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Method</p>
                                    <p className="mt-1">{topup.payment_method}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Date</p>
                                    <p className="mt-1">{new Date(topup.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {topup.status === 'pending' && (
                                <div className="flex justify-end gap-2 border-t pt-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                        onClick={() => handleAction(topup.id, 'approve')}
                                        disabled={!!processingId}
                                    >
                                        {processingId === topup.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => handleAction(topup.id, 'reject')}
                                        disabled={!!processingId}
                                    >
                                        {processingId === topup.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </GlassCard>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
                <div className="text-xs text-muted-foreground">
                    Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Manual Transaction Dialog */}
            <Dialog open={isManualTxOpen} onOpenChange={setIsManualTxOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manual Wallet Transaction</DialogTitle>
                        <DialogDescription>
                            Manually credit or debit a user's wallet balance.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="userId">Select User</Label>
                            <Select
                                value={manualTx.userId}
                                onValueChange={(value) => {
                                    const selectedUser = users.find(u => u.id === value)
                                    setManualTx(prev => ({
                                        ...prev,
                                        userId: value,
                                        userEmail: selectedUser?.email || ""
                                    }))
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select a user"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name || 'Unknown'} ({user.email}) - {user.role || 'user'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="txType">Transaction Type</Label>
                            <Select value={manualTx.type} onValueChange={(value) => setManualTx(prev => ({ ...prev, type: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit">Credit (Add Funds)</SelectItem>
                                    <SelectItem value="debit">Debit (Deduct Funds)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="txAmount">Amount (GHS)</Label>
                            <Input
                                id="txAmount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={manualTx.amount}
                                onChange={(e) => setManualTx(prev => ({ ...prev, amount: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="txDescription">Description (Optional)</Label>
                            <Input
                                id="txDescription"
                                placeholder="e.g., Refund, Bonus, Correction"
                                value={manualTx.description}
                                onChange={(e) => setManualTx(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsManualTxOpen(false)} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button onClick={handleManualTransaction} disabled={isProcessing}>
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Process Transaction
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
