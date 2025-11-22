import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/lib/toast"
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

interface AfaFormData {
    fullName: string
    phoneNumber: string
    town: string
    occupation: string
    idNumber: string
    idType: string
    packageId: string
}

interface AfaPackage {
    id: number
    provider: string
    name: string
    size: string
    price: number
    agent_price: number | null
    product_code: string
}

interface PricingResponse {
    success: boolean
    data: AfaPackage[]
}

interface RegistrationResponse {
    success: boolean
    message: string
    data?: any
}

export default function AfaRegistrationPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [packages, setPackages] = useState<AfaPackage[]>([])
    const [loadingPackages, setLoadingPackages] = useState(true)
    const [formData, setFormData] = useState<AfaFormData>({
        fullName: "",
        phoneNumber: "",
        town: "",
        occupation: "",
        idNumber: "",
        idType: "",
        packageId: ""
    })

    // Fetch AFA package price on mount
    useEffect(() => {
        const fetchAfaPrice = async () => {
            try {
                console.log('Fetching pricing from /api/pricing...')
                const response = await fetch('/api/pricing')
                console.log('Response status:', response.status)

                const data = await response.json() as PricingResponse
                console.log('Full API Response:', JSON.stringify(data, null, 2))
                console.log('Number of packages:', data.data?.length || 0)

                if (data.success && data.data && data.data.length > 0) {
                    // Log all providers
                    console.log('All providers:', data.data.map(p => p.provider))

                    // Look for AFA package in pricing
                    const afaPackage = data.data.find((pkg: AfaPackage) => {
                        const match = pkg.provider.toLowerCase().includes('afa')
                        console.log(`Checking package: ${pkg.name}, provider: ${pkg.provider}, matches AFA: ${match}`)
                        return match
                    })

                    if (afaPackage) {
                        console.log('✅ Found AFA package:', afaPackage)
                        setPackages([afaPackage])
                        // Auto-select the package
                        setFormData(prev => ({
                            ...prev,
                            packageId: afaPackage.id.toString()
                        }))
                    } else {
                        // Use default AFA package if not configured by admin
                        console.warn('⚠️ No AFA package found in pricing API. Using default.')
                        const defaultPackage: AfaPackage = {
                            id: 0,
                            provider: 'AFA',
                            name: 'AFA SIM Registration',
                            size: 'Standard',
                            price: 5.00, // Default price
                            agent_price: null,
                            product_code: 'AFA-REG-001'
                        }
                        setPackages([defaultPackage])
                        setFormData(prev => ({
                            ...prev,
                            packageId: '0'
                        }))

                        toast({
                            title: "Using Default Price",
                            description: "Admin has not configured AFA pricing. Using default GHS 5.00. Please add AFA package in Admin Store.",
                        })
                    }
                } else {
                    console.warn('⚠️ No pricing data available')
                    // Use default if no data at all
                    const defaultPackage: AfaPackage = {
                        id: 0,
                        provider: 'AFA',
                        name: 'AFA SIM Registration',
                        size: 'Standard',
                        price: 5.00,
                        agent_price: null,
                        product_code: 'AFA-REG-001'
                    }
                    setPackages([defaultPackage])
                    setFormData(prev => ({
                        ...prev,
                        packageId: '0'
                    }))
                }
            } catch (error) {
                console.error('❌ Error fetching AFA price:', error)
                // Use default package on error
                const defaultPackage: AfaPackage = {
                    id: 0,
                    provider: 'AFA',
                    name: 'AFA SIM Registration',
                    size: 'Standard',
                    price: 5.00,
                    agent_price: null,
                    product_code: 'AFA-REG-001'
                }
                setPackages([defaultPackage])
                setFormData(prev => ({
                    ...prev,
                    packageId: '0'
                }))

                toast({
                    title: "Error Loading Price",
                    description: "Could not load AFA pricing. Using default GHS 5.00",
                    variant: "destructive"
                })
            } finally {
                setLoadingPackages(false)
            }
        }
        fetchAfaPrice()
    }, [])

    const handleInputChange = (field: keyof AfaFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const selectedPackage = packages.find(pkg => pkg.id.toString() === formData.packageId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedPackage) {
            toast({
                title: "Error",
                description: "Please select a package",
                variant: "destructive"
            })
            return
        }

        // Store registration data in sessionStorage for checkout
        const registrationData = {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            town: formData.town,
            occupation: formData.occupation,
            idNumber: formData.idNumber,
            idType: formData.idType,
            packageId: selectedPackage.id,
            packageName: selectedPackage.name,
            amount: selectedPackage.price,
            type: 'afa_registration'
        }

        sessionStorage.setItem('afa_registration_data', JSON.stringify(registrationData))

        // Redirect to AFA checkout page
        navigate('/afa/checkout')
    }

    return (
        <div className="min-h-screen flex flex-col relative bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            {/* Background Glow */}
            <div
                className="absolute inset-0 z-0 blur-[80px] pointer-events-none select-none
                    bg-[radial-gradient(circle_at_top_center,rgba(255,204,0,0.3),transparent_70%)]
                    dark:bg-[radial-gradient(circle_at_top_center,rgba(255,204,0,0.05),transparent_70%)]"
            />

            <div className="relative z-10 flex-1 flex flex-col">
                <HomeNavbar />
                <div className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/stores')}
                            className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Stores
                        </Button>

                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-4">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">AFA Registration</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Register your SIM card quickly and securely
                            </p>
                        </motion.div>
                    </div>

                    {/* Form Card */}
                    <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-yellow-200 dark:border-yellow-900">
                        <CardHeader>
                            <CardTitle>Registration Details</CardTitle>
                            <CardDescription>
                                Please fill in all required information accurately
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name *</Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        placeholder="0240000000"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Town */}
                                <div className="space-y-2">
                                    <Label htmlFor="town">Town *</Label>
                                    <Input
                                        id="town"
                                        type="text"
                                        placeholder="Enter your town"
                                        value={formData.town}
                                        onChange={(e) => handleInputChange('town', e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Occupation */}
                                <div className="space-y-2">
                                    <Label htmlFor="occupation">Occupation *</Label>
                                    <Input
                                        id="occupation"
                                        type="text"
                                        placeholder="Enter your occupation"
                                        value={formData.occupation}
                                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* ID Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="idType">ID Type *</Label>
                                    <Select
                                        value={formData.idType}
                                        onValueChange={(value) => handleInputChange('idType', value)}
                                        disabled={isLoading}
                                        required
                                    >
                                        <SelectTrigger id="idType">
                                            <SelectValue placeholder="Select ID type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NATIONAL_ID">National ID (Ghana Card)</SelectItem>
                                            <SelectItem value="VOTER_ID">Voter ID</SelectItem>
                                            <SelectItem value="PASSPORT">Passport</SelectItem>
                                            <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* ID Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="idNumber">ID Number *</Label>
                                    <Input
                                        id="idNumber"
                                        type="text"
                                        placeholder="Enter your ID number"
                                        value={formData.idNumber}
                                        onChange={(e) => handleInputChange('idNumber', e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Registration Fee Display */}
                                <div className="space-y-2">
                                    <Label>Registration Fee</Label>
                                    {loadingPackages ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                                Loading price...
                                            </span>
                                        </div>
                                    ) : selectedPackage ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-300 dark:border-yellow-700"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                                        {selectedPackage.name}
                                                    </p>
                                                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                                        One-time registration fee
                                                    </p>
                                                </div>
                                                <Badge className="bg-yellow-600 text-white text-lg px-4 py-2">
                                                    GHS {selectedPackage.price.toFixed(2)}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-6 text-lg"
                                    disabled={isLoading || !formData.packageId}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Proceed to Payment
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                    By submitting, you agree to our terms of service and privacy policy
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <Footer />
            </div>
        </div>
    )
}
