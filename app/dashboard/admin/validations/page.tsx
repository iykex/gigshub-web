"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { CheckCircle, Check, X, MoreHorizontal, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR, { mutate } from "swr"
import { useToast } from "@/hooks/use-toast"

interface Validation {
    id: string
    user_name: string
    user_email: string
    user_phone: string
    business_name: string
    business_registration_number: string
    status: string
    created_at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminValidationsPage() {
    const [page, setPage] = useState(1)
    const { toast } = useToast()
    const [processingId, setProcessingId] = useState<string | null>(null)

    const { data, error, isLoading } = useSWR(`/api/admin/validations?page=${page}&limit=10`, fetcher, {
        refreshInterval: 10000,
        revalidateOnFocus: false
    })

    const validations: Validation[] = data?.validations || []
    const totalPages = data?.pagination?.totalPages || 1

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setProcessingId(id)
        try {
            const res = await fetch('/api/admin/validations/action', {
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
                description: `Validation request ${action}ed successfully.`,
            })

            // Revalidate the data
            mutate(`/api/admin/validations?page=${page}&limit=10`)
            // Also revalidate stats as pending validations count changes
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
                <h3 className="text-lg font-medium">Agent Validations</h3>
                <p className="text-sm text-muted-foreground">
                    Review and approve new agent registration requests.
                </p>
            </div>

            {/* Desktop Table */}
            <GlassCard className="hidden md:block p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3">Agent</th>
                                <th className="px-6 py-3">Business Name</th>
                                <th className="px-6 py-3">Reg. Number</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-40" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : validations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        No pending validations found.
                                    </td>
                                </tr>
                            ) : (
                                validations.map((validation) => (
                                    <tr key={validation.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{validation.user_name || 'Unknown'}</div>
                                            <div className="text-xs text-muted-foreground">{validation.user_email}</div>
                                            <div className="text-xs text-muted-foreground">{validation.user_phone}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{validation.business_name}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{validation.business_registration_number}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${validation.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                    validation.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                        validation.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                {validation.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(validation.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {validation.status === 'pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                        onClick={() => handleAction(validation.id, 'approve')}
                                                        disabled={!!processingId}
                                                    >
                                                        {processingId === validation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={() => handleAction(validation.id, 'reject')}
                                                        disabled={!!processingId}
                                                    >
                                                        {processingId === validation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
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
                ) : validations.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No pending validations found.</div>
                ) : (
                    validations.map((validation) => (
                        <GlassCard key={validation.id} className="p-4">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="font-medium">{validation.business_name}</div>
                                    <div className="font-mono text-xs text-muted-foreground">{validation.business_registration_number}</div>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                    ${validation.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                        validation.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                            validation.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                    {validation.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="text-muted-foreground text-xs">Agent</p>
                                    <p className="font-medium mt-1">{validation.user_name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground">{validation.user_email}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Phone</p>
                                    <p className="mt-1">{validation.user_phone}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Date</p>
                                    <p className="mt-1">{new Date(validation.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {validation.status === 'pending' && (
                                <div className="flex justify-end gap-2 border-t pt-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                        onClick={() => handleAction(validation.id, 'approve')}
                                        disabled={!!processingId}
                                    >
                                        {processingId === validation.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => handleAction(validation.id, 'reject')}
                                        disabled={!!processingId}
                                    >
                                        {processingId === validation.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
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
