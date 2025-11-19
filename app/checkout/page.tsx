import { Suspense } from "react"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { GlassCard } from "@/components/ui/glass-card"
import { Loader2 } from 'lucide-react'

export default function CheckoutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground">
          Complete your purchase securely.
        </p>
      </div>

      <GlassCard className="p-6 md:p-8">
        <Suspense 
          fallback={
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading checkout details...</p>
            </div>
          }
        >
          <CheckoutForm />
        </Suspense>
      </GlassCard>
    </div>
  )
}
