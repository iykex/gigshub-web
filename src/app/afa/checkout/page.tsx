import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Wallet, CreditCard, Loader2, CheckCircle } from "lucide-react"
import { toast } from "@/lib/toast"
import PaystackPop from '@paystack/inline-js'
import confetti from 'canvas-confetti'

interface AfaRegistrationData {
    fullName: string
    phoneNumber: string
    town: string
    occupation: string
    idNumber: string
    idType: string
    packageId: number
    packageName: string
    amount: number
    type: string
}

interface PaymentVerificationResponse {
    status: boolean
    message?: string
    data?: any
}

export default function AfaCheckoutPage() {
    const navigate = useNavigate()
    const { user, updateUser } = useAuth()
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<"wallet" | "momo">("momo")
    const [registrationData, setRegistrationData] = useState<AfaRegistrationData | null>(null)

    // Load registration data from sessionStorage
    useEffect(() => {
        const storedData = sessionStorage.getItem('afa_registration_data')
        if (!storedData) {
            toast({
                title: "No Registration Data",
                description: "Please complete the registration form first.",
                variant: "destructive"
            })
            navigate('/afa/register')
            return
        }

        try {
            const data = JSON.parse(storedData) as AfaRegistrationData
            setRegistrationData(data)
        } catch (error) {
            console.error('Error parsing registration data:', error)
            navigate('/afa/register')
        }
    }, [navigate])

    // Set default payment method based on wallet balance
    useEffect(() => {
        if (user && registrationData && user.wallet_balance && user.wallet_balance >= registrationData.amount) {
            setPaymentMethod("wallet")
        } else {
            setPaymentMethod("momo")
        }
    }, [user, registrationData])

    const serviceFee = paymentMethod === "momo" ? (registrationData?.amount || 0) * 0.0195 : 0
    const finalTotal = (registrationData?.amount || 0) + serviceFee

    const saveAfaRegistration = async (paymentReference: string, paymentStatus: 'paid' | 'pending') => {
        if (!registrationData) return

        try {
            const response = await fetch('/api/afa/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: registrationData.fullName,
                    phoneNumber: registrationData.phoneNumber,
                    town: registrationData.town,
                    occupation: registrationData.occupation,
                    idNumber: registrationData.idNumber,
                    idType: registrationData.idType,
                    packageId: registrationData.packageId,
                    amount: registrationData.amount,
                    paymentReference,
                    paymentStatus
                })
            })

            const result: { success: boolean; message?: string } = await response.json()

            if (!result.success) {
                throw new Error(result.message || 'Failed to save registration')
            }

            return result
        } catch (error) {
            console.error('Error saving AFA registration:', error)
            throw error
        }
    }

    const handlePaystackPayment = (amount: number) => {
        if (!user || !registrationData) return

        const paystack = new PaystackPop()
        const reference = `AFA-${Date.now()}-${Math.floor(Math.random() * 1000)}`

        paystack.newTransaction({
            key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_1d40c94c8cf2954723683a3a8e1b7da449c28b84',
            email: user.email,
            amount: Math.round(amount * 100), // Amount in kobo
            reference,
            onSuccess: async (transaction: any) => {
                toast({
                    title: "Processing Payment",
                    description: "Verifying your transaction... ⏳",
                    duration: 5000,
                })

                try {
                    // Verify payment with backend
                    const response = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            reference: transaction.reference,
                            type: 'afa_registration'
                        })
                    })

                    const data: PaymentVerificationResponse = await response.json()

                    if (data.status) {
                        // Save AFA registration to database
                        await saveAfaRegistration(transaction.reference, 'paid')

                        // Success!
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 }
                        })

                        toast({
                            title: "Registration Successful! 🎉",
                            description: "Your AFA registration has been completed.",
                            variant: "success"
                        })

                        // Clear session storage
                        sessionStorage.removeItem('afa_registration_data')

                        navigate(`/afa/success?reference=${transaction.reference}`)
                    } else {
                        throw new Error(data.message || 'Payment verification failed')
                    }
                } catch (error) {
                    console.error(error)
                    toast({
                        title: "Verification Failed 😢",
                        description: "Payment was successful but verification failed. Please contact support.",
                        variant: "destructive"
                    })
                } finally {
                    setIsProcessing(false)
                }
            },
            onCancel: () => {
                setIsProcessing(false)
                toast({
                    title: "Payment Cancelled",
                    description: "You cancelled the payment process.",
                    variant: "default"
                })
            }
        })
    }

    const handleCheckout = async (method: "wallet" | "momo") => {
        if (!user) {
            navigate('/login?redirect=/afa/checkout')
            return
        }

        if (!registrationData) {
            toast({
                title: "Error",
                description: "Registration data not found. Please start over.",
                variant: "destructive"
            })
            navigate('/afa/register')
            return
        }

        setIsProcessing(true)
        setPaymentMethod(method)

        const transactionServiceFee = method === "momo" ? registrationData.amount * 0.0195 : 0
        const transactionTotal = registrationData.amount + transactionServiceFee

        try {
            if (method === "wallet") {
                // Wallet Payment
                if ((user.wallet_balance || 0) < transactionTotal) {
                    toast({
                        title: "Insufficient funds",
                        description: "Please top up your wallet or use Mobile Money.",
                        variant: "destructive"
                    })
                    setIsProcessing(false)
                    return
                }

                const response = await fetch('/api/wallet/pay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        amount: transactionTotal,
                        description: `AFA Registration - ${registrationData.fullName}`
                    })
                })

                if (!response.ok) {
                    throw new Error('Wallet payment failed')
                }

                const paymentResult: { success: boolean; reference: string } = await response.json()

                // Save AFA registration to database
                await saveAfaRegistration(paymentResult.reference, 'paid')

                // Update local user balance
                updateUser({ wallet_balance: (user.wallet_balance || 0) - transactionTotal })

                toast({
                    title: "Registration Successful!",
                    description: "Payment deducted from your wallet.",
                    variant: "success"
                })

                // Clear session storage
                sessionStorage.removeItem('afa_registration_data')

                navigate(`/afa/success?reference=${paymentResult.reference}&method=wallet`)

            } else {
                // Paystack MoMo Payment
                handlePaystackPayment(transactionTotal)
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Payment failed",
                description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
                variant: "destructive"
            })
            setIsProcessing(false)
        }
    }

    if (!registrationData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col relative bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300 min-h-screen">
            <HomeNavbar />

            <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/afa/register')}
                        className="mb-4 hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Registration
                    </Button>
                    <h1 className="text-2xl font-bold">Complete Your AFA Registration</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Review your details and complete payment
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Registration Details */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Registration Details</CardTitle>
                                <CardDescription>Please verify your information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                                        <p className="font-medium">{registrationData.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                                        <p className="font-medium">{registrationData.phoneNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Town</p>
                                        <p className="font-medium">{registrationData.town}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Occupation</p>
                                        <p className="font-medium">{registrationData.occupation}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ID Type</p>
                                        <p className="font-medium">{registrationData.idType.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ID Number</p>
                                        <p className="font-medium">{registrationData.idNumber}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-[#111] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Payment Summary</h2>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Registration Fee</span>
                                    <span>GHS {registrationData.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Service Fee {paymentMethod === "momo" && "(1.95%)"}</span>
                                    <span>GHS {serviceFee.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>GHS {finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment Buttons */}
                            <div className="space-y-4">
                                {/* Wallet Payment */}
                                <div>
                                    <Button
                                        className="w-full py-6 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                                        onClick={() => handleCheckout("wallet")}
                                        disabled={isProcessing || !user || (user.wallet_balance || 0) === 0 || (user.wallet_balance || 0) < registrationData.amount}
                                    >
                                        {isProcessing && paymentMethod === 'wallet' ? (
                                            <div className="flex items-center gap-2 text-base">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-base">
                                                <Wallet className="w-5 h-5" />
                                                Pay with Wallet - GHS {registrationData.amount.toFixed(2)}
                                            </div>
                                        )}
                                    </Button>
                                    {user && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                            Wallet Balance: GHS {(user.wallet_balance || 0).toFixed(2)}
                                        </p>
                                    )}
                                </div>

                                {/* MoMo Payment */}
                                <Button
                                    className="w-full py-6 text-lg font-semibold bg-yellow-600 hover:bg-yellow-700 text-white"
                                    onClick={() => handleCheckout("momo")}
                                    disabled={isProcessing}
                                >
                                    {isProcessing && paymentMethod === 'momo' ? (
                                        <div className="flex items-center gap-2 text-base">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-base">
                                            <CreditCard className="w-5 h-5" />
                                            Pay with MoMo - GHS {(registrationData.amount * 1.0195).toFixed(2)}
                                        </div>
                                    )}
                                </Button>
                                <div className="flex items-center justify-center gap-3 text-sm pt-2">
                                    <span className="font-semibold text-yellow-500">MTN MoMo</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-semibold text-red-500">T-Cash</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-semibold text-blue-500">AT-Money</span>
                                </div>
                            </div>

                            <p className="text-xs text-center text-gray-500 mt-4">
                                Secure payment processing. Your registration will be processed after payment confirmation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
