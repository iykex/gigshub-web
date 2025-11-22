import { useEffect, useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { CheckCircle2, Home, ShoppingBag, Loader2, XCircle } from 'lucide-react'
import { toast } from "@/lib/toast"
import confetti from 'canvas-confetti'

interface VerificationResponse {
  status: boolean
  message?: string
  error?: string
  data?: any
}

export default function SuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const reference = searchParams.get("reference")
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!reference) {
      navigate('/stores')
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference })
        })

        const data = await response.json() as VerificationResponse

        if (data.status) {
          setVerified(true)

          // Trigger confetti
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          })

          toast({
            title: "Payment Verified 🎉",
            description: "Your transaction has been confirmed.",
            variant: "success"
          })
        } else {
          throw new Error(data.error || 'Verification failed')
        }
      } catch (error) {
        console.error(error)
        toast({
          title: "Verification Failed 😢",
          description: "Could not verify payment. Please contact support.",
          variant: "destructive"
        })
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [reference, navigate])

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 dark:from-[#0a0a0a] dark:to-[#1a1a1a] relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-75" />
        </div>

        {/* Loader content */}
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              GiGSHUB
            </h2>
          </div>

          {/* Modern dot loader */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Verifying your payment... ⏳
          </p>
        </div>
      </div>
    )
  }

  if (!verified) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <GlassCard className="text-center space-y-6 p-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 text-red-600 dark:text-red-400">
              <XCircle className="w-12 h-12" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Verification Failed 😢</h1>
            <p className="text-muted-foreground">
              We couldn't verify your payment. If you were charged, please contact support with your reference.
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 text-sm">
            <p className="text-muted-foreground">Order Reference</p>
            <p className="font-mono font-medium text-lg">{reference}</p>
          </div>
          <Button variant="outline" className="w-full rounded-full" asChild>
            <Link to="/checkout">Try Again</Link>
          </Button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <GlassCard className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold">Payment Successful! 🎉</h1>
          <p className="text-muted-foreground">
            Your order has been placed successfully. The data bundle will be delivered shortly.
          </p>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4 text-sm">
          <p className="text-muted-foreground">Order Reference</p>
          <p className="font-mono font-medium text-lg">{reference}</p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button className="w-full rounded-full" asChild>
            <Link to="/stores">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Buy More Data
            </Link>
          </Button>
          <Button variant="outline" className="w-full rounded-full" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}
