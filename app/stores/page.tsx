"use client"

import { useState, useEffect } from "react"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface PricingPackage {
    id: number
    provider: string
    name: string
    size: string
    price: number
    agent_price: number | null
    product_code: string
}

export default function StoresPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
    const [packages, setPackages] = useState<PricingPackage[]>([])
    const [loading, setLoading] = useState(false)

    const providers = ['MTN', 'Telecel', 'AirtelTigo']

    useEffect(() => {
        if (selectedProvider) {
            fetchPackages(selectedProvider)
        }
    }, [selectedProvider])

    const fetchPackages = async (provider: string) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/pricing?provider=${provider}`)
            const data = await response.json()
            if (data.success) {
                setPackages(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch packages:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPrice = (pkg: PricingPackage) => {
        if (user?.role === 'agent' && pkg.agent_price) {
            return pkg.agent_price
        }
        return pkg.price
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
                <div className="flex-grow max-w-6xl mx-auto px-3 sm:px-6 py-12 w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-4">Data Stores</h1>
                        <p className="text-gray-600 dark:text-gray-400">Browse data packages from all providers</p>
                        {user?.role === 'agent' && (
                            <Badge className="mt-2 bg-blue-100 text-blue-700">Agent Pricing Active</Badge>
                        )}
                    </div>

                    {!selectedProvider ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {providers.map((provider) => (
                                <Card
                                    key={provider}
                                    className="cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => setSelectedProvider(provider)}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ShoppingBag className="w-5 h-5" />
                                            {provider}
                                        </CardTitle>
                                        <CardDescription>
                                            Browse {provider} data packages
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full">View Packages</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">{selectedProvider} Packages</h2>
                                <Button variant="outline" onClick={() => setSelectedProvider(null)}>
                                    ← Back to Providers
                                </Button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {packages.map((pkg) => (
                                        <Card key={pkg.id}>
                                            <CardHeader>
                                                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                                <CardDescription>{pkg.size}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="text-3xl font-bold text-blue-600">
                                                            GHS {getPrice(pkg).toFixed(2)}
                                                        </div>
                                                        {user?.role === 'agent' && pkg.agent_price && pkg.agent_price !== pkg.price && (
                                                            <div className="text-sm text-gray-500 line-through">
                                                                Regular: GHS {pkg.price.toFixed(2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button className="w-full" onClick={() => router.push(`/checkout?package=${pkg.id}`)}>
                                                        Buy Now
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </div>
    )
}
