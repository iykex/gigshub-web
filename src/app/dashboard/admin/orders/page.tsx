"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { ShoppingBag, Search, MoreHorizontal, Eye, CheckCircle, XCircle, Loader2, Calendar, User, Package, DollarSign, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR, { mutate } from "swr"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/lib/toast"
import { Separator } from "@/components/ui/separator"

interface Order {
    id: string
    user_id: string
    user_name?: string
    user_email?: string
    product_name: string
    amount: number
    status: string
    created_at: string
    phone?: string
    provider?: string
}

interface OrdersResponse {
    orders: Order[]
    pagination: {
        totalPages: number
    }
}

interface ErrorResponse {
    error: string
}

const fetcher = (url: string): Promise<OrdersResponse> => fetch(url).then((res) => res.json())

export default function AdminOrdersPage() {
    const [page, setPage] = useState(1)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)

    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    const { data, error, isLoading } = useSWR<OrdersResponse>(`/api/admin/orders?page=${page}&limit=10&search=${debouncedSearch}`, fetcher, {
        revalidateOnFocus: false
    })

    const orders: Order[] = data?.orders || []
    const totalPages = data?.pagination?.totalPages || 1

    const handleAction = async (action: string, order: Order) => {
        if (action === "View Details") {
            setSelectedOrder(order)
            setViewDialogOpen(true)
            return
        }

        let status = ''
        if (action === "Mark Success") status = 'success'
        if (action === "Mark Failed") status = 'failed'

        if (!status) return

        setProcessingId(order.id)
        try {
            const res = await fetch('/api/admin/orders/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    status: status
                })
            })

            if (!res.ok) {
                const err = await res.json() as ErrorResponse
                throw new Error(err.error || 'Failed to update order')
            }

            toast({
                title: "Success",
                description: `Order marked as ${status}.`,
            })
            mutate(`/api/admin/orders?page=${page}&limit=10`)
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

    const OrderActionsDesktop = ({ order }: { order: Order }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={processingId === order.id}>
                    {processingId === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <MoreHorizontal className="h-4 w-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleAction("View Details", order)}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAction("Mark Success", order)}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Mark Success
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction("Mark Failed", order)}>
                    <XCircle className="mr-2 h-4 w-4 text-red-600" /> Mark Failed
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

    const OrderActionsMobile = ({ order }: { order: Order }) => (
        <div className="flex gap-2 flex-wrap">
            {order.status === 'pending' && (
                <>
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-700 dark:text-green-400"
                        onClick={() => handleAction("Mark Success", order)}
                        disabled={processingId === order.id}
                    >
                        {processingId === order.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        Success
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-700 dark:text-red-400"
                        onClick={() => handleAction("Mark Failed", order)}
                        disabled={processingId === order.id}
                    >
                        {processingId === order.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                        )}
                        Failed
                    </Button>
                </>
            )}
            <Button
                size="sm"
                variant="ghost"
                className="flex-1"
                onClick={() => handleAction("View Details", order)}
                disabled={processingId === order.id}
            >
                <Eye className="h-3 w-3 mr-1" />
                Details
            </Button>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-medium">Order Management</h3>
                    <p className="text-sm text-muted-foreground">
                        Track and manage customer orders.
                    </p>
                </div>
                <div className="relative w-full md:w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search orders..."
                        className="pl-9 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Desktop Table */}
            <GlassCard className="hidden md:block p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                            {order.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{order.user_name || 'Unknown'}</div>
                                            <div className="text-xs text-muted-foreground">{order.user_email}</div>
                                        </td>
                                        <td className="px-6 py-4">{order.product_name}</td>
                                        <td className="px-6 py-4 font-medium">GHS {order.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                order.status === 'success' ? 'default' : // Using default for success (usually black/primary) or custom class
                                                    order.status === 'pending' ? 'secondary' :
                                                        'destructive'
                                            } className={
                                                order.status === 'success' ? 'bg-green-500 hover:bg-green-600' :
                                                    order.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                                        ''
                                            }>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <OrderActionsDesktop order={order} />
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
                ) : orders.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No orders found.</div>
                ) : (
                    orders.map((order) => (
                        <GlassCard key={order.id} className="p-4">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="font-mono text-xs text-muted-foreground mb-1">#{order.id.slice(0, 8)}</div>
                                    <div className="font-medium">{order.product_name}</div>
                                </div>
                                <Badge variant={
                                    order.status === 'success' ? 'default' :
                                        order.status === 'pending' ? 'secondary' :
                                            'destructive'
                                } className={
                                    order.status === 'success' ? 'bg-green-500 hover:bg-green-600' :
                                        order.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                            ''
                                }>
                                    {order.status}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="text-muted-foreground text-xs">Customer</p>
                                    <p className="font-medium mt-1">{order.user_name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground">{order.user_email}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Amount</p>
                                    <p className="font-medium mt-1">GHS {order.amount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Date</p>
                                    <p className="mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="border-t pt-3">
                                <OrderActionsMobile order={order} />
                            </div>
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

            {/* View Order Details Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>
                            Complete information about this order
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            {/* Order ID */}
                            <div className="flex items-start gap-3">
                                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Order ID</p>
                                    <p className="text-sm text-muted-foreground font-mono">{selectedOrder.id}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Customer Info */}
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Customer</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.user_name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground">{selectedOrder.user_email}</p>
                                    {selectedOrder.phone && (
                                        <p className="text-xs text-muted-foreground">{selectedOrder.phone}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Product */}
                            <div className="flex items-start gap-3">
                                <ShoppingBag className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Product</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.product_name}</p>
                                    {selectedOrder.provider && (
                                        <p className="text-xs text-muted-foreground capitalize">{selectedOrder.provider}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Amount */}
                            <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Amount</p>
                                    <p className="text-lg font-bold">GHS {selectedOrder.amount.toFixed(2)}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Status */}
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Status</p>
                                    <Badge variant={
                                        selectedOrder.status === 'success' ? 'default' :
                                            selectedOrder.status === 'pending' ? 'secondary' :
                                                'destructive'
                                    } className={
                                        selectedOrder.status === 'success' ? 'bg-green-500 hover:bg-green-600' :
                                            selectedOrder.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                                ''
                                    }>
                                        {selectedOrder.status}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            {/* Date */}
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(selectedOrder.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {selectedOrder.status === 'pending' && (
                                <>
                                    <Separator />
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            className="flex-1 bg-green-500 hover:bg-green-600"
                                            onClick={() => {
                                                setViewDialogOpen(false)
                                                handleAction("Mark Success", selectedOrder)
                                            }}
                                            disabled={processingId === selectedOrder.id}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Mark Success
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={() => {
                                                setViewDialogOpen(false)
                                                handleAction("Mark Failed", selectedOrder)
                                            }}
                                            disabled={processingId === selectedOrder.id}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Mark Failed
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
