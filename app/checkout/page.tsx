"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart, addToCart } = useCart()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  // Handle direct purchase from query param (legacy support or direct buy)
  useEffect(() => {
    const packageId = searchParams.get('package')
    if (packageId) {
      // Fetch package details and add to cart if not already there
      // For now, we'll assume the user adds to cart from the store page
      // This is just a placeholder for future direct link handling
    }
  }, [searchParams])

  const handleQuantityChange = (id: number, change: number) => {
    const item = items.find(i => i.id === id)
    if (item) {
      updateQuantity(id, item.quantity + change)
    }
  }

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login?redirect=/checkout')
      return
    }

    setIsProcessing(true)

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "Order placed successfully!",
        description: "Your order has been processed.",
        duration: 5000,
      })
      clearCart()
      const reference = `ORD-${Math.floor(Math.random() * 1000000)}`
      router.push(`/checkout/success?reference=${reference}`)
    }, 2000)
  }

  const getProviderLogo = (provider: string) => {
    const p = provider.toLowerCase();
    if (p.includes('mtn')) return '/logos/mtn.png';
    if (p.includes('airtel') || p.includes('tigo')) return '/logos/airteltigo.png';
    if (p.includes('telecel')) return '/logos/telecel.png';
    if (p.includes('afa')) return '/logos/afa.png';
    return '/logos/mtn.png'; // Default fallback
  }

  return (
    <div className="flex-1 flex flex-col relative bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300 min-h-screen">
      <HomeNavbar />

      <div className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/stores')}
            className="mb-4 hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-white dark:bg-[#111] rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Logo */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                        <Image
                          src={getProviderLogo(item.provider)}
                          alt={item.provider}
                          fill
                          className="object-contain p-1"
                        />
                      </div>

                      {/* Main Content Area */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-semibold text-sm sm:text-lg leading-tight truncate pr-2">{item.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.provider} • {item.size}</p>
                          </div>
                          <div className="font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-base whitespace-nowrap">
                            GHS {(item.agent_price || item.price).toFixed(2)}
                          </div>
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-8">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="px-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors h-full flex items-center justify-center"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="px-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors h-full flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            <span className="text-xs">Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#111] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>GHS {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Service Fee</span>
                    <span>GHS 0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>GHS {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Checkout (GHS {totalPrice.toFixed(2)})
                    </div>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  Secure payment processing. By continuing, you agree to our terms of service.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              Looks like you haven't added any data packages to your cart yet. Browse our stores to find the best deals.
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/stores')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Browse Stores
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
