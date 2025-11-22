"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { ShoppingBag, Search, Package, Clock, CheckCircle, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"
import { Badge } from "@/components/ui/badge"

interface Order {
    id: string
    product_name: string
    amount: number
    status: string
    created_at: string
    phone?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AgentOrdersPage() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    const { data, error, isLoading } = useSWR(`/api/user/orders?page=${page}&limit=10&search=${debouncedSearch}`, fetcher, {
        revalidateOnFocus: false
    })

    const orders: Order[] = data?.orders || []
    const totalPages = data?.pagination?.totalPages || 1

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                    <p className="text-muted-foreground">Track and manage your order history</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search orders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Desktop Table */}
            <GlassCard className="p-0 overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 font-medium">Order ID</th>
                                <th className="px-6 py-3 font-medium">Product</th>
                                <th className="px-6 py-3 font-medium">Amount</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                            {order.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 font-medium">{order.product_name}</td>
                                        <td className="px-6 py-4 font-medium">GHS {order.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                order.status === 'success' ? 'default' :
                                                    order.status === 'pending' ? 'secondary' :
                                                        'destructive'
                                            } className={
                                                order.status === 'success' ? 'bg-green-500 hover:bg-green-600' :
                                                    order.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                                        ''
                                            }>
                                                {order.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                {order.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                                {order.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString()}
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
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground text-xs">Amount</p>
                                    <p className="font-medium mt-1">GHS {order.amount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Date</p>
                                    <p className="mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </p>
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
