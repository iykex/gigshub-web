"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { CreditCard, Check, X, MoreHorizontal, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR, { mutate } from "swr"
import { useToast } from "@/hooks/use-toast"

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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminTopupsPage() {
    const [page, setPage] = useState(1)
    const { toast } = useToast()
    const [processingId, setProcessingId] = useState<string | null>(null)

    const { data, error, isLoading } = useSWR(`/api/admin/topups?page=${page}&limit=10`, fetcher, {
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
                const err = await res.json()
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

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Manage Topups</h3>
                <p className="text-sm text-muted-foreground">
                    Oversee wallet top-up requests and transactions.
                </p>
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
        </div>
    )
}
