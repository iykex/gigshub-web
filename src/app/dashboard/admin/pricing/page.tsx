import { useState, useEffect } from "react"
import useSWR from "swr"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Save, RotateCcw, Loader2 } from 'lucide-react'
import { toast } from "@/lib/toast"

interface PricingItem {
  id: number
  provider: string
  name: string
  size: string
  price: number
  agent_price: number | null
  is_active: number
}

interface PricingChanges {
  [key: number]: {
    price?: number
    agent_price?: number
  }
}

const fetcher = (url: string): Promise<{ products: PricingItem[] }> =>
  fetch(url).then((res) => res.json())

export default function PricingManager() {
  const { data, error, isLoading, mutate } = useSWR<{ products: PricingItem[] }>(
    '/api/admin/stores',
    fetcher,
    { revalidateOnFocus: false }
  )
  const [changes, setChanges] = useState<PricingChanges>({})
  const [isSaving, setIsSaving] = useState(false)

  const products = data?.products || []
  const hasChanges = Object.keys(changes).length > 0

  const handlePriceChange = (id: number, field: 'price' | 'agent_price', value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0) return

    setChanges(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: numValue
      }
    }))
  }

  const handleDiscardChanges = () => {
    setChanges({})
    toast({
      title: "Changes Discarded",
      description: "All unsaved changes have been discarded.",
      variant: "default"
    })
  }

  const handlePublishChanges = async () => {
    if (!hasChanges) return

    setIsSaving(true)
    try {
      // Update each changed item
      const updatePromises = Object.entries(changes).map(async ([id, updates]) => {
        const response = await fetch('/api/admin/stores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: parseInt(id),
            ...updates
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to update item ${id}`)
        }

        return response.json()
      })

      await Promise.all(updatePromises)

      // Optimistically update the local data without refetching
      mutate((currentData) => {
        if (!currentData) return currentData

        return {
          ...currentData,
          products: currentData.products.map(item => {
            const itemChanges = changes[item.id]
            if (itemChanges) {
              return {
                ...item,
                ...itemChanges
              }
            }
            return item
          })
        }
      }, true)

      toast({
        title: "Success",
        description: `${Object.keys(changes).length} pricing item(s) updated successfully.`,
        variant: "success"
      })

      // Clear changes after successful update
      setChanges({})
    } catch (error) {
      console.error('Error saving pricing:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save pricing changes",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getCurrentValue = (item: PricingItem, field: 'price' | 'agent_price'): number => {
    return changes[item.id]?.[field] ?? item[field] ?? 0
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Manager</h1>
          <p className="text-muted-foreground">Update package prices and agent rates.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-full glass"
            onClick={handleDiscardChanges}
            disabled={!hasChanges || isSaving}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Discard Changes
          </Button>
          <Button
            className="rounded-full shadow-lg"
            onClick={handlePublishChanges}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Publish Changes {hasChanges && `(${Object.keys(changes).length})`}
              </>
            )}
          </Button>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Provider</th>
                <th className="px-6 py-3 font-medium">Package Name</th>
                <th className="px-6 py-3 font-medium">Size</th>
                <th className="px-6 py-3 font-medium">Current Price (GHS)</th>
                <th className="px-6 py-3 font-medium">Agent Price (GHS)</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                // Skeleton loading state
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                  </tr>
                ))
              ) : error ? (
                // Error state
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-600">
                    Failed to load pricing data. Please try again.
                  </td>
                </tr>
              ) : products.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No pricing data available.
                  </td>
                </tr>
              ) : (
                // Data rows
                products.map((pkg) => {
                  const hasItemChanges = !!changes[pkg.id]
                  return (
                    <tr
                      key={pkg.id}
                      className={`hover:bg-secondary/20 transition-colors ${hasItemChanges ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <Badge variant="outline">{pkg.provider}</Badge>
                      </td>
                      <td className="px-6 py-4 font-medium">{pkg.name || '-'}</td>
                      <td className="px-6 py-4">{pkg.size}</td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={getCurrentValue(pkg, 'price')}
                          onChange={(e) => handlePriceChange(pkg.id, 'price', e.target.value)}
                          className={`w-24 h-8 bg-white/50 dark:bg-black/20 ${hasItemChanges ? 'border-yellow-500' : ''}`}
                          disabled={isSaving}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={getCurrentValue(pkg, 'agent_price')}
                          onChange={(e) => handlePriceChange(pkg.id, 'agent_price', e.target.value)}
                          className={`w-24 h-8 bg-white/50 dark:bg-black/20 ${hasItemChanges ? 'border-yellow-500' : ''}`}
                          disabled={isSaving}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${pkg.is_active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                          }`}>
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-500 rounded-lg p-4 shadow-lg">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            You have {Object.keys(changes).length} unsaved change(s)
          </p>
        </div>
      )}
    </div>
  )
}
