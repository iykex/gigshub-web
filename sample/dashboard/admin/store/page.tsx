"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Store, Save, Loader2, RotateCcw } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR, { mutate } from "swr"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Product {
    id: number
    provider: string
    name: string
    size: string
    price: number
    agent_price: number
    product_code: string
    is_active: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminStorePage() {
    const { toast } = useToast()
    const { data, error, isLoading } = useSWR('/api/admin/stores', fetcher)
    const [products, setProducts] = useState<Product[]>([])
    const [savingId, setSavingId] = useState<number | null>(null)
    const [hasChanges, setHasChanges] = useState<Record<number, boolean>>({})

    useEffect(() => {
        if (data?.products) {
            setProducts(data.products)
        }
    }, [data])

    const handleProductChange = (id: number, field: keyof Product, value: any) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, [field]: value }
            }
            return p
        }))
        setHasChanges(prev => ({ ...prev, [id]: true }))
    }

    const handleSave = async (product: Product) => {
        setSavingId(product.id)
        try {
            const res = await fetch('/api/admin/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: product.id,
                    price: Number(product.price),
                    agent_price: Number(product.agent_price),
                    is_active: product.is_active
                })
            })

            if (!res.ok) throw new Error('Failed to update product')

            toast({
                title: "Success",
                description: "Product updated successfully",
            })

            setHasChanges(prev => {
                const next = { ...prev }
                delete next[product.id]
                return next
            })

            mutate('/api/admin/stores')

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save changes",
                variant: "destructive"
            })
        } finally {
            setSavingId(null)
        }
    }

    const providers = ['MTN', 'Telecel', 'AT']

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Store & Pricing</h3>
                <p className="text-sm text-muted-foreground">
                    Manage data bundles, prices, and availability.
                </p>
            </div>

            <Tabs defaultValue="MTN" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    {providers.map(provider => (
                        <TabsTrigger key={provider} value={provider}>{provider}</TabsTrigger>
                    ))}
                </TabsList>

                {providers.map(provider => (
                    <TabsContent key={provider} value={provider}>
                        <GlassCard className="hidden md:block p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Product Name</th>
                                            <th className="px-6 py-3">Size</th>
                                            <th className="px-6 py-3 w-[150px]">Price (GHS)</th>
                                            <th className="px-6 py-3 w-[150px]">Agent Price</th>
                                            <th className="px-6 py-3 text-center">Active</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {isLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <tr key={i}>
                                                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                                    <td className="px-6 py-4"><Skeleton className="h-10 w-full" /></td>
                                                    <td className="px-6 py-4"><Skeleton className="h-10 w-full" /></td>
                                                    <td className="px-6 py-4"><Skeleton className="h-6 w-10 mx-auto" /></td>
                                                    <td className="px-6 py-4"><Skeleton className="h-9 w-20 ml-auto" /></td>
                                                </tr>
                                            ))
                                        ) : products.filter(p => p.provider === provider).length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                                    No products found for {provider}.
                                                </td>
                                            </tr>
                                        ) : (
                                            products.filter(p => p.provider === provider).map((product) => (
                                                <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium">
                                                        {product.name}
                                                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                                            {product.product_code}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline">{product.size}</Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={product.price}
                                                            onChange={(e) => handleProductChange(product.id, 'price', e.target.value)}
                                                            className="h-8 w-full"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={product.agent_price || ''}
                                                            onChange={(e) => handleProductChange(product.id, 'agent_price', e.target.value)}
                                                            className="h-8 w-full"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Switch
                                                            checked={!!product.is_active}
                                                            onCheckedChange={(checked) => handleProductChange(product.id, 'is_active', checked ? 1 : 0)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSave(product)}
                                                            disabled={!hasChanges[product.id] || savingId === product.id}
                                                            className={hasChanges[product.id] ? "bg-primary text-primary-foreground" : ""}
                                                            variant={hasChanges[product.id] ? "default" : "ghost"}
                                                        >
                                                            {savingId === product.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Save className="h-4 w-4" />
                                                            )}
                                                            <span className="ml-2 sr-only">Save</span>
                                                        </Button>
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
                                            <Skeleton className="h-10 w-full" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    </GlassCard>
                                ))
                            ) : products.filter(p => p.provider === provider).length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    No products found for {provider}.
                                </div>
                            ) : (
                                products.filter(p => p.provider === provider).map((product) => (
                                    <GlassCard key={product.id} className="p-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                                    {product.product_code}
                                                </div>
                                            </div>
                                            <Badge variant="outline">{product.size}</Badge>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-muted-foreground">Price (GHS)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={product.price}
                                                        onChange={(e) => handleProductChange(product.id, 'price', e.target.value)}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-muted-foreground">Agent Price</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={product.agent_price || ''}
                                                        onChange={(e) => handleProductChange(product.id, 'agent_price', e.target.value)}
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        checked={!!product.is_active}
                                                        onCheckedChange={(checked) => handleProductChange(product.id, 'is_active', checked ? 1 : 0)}
                                                    />
                                                    <span className="text-sm text-muted-foreground">Active</span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSave(product)}
                                                    disabled={!hasChanges[product.id] || savingId === product.id}
                                                    className={hasChanges[product.id] ? "bg-primary text-primary-foreground" : ""}
                                                    variant={hasChanges[product.id] ? "default" : "ghost"}
                                                >
                                                    {savingId === product.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : (
                                                        <Save className="h-4 w-4 mr-2" />
                                                    )}
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
