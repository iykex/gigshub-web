import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Sparkles, ShoppingBag } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { useCart } from "@/contexts/cart-context"
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

interface PricingPackage {
    id: number
    provider: string
    name: string
    size: string
    price: number
    agent_price: number | null
    product_code: string
}

interface ApiResponse {
    success: boolean
    data: PricingPackage[]
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

export default function StoreDetailPage() {
    const params = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { addToCart } = useCart()
    const [packages, setPackages] = useState<PricingPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState<PricingPackage | null>(null)
    const [recipientPhone, setRecipientPhone] = useState("")

    const storeId = params.id as string
    const config = storeConfig[storeId]

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                if (!config) {
                    navigate('/stores')
                    return
                }

                setLoading(true)

                // Fetch packages from API
                const response = await fetch('/api/pricing')
                const data: ApiResponse = await response.json()

                if (data.success && config) {
                    // Filter by provider first
                    let filteredPackages = data.data.filter(pkg =>
                        pkg.provider.toLowerCase() === config.provider.toLowerCase()
                    )

                    // Apply store-specific filters
                    if (storeId === 'airteltigo-ishare') {
                        filteredPackages = filteredPackages.filter((pkg: PricingPackage) =>
                            pkg.name.toLowerCase().includes('ishare')
                        )
                    } else if (storeId === 'airteltigo-bigtime') {
                        filteredPackages = filteredPackages.filter((pkg: PricingPackage) =>
                            pkg.name.toLowerCase().includes('bigtime')
                        )
                    }

                    setPackages(filteredPackages)
                }
            } catch (error) {
                console.error('Error fetching packages:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPackages()
    }, [config, navigate, storeId])

    const getPrice = (pkg: PricingPackage) => {
        if (user?.role === 'agent' && pkg.agent_price) {
            return pkg.agent_price
        }
        return pkg.price
    }

    const getProviderLogo = (provider: string) => {
        const p = provider.toLowerCase()
        if (p.includes('mtn')) return '/logos/mtn.png'
        if (p.includes('airtel') || p.includes('tigo')) return '/logos/airteltigo.png'
        if (p.includes('telecel')) return '/logos/telecel.png'
        if (p.includes('afa')) return '/logos/afa.png'
        return '/logos/mtn.png' // Default fallback
    }

    const handleAddToCart = (pkg: PricingPackage) => {
        setSelectedPackage(pkg)
        setRecipientPhone("")
        setIsPhoneDialogOpen(true)
    }

    const confirmAddToPurchase = () => {
        if (!selectedPackage) return

        if (!recipientPhone || recipientPhone.length < 10) {
            toast({
                title: "Invalid Phone Number",
                description: "Please enter a valid phone number (at least 10 digits).",
                variant: "destructive",
                duration: 3000,
            })
            return
        }

        addToCart({
            id: selectedPackage.id,
            provider: selectedPackage.provider,
            name: selectedPackage.name,
            size: selectedPackage.size,
            price: selectedPackage.price,
            agent_price: selectedPackage.agent_price,
            product_code: selectedPackage.product_code,
            recipientPhone: recipientPhone
        })

        toast({
            title: "Added to purchase",
            description: `${selectedPackage.size} - ${selectedPackage.name} for ${recipientPhone} has been added.`,
            duration: 3000,
        })

        setIsPhoneDialogOpen(false)
        setSelectedPackage(null)
        setRecipientPhone("")
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
                            variant="outline"
                            onClick={() => navigate('/stores')}
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
                                        className="relative rounded-xl p-3 overflow-hidden bg-white/70 dark:bg-[#1e1e1e]/70 border border-black/10 dark:border-white/10 shadow-sm hover:shadow-md transition-all"
                                        style={{
                                            backdropFilter: 'blur(20px) saturate(150%)',
                                            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                                        }}
                                    >
                                        {/* Content */}
                                        <div className="relative space-y-2">
                                            {/* Top Row: Size Badge and Logo */}
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

                                                {/* Network Logo */}
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                                    style={{
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                                    }}
                                                >
                                                    <img
                                                        src={getProviderLogo(pkg.provider)}
                                                        alt={pkg.provider}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>

                                            {/* Agent Save Badge (if applicable) */}
                                            {user?.role === 'agent' && pkg.agent_price && pkg.agent_price < pkg.price && (
                                                <div className="flex justify-start">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs px-1.5 py-0"
                                                    >
                                                        Save
                                                    </Badge>
                                                </div>
                                            )}

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

                                            {/* Add to Purchase Button */}
                                            <button
                                                onClick={() => handleAddToCart(pkg)}
                                                className="w-full py-1.5 rounded-lg text-xs font-semibold text-white transition-all group-hover:shadow-lg flex items-center justify-center gap-1"
                                                style={{
                                                    background: config.gradient,
                                                    boxShadow: `0 2px 8px ${config.accentColor}40`,
                                                }}
                                            >
                                                <ShoppingBag className="w-3 h-3" />
                                                Add to Purchase
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

                {/* Phone Number Dialog */}
                <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Enter Recipient Phone Number</DialogTitle>
                            <DialogDescription>
                                Please enter the phone number that will receive the data bundle.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="0240000000"
                                    value={recipientPhone}
                                    onChange={(e) => setRecipientPhone(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            confirmAddToPurchase()
                                        }
                                    }}
                                />
                            </div>
                            {selectedPackage && (
                                <div className="text-sm text-muted-foreground">
                                    <p>Package: <span className="font-medium">{selectedPackage.size} - {selectedPackage.name}</span></p>
                                    <p>Price: <span className="font-medium">GHS {getPrice(selectedPackage).toFixed(2)}</span></p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPhoneDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={confirmAddToPurchase}>
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
