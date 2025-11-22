import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Crown, CheckCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/lib/toast"
import { useAuth } from "@/contexts/auth-context"
import PaystackPop from '@paystack/inline-js'

interface ErrorResponse {
    error: string
}

interface RegisterResponse {
    success: boolean
    user: any
    generatedPassword?: string
}

interface VerificationResponse {
    status: boolean
    message?: string
}

export default function AgentRegisterPage() {
    const navigate = useNavigate()
    const { user, login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    })
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)

    // Pre-fill form if user is logged in
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email,
                phone: user.phone || ""
            })
        }
    }, [user])

    const handlePayment = async (email: string, userId?: string, tempPassword?: string) => {
        const amount = 30.00
        const serviceFee = amount * 0.0195
        const totalAmount = amount + serviceFee
        const amountInKobo = Math.round(totalAmount * 100)

        const paystack = new PaystackPop()
        const reference = `AGENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`

        paystack.newTransaction({
            key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_1d40c94c8cf2954723683a3a8e1b7da449c28b84',
            email: email,
            amount: amountInKobo,
            reference,
            onSuccess: async (transaction: any) => {
                toast({
                    title: "Processing Registration",
                    description: "Verifying your payment... ⏳",
                })

                try {
                    // Verify transaction and create agent request
                    const response = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            reference: transaction.reference,
                            type: 'agent_registration'
                        })
                    })

                    const data = await response.json() as VerificationResponse

                    if (data.status) {
                        if (tempPassword) {
                            setGeneratedPassword(tempPassword)
                            toast({ title: "Registration successful! 🎉" })
                        } else {
                            toast({
                                title: "Request Submitted! 🎉",
                                description: "Your agent application is pending approval.",
                                variant: "success"
                            })
                            navigate('/dashboard')
                        }
                    } else {
                        throw new Error(data.message || 'Verification failed')
                    }
                } catch (error) {
                    console.error(error)
                    toast({
                        title: "Verification Failed",
                        description: "Payment successful but request failed. Contact support.",
                        variant: "destructive"
                    })
                } finally {
                    setLoading(false)
                }
            },
            onCancel: () => {
                setLoading(false)
                toast({ title: "Payment Cancelled" })
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (user) {
                // User already logged in, just pay
                await handlePayment(user.email)
            } else {
                // Create user first
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        username: formData.name,
                        phone: formData.phone,
                        role: 'user' // Create as user first, upgrade after payment
                    })
                })

                if (!response.ok) {
                    const error = await response.json() as ErrorResponse
                    throw new Error(error.error || 'Registration failed')
                }

                const data = await response.json() as RegisterResponse

                if (data.success) {
                    // Proceed to payment
                    await handlePayment(formData.email, data.user.id, data.generatedPassword)
                }
            }
        } catch (error) {
            toast({
                title: "Registration failed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive"
            })
            setLoading(false)
        }
    }

    const handleCopyPassword = () => {
        if (generatedPassword) {
            navigator.clipboard.writeText(generatedPassword)
            toast({ title: "Password copied to clipboard" })
        }
    }

    const handleContinue = () => {
        navigate("/login")
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
                <div className="flex-grow max-w-4xl mx-auto px-3 sm:px-6 py-12 w-full">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Crown className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold">Become an Agent</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Join our agent network and earn with exclusive discounts</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <Card className="border-blue-200 dark:border-blue-800">
                            <CardHeader>
                                <CardTitle>Agent Benefits</CardTitle>
                                <CardDescription>What you get as an agent</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">Up to 10% discount on all packages</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">Bulk purchase options</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">Reseller dashboard</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">Priority support</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Registration Fee</CardTitle>
                                <CardDescription>One-time activation fee</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-6">
                                    <div className="text-2xl font-bold text-blue-600 mb-2">GHS 30.59</div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Includes 1.95% service fee</p>
                                    <Badge className="mt-4 bg-blue-100 text-blue-700">Lifetime Access</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Agent Registration</CardTitle>
                            <CardDescription>
                                {user ? "Complete payment to upgrade your account" : "Fill in your details to get started"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Juice WRLD"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            disabled={!!user}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="0551234567"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            disabled={!!user}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!!user}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Pay GHS 30.59 with MoMo"
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-3 text-sm pt-2">
                                    <span className="font-semibold text-yellow-500">MTN MoMo</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-semibold text-red-500">T-Cash</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-semibold text-blue-500">AT-Money</span>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <Footer />
            </div>

            {/* Success Modal */}
            {generatedPassword && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Registration Successful!</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Your agent request has been submitted. Please save your temporary password below.
                            </p>
                        </div>

                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 flex items-center justify-between">
                            <code className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                                {generatedPassword}
                            </code>
                            <Button variant="ghost" size="sm" onClick={handleCopyPassword}>
                                Copy
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs text-center text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                                ⚠️ Important: You must change this password after your first login.
                            </p>
                            <Button onClick={handleContinue} className="w-full">
                                Continue to Login
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
