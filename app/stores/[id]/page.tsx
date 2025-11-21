"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"

interface PricingPackage {
    id: number
    provider: string
    name: string
    size: string
    price: number
    agent_price: number | null
    product_code: string
}

const storeConfig: Record<string, {
    gradient: string
    accentColor: string
    name: string
    provider: string
}> = {
    'mtn': {
        gradient: 'linear-gradient(135deg, #FFCC00 0%, #FFB800 100%)',
        accentColor: '#FFCC00',
        name: 'MTN',
        provider: 'MTN'
    },
    'airteltigo-ishare': {
        gradient: 'linear-gradient(135deg, #0078d4 0%, #0078d4 100%)',
        accentColor: '#0078d4',
        name: 'AirtelTigo iShare',
        provider: 'AirtelTigo'
    },
    'airteltigo-bigtime': {
        gradient: 'linear-gradient(135deg, #0078d4 0%, #0078d4 100%)',
        accentColor: '#0078d4',
        name: 'AirtelTigo BigTime',
        provider: 'AirtelTigo'
    },
    'telecel': {
        gradient: 'linear-gradient(135deg, #e74c3c 0%, #e74c3c 100%)',
        accentColor: '#e74c3c',
        name: 'Telecel',
        provider: 'Telecel'
    },
    'afa-registration': {
        gradient: 'linear-gradient(135deg, #FFCC00 0%, #FFB800 100%)',
        accentColor: '#FFCC00',
        name: 'AFA Registration',
        provider: 'AFA'
    }
}

import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"

