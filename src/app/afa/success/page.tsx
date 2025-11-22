import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home, FileText } from "lucide-react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

export default function AfaSuccessPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const reference = searchParams.get('reference')
    const method = searchParams.get('method')
    const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false)

    useEffect(() => {
        if (!hasTriggeredConfetti) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
            setHasTriggeredConfetti(true)
        }
    }, [hasTriggeredConfetti])

    return (
        <div className="min-h-screen flex flex-col relative bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            {/* Background Glow */}
            <div
                className="absolute inset-0 z-0 blur-[80px] pointer-events-none select-none
                    bg-[radial-gradient(circle_at_top_center,rgba(34,197,94,0.3),transparent_70%)]
                    dark:bg-[radial-gradient(circle_at_top_center,rgba(34,197,94,0.05),transparent_70%)]"
            />

            <div className="relative z-10 flex-1 flex flex-col">
                <HomeNavbar />
                <div className="flex-grow max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        {/* Success Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>

                        {/* Success Message */}
                        <h1 className="text-3xl font-bold mb-2">Registration Successful!</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Your AFA SIM card registration has been completed successfully.
                        </p>

                        {/* Details Card */}
                        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-green-200 dark:border-green-900 mb-8">
                            <CardHeader>
                                <CardTitle>Registration Details</CardTitle>
                                <CardDescription>
                                    Your registration has been submitted and will be processed shortly
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {reference && (
                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Reference Number</span>
                                        <span className="font-mono font-semibold">{reference}</span>
                                    </div>
                                )}
                                {method && (
                                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
                                        <span className="font-semibold capitalize">{method === 'wallet' ? 'Wallet' : 'Mobile Money'}</span>
                                    </div>
                                )}
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="text-sm text-green-800 dark:text-green-300">
                                        ✓ Payment confirmed
                                    </p>
                                    <p className="text-sm text-green-800 dark:text-green-300">
                                        ✓ Registration submitted
                                    </p>
                                    <p className="text-sm text-green-800 dark:text-green-300">
                                        ✓ Processing in progress
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={() => navigate('/afa/orders')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                View My Registrations
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => navigate('/')}
                            >
                                <Home className="w-5 h-5 mr-2" />
                                Back to Home
                            </Button>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>What's Next?</strong><br />
                                Your registration is being processed. You will receive a confirmation once it's completed.
                                You can track the status in your AFA orders page.
                            </p>
                        </div>
                    </motion.div>
                </div>
                <Footer />
            </div>
        </div>
    )
}
