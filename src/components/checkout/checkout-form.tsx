import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getPackageById } from "@/lib/mock-data"
import { PricingPackage } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Loader2, Smartphone, CreditCard, Wallet } from 'lucide-react'
import { toast } from "sonner"

export function CheckoutForm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const packageId = searchParams.get("package")

  const [pkg, setPkg] = useState<PricingPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("paystack")
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    if (packageId) {
      const foundPackage = getPackageById(parseInt(packageId))
      if (foundPackage) {
        setPkg(foundPackage)
      }
    }
    setLoading(false)
  }, [packageId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number")
      return
    }

    setProcessing(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    setProcessing(false)
    toast.success("Order placed successfully!")
    navigate(`/checkout/success?reference=${Math.random().toString(36).substring(7)}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading package details...</p>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-destructive">Package not found or invalid.</p>
        <Button onClick={() => navigate("/stores")}>Return to Store</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Order Summary */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Order Summary</h3>
        <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Provider</span>
            <span className="font-medium">{pkg.provider}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Package</span>
            <span className="font-medium">{pkg.name} ({pkg.size})</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">GHS {pkg.price.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Phone Number */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Recipient Details</h3>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              placeholder="024XXXXXXX"
              className="pl-9"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              type="tel"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            The data bundle will be sent to this number instantly.
          </p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Payment Method</h3>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <RadioGroupItem value="paystack" id="paystack" className="peer sr-only" />
            <Label
              htmlFor="paystack"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <CreditCard className="mb-3 h-6 w-6" />
              Pay with Paystack
            </Label>
          </div>
          <div>
            <RadioGroupItem value="wallet" id="wallet" className="peer sr-only" disabled />
            <Label
              htmlFor="wallet"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 opacity-50 cursor-not-allowed"
            >
              <Wallet className="mb-3 h-6 w-6" />
              Wallet (Login required)
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full h-12 text-lg rounded-full shadow-lg" disabled={processing}>
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay GHS ${pkg.price.toFixed(2)}`
        )}
      </Button>
    </form>
  )
}
