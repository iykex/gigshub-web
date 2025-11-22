"use client"

import { useState } from "react"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, CreditCard } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function WalletTopupPage() {
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(false)

    const quickAmounts = [10, 20, 50, 100, 200, 500]

    const handleTopup = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!amount || parseFloat(amount) <= 0) {
            toast({ title: "Please enter a valid amount", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            // TODO: Integrate with Paystack
            toast({ title: "Redirecting to payment..." })
            // Simulate payment redirect
            setTimeout(() => {
                toast({ title: "Payment integration coming soon!" })
                setLoading(false)
            }, 1500)
        } catch (error) {
            toast({
                title: "Topup failed",
                description: "Please try again.",
                variant: "destructive"
            })
            setLoading(false)
        }
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
                <div className="flex-grow max-w-2xl mx-auto px-3 sm:px-6 py-12 w-full">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Wallet className="w-8 h-8 text-green-600" />
                            <h1 className="text-3xl font-bold">Wallet Topup</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">Add funds to your wallet for quick purchases</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Current Balance</CardTitle>
                            <CardDescription>Your available wallet balance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                                <div className="text-4xl font-bold text-green-600 mb-2">GHS 0.00</div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
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

                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Payment via Paystack</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                Secure payment processing with mobile money, cards, and bank transfer
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={loading || !amount}>
                                    {loading ? "Processing..." : `Top up GHS ${amount || "0.00"}`}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <Footer />
            </div>
        </div>
    )
}