export default function StoreDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const { addToCart } = useCart()
    const { toast } = useToast()
    const [packages, setPackages] = useState<PricingPackage[]>([])
    const [loading, setLoading] = useState(true)

    const storeId = params.id as string
    const config = storeConfig[storeId]

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                if (!config) {
                    router.push('/stores')
                    return
                }

                const CACHE_KEY = `pricing_cache_${config.provider}`
                const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

                const processData = (rawData: PricingPackage[]) => {
                    let filteredPackages = rawData

                    if (storeId === 'airteltigo-ishare') {
                        filteredPackages = rawData.filter((pkg: PricingPackage) =>
                            pkg.name.toLowerCase().includes('ishare')
                        )
                    } else if (storeId === 'airteltigo-bigtime') {
                        filteredPackages = rawData.filter((pkg: PricingPackage) =>
                            pkg.name.toLowerCase().includes('bigtime')
                        )
                    }

                    setPackages(filteredPackages)
                }

                // Check cache
                const cached = localStorage.getItem(CACHE_KEY)
                if (cached) {
                    try {
                        const { timestamp, data } = JSON.parse(cached)
                        // Check if cache is valid (less than 24 hours old)
                        if (Date.now() - timestamp < CACHE_DURATION) {
                            console.log(`Using cached data for ${config.provider}`)
                            processData(data)
                            setLoading(false)
                            // Optional: Background refresh if cache is stale but usable? 
                            // User asked for "only fetch fresh data every 24 hours", so strict cache is fine.
                            return
                        }
                    } catch (e) {
                        console.error("Error parsing cache", e)
                        localStorage.removeItem(CACHE_KEY)
                    }
                }

                const response = await fetch(`/api/pricing?provider=${config.provider}`)
                const data = await response.json()

                if (data.success) {
                    // Update cache
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        timestamp: Date.now(),
                        data: data.data
                    }))
                    processData(data.data)
                }
            } catch (error) {
                console.error('Failed to fetch packages:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPackages()
    }, [params.id, router, config, storeId])

    const getPrice = (pkg: PricingPackage) => {
        if (user?.role === 'agent' && pkg.agent_price) {
            return pkg.agent_price
        }
        return pkg.price
    }

    const handleAddToCart = (pkg: PricingPackage) => {
        addToCart({
            id: pkg.id,
            provider: pkg.provider,
            name: pkg.name,
            size: pkg.size,
            price: pkg.price,
            agent_price: pkg.agent_price,
            product_code: pkg.product_code
        })

        toast({
            title: "Added to cart",
            description: `${pkg.size} - ${pkg.name} has been added to your cart.`,
            duration: 3000,
        })
    }

    if (!config) {
        return null
    }

    return (
        <div className="flex-1 flex flex-col relative bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            {/* Background Glow */}
            <div
                className="absolute inset-0 z-0 blur-[80px] pointer-events-none select-none
          bg-[radial-gradient(circle_at_top_center,rgba(70,130,180,0.5),transparent_70%)]
          dark:bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.03),transparent_70%)]"
            />

            <div className="relative z-10 flex-1 flex flex-col">
                <HomeNavbar />
                <div className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
                    {/* Header */}
                    <div className="mb-10">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/stores')}
                            className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Stores
                        </Button>

                        <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-2xl font-bold">
                                {config.name}
                            </h1>
                            {user?.role === 'agent' && (
                                <Badge
                                    className="px-3 py-1"
                                    style={{
                                        background: `${config.accentColor}20`,
                                        color: config.accentColor,
                                        border: `1px solid ${config.accentColor}40`
                                    }}
                                >
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Agent Pricing
                                </Badge>
                            )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            {packages.length} packages available
                        </p>
                    </div>

                    {/* Packages Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: config.accentColor }} />
                        </div>
                    ) : packages.length > 0 ? (
                        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {packages.map((pkg, index) => (
                                <motion.div
                                    key={pkg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -4 }}
                                    className="group"
                                >
                                    <div
                                        className="relative rounded-xl p-3 overflow-hidden"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.7)',
                                            backdropFilter: 'blur(20px) saturate(150%)',
                                            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                                            border: '1px solid rgba(0, 0, 0, 0.08)',
                                            boxShadow: `
                                                0 4px 16px rgba(0, 0, 0, 0.06),
                                                0 1px 4px rgba(0, 0, 0, 0.03),
                                                inset 0 1px 0 rgba(255, 255, 255, 0.5)
                                            `,
                                        }}
                                    >
                                        {/* Dark mode background */}
                                        <style jsx>{`
                                            @media (prefers-color-scheme: dark) {
                                                div[style*="rgba(255, 255, 255, 0.7)"] {
                                                    background: rgba(30, 30, 30, 0.7) !important;
                                                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                                                    box-shadow: 
                                                        0 4px 16px rgba(0, 0, 0, 0.3),
                                                        0 1px 4px rgba(0, 0, 0, 0.2),
                                                        inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
                                                }
                                            }
                                        `}</style>

                                        {/* Content */}
                                        <div className="relative space-y-2">
                                            {/* Size Badge */}
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className="px-2.5 py-0.5 rounded-full text-sm font-bold"
                                                    style={{
                                                        background: `${config.accentColor}15`,
                                                        color: config.accentColor,
                                                    }}
                                                >
                                                    {pkg.size}
                                                </div>
                                                {user?.role === 'agent' && pkg.agent_price && pkg.agent_price < pkg.price && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs px-1.5 py-0"
                                                    >
                                                        Save
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Package Name */}
                                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                                                {pkg.name}
                                            </p>

                                            {/* Price */}
                                            <div>
                                                <div
                                                    className="text-lg font-bold"
                                                    style={{ color: config.accentColor }}
                                                >
                                                    GHS {getPrice(pkg).toFixed(2)}
                                                </div>
                                                {user?.role === 'agent' && pkg.agent_price && pkg.agent_price < pkg.price && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                                        GHS {pkg.price.toFixed(2)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Add to Cart Button */}
                                            <button
                                                onClick={() => handleAddToCart(pkg)}
                                                className="w-full py-1.5 rounded-lg text-xs font-semibold text-white transition-all group-hover:shadow-lg flex items-center justify-center gap-1"
                                                style={{
                                                    background: config.gradient,
                                                    boxShadow: `0 2px 8px ${config.accentColor}40`,
                                                }}
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                No packages available for this store.
                            </p>
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </div>
    )
}
