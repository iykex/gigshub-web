"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Crown, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

export default function AgentRegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    })
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    username: formData.name,
                    phone: formData.phone,
                    role: 'agent'
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Registration failed')
            }

            const data = await response.json()

            if (data.generatedPassword) {
                setGeneratedPassword(data.generatedPassword)
                toast({ title: "Registration successful!" })
            } else {
                // Fallback if no password returned (shouldn't happen for agents)
                router.push("/agent/payment")
            }
        } catch (error) {
            toast({
                title: "Registration failed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive"
            })
        } finally {
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
        router.push("/agent/payment")
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
                            <h1 className="text-3xl font-bold">Become an Agent</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">Join our agent network and earn with exclusive discounts</p>
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
                                    <div className="text-4xl font-bold text-blue-600 mb-2">GHS 30.00</div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">One-time payment</p>
                                    <Badge className="mt-4 bg-blue-100 text-blue-700">Lifetime Access</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Agent Registration Form</CardTitle>
                            <CardDescription>Fill in your details to get started</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="0501234567"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Processing..." : "Register as Agent"}
                                </Button>
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
                                Your agent account has been created. Please save your temporary password below.
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
                                Continue to Payment
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
