import { useState, useEffect } from "react"
import confetti from "canvas-confetti"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, CreditCard, Loader2 } from "lucide-react"
import { toast } from "@/lib/toast"
import { useAuth } from "@/contexts/auth-context"
import PaystackPop from '@paystack/inline-js'
import { useNavigate } from "react-router-dom"

interface VerificationResponse {
    status: boolean
    message?: string
    error?: string
    data?: any
}

export default function WalletTopupPage() {
    const { user, updateUser } = useAuth()
    const navigate = useNavigate()
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(false)

    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)

    // Fetch latest user data on mount
    useEffect(() => {
        if (user?.email) {
            fetch(`/api/auth/me?email=${user.email}`)
                .then(res => res.json())
                .then((data: any) => {
                    if (data.user) {
                        updateUser(data.user)
                    }
                })
                .catch(err => console.error("Failed to fetch user data", err))
        }
    }, []) // Run once on mount

    const quickAmounts = [10, 20, 50, 100, 200, 500]

    const handleTopup = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            navigate('/login?redirect=/wallet')
            return
        }

        if (!amount || parseFloat(amount) <= 0) {
            toast({ title: "Please enter a valid amount", variant: "destructive" })
            return
        }

        setLoading(true)

        try {
            const paystack = new PaystackPop()
            const reference = `TOPUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`

            paystack.newTransaction({
                key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_1d40c94c8cf2954723683a3a8e1b7da449c28b84',
                email: user.email,
                amount: Math.round(parseFloat(amount) * 100), // Amount in kobo
                reference,
                onSuccess: async (transaction: any) => {
                    toast({
                        title: "Processing Topup",
                        description: "Verifying your transaction... ⏳",
                    })

                    try {
                        // Verify transaction
                        const response = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                reference: transaction.reference,
                                type: 'topup' // Hint to backend to credit wallet
                            })
                        })

                        const data = await response.json() as VerificationResponse

                        if (data.status) {
                            toast({
                                title: "Topup Successful! 🎉",
                                description: `GHS ${amount} has been added to your wallet.`,
                                variant: "success"
                            })
                            confetti({
                                particleCount: 100,
                                spread: 70,
                                origin: { y: 0.6 }
                            })
                            setAmount("")
                            // Refresh user data
                            try {
                                const userRes = await fetch(`/api/auth/me?email=${user.email}`)
                                if (userRes.ok) {
                                    const userData = await userRes.json() as { user: any }
                                    updateUser(userData.user)
                                }
                            } catch (e) {
                                console.error("Failed to refresh user data", e)
                            }
                        } else {
                            throw new Error(data.message || 'Verification failed')
                        }
                    } catch (error) {
                        console.error(error)
                        toast({
                            title: "Verification Failed",
                            description: "Payment successful but wallet update failed. Contact support.",
                            variant: "destructive"
                        })
                    } finally {
                        setLoading(false)
                    }
                },
                onCancel: () => {
                    setLoading(false)
                    toast({
                        title: "Topup Cancelled",
                        description: "You cancelled the payment process.",
                    })
                }
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "Topup Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive"
            })
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col relative bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            {/* Background Glow */}
            <div
                className="absolute inset-0 z-0 blur-[80px] pointer-events-none select-none
          bg-[radial-gradient(circle_at_top_center,rgba(70,130,180,0.5),transparent_70%)]
          dark:bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.03),transparent_70%)]"
            />

            <div className="relative z-10 flex-1 flex flex-col">
                <HomeNavbar />
                <div className="flex-grow max-w-2xl mx-auto px-3 sm:px-6 py-12 w-full">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Wallet className="w-8 h-8 text-green-600" />
                            <h1 className="text-3xl font-bold">Wallet Topup</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">Add funds to your wallet for quick purchases</p>
                    </div>

                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
                        <CardHeader>
                            <CardTitle>Current Balance</CardTitle>
                            <CardDescription>Your available wallet balance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                                    GHS {user?.wallet_balance?.toFixed(2) || "0.00"}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
                        <CardHeader>
                            <CardTitle>Add Funds</CardTitle>
                            <CardDescription>Choose an amount or enter a custom value</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleTopup} className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Quick Select</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {quickAmounts.map((amt) => (
                                            <Button
                                                key={amt}
                                                type="button"
                                                variant={amount === amt.toString() ? "default" : "outline"}
                                                onClick={() => setAmount(amt.toString())}
                                                className="w-full"
                                            >
                                                GHS {amt}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Custom Amount</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">GHS</span>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="0.00"
                                            min="1"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="pl-14"
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
                                    <div className="flex items-start gap-2">
                                        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Payment with Mobile Money</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                Secure payment processing with mobile money, cards, and bank transfer
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full rounded-full" disabled={loading || !amount} size="lg">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Top up GHS ${amount || "0.00"}`
                                    )}
                                </Button>
                            </form>
                            <div className="flex items-center justify-center gap-3 text-sm pt-2">
                                <span className="font-semibold text-yellow-500">MTN MoMo</span>
                                <span className="text-gray-400">•</span>
                                <span className="font-semibold text-red-500">T-Cash</span>
                                <span className="text-gray-400">•</span>
                                <span className="font-semibold text-blue-500">AT-Money</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Footer />
            </div>
        </div>
    )
}
