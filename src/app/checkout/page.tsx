import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard, Wallet } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/lib/toast"
import PaystackPop from '@paystack/inline-js'
import confetti from 'canvas-confetti'

interface PaymentVerificationResponse {
  status: boolean
  message?: string
  data?: any
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, updateUser } = useAuth()
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "momo">("momo")

  // Calculate service fee: 1.95% for Paystack, 0% for wallet
  const serviceFee = paymentMethod === "momo" ? totalPrice * 0.0195 : 0
  const finalTotal = totalPrice + serviceFee

  // Handle direct purchase from query param (legacy support or direct buy)
  useEffect(() => {
    const packageId = searchParams.get('package')
    if (packageId) {
      // Fetch package details and add to cart if not already there
      // For now, we'll assume the user adds to cart from the store page
      // This is just a placeholder for future direct link handling
    }
  }, [searchParams])

  // Set default payment method based on wallet balance
  useEffect(() => {
    if (user && user.wallet_balance && user.wallet_balance >= totalPrice) {
      setPaymentMethod("wallet")
    } else {
      setPaymentMethod("momo")
    }
  }, [user, totalPrice])

  const handleQuantityChange = (id: number, recipientPhone: string, change: number) => {
    const item = items.find(i => i.id === id && i.recipientPhone === recipientPhone)
    if (item) {
      updateQuantity(id, recipientPhone, item.quantity + change)
    }
  }



  const handlePaystackPayment = (amount: number) => {
    if (!user) return

    const paystack = new PaystackPop()
    const reference = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    paystack.newTransaction({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_1d40c94c8cf2954723683a3a8e1b7da449c28b84', // Fallback for dev
      email: user.email,
      amount: Math.round(amount * 100), // Amount in kobo (includes 1.95% service fee)
      reference,
      onSuccess: async (transaction: any) => {
        // Show processing toast
        toast({
          title: "Processing Payment",
          description: "Verifying your transaction... ⏳",
          duration: 5000,
        })

        // Verify transaction on backend
        try {
          const response = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference: transaction.reference,
              type: 'purchase'
            })
          })

          const data: PaymentVerificationResponse = await response.json()

          if (data.status) {
            // Success!
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            })

            toast({
              title: "Payment Successful! 🎉",
              description: "Your order has been processed.",
              variant: "success"
            })

            clearCart()
            navigate(`/checkout/success?reference=${transaction.reference}`)
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
      navigate('/login?redirect=/checkout')
      return
    }

    setIsProcessing(true)
    setPaymentMethod(method) // Update state for UI feedback

    // Calculate specific total for this transaction
    const transactionServiceFee = method === "momo" ? totalPrice * 0.0195 : 0
    const transactionTotal = totalPrice + transactionServiceFee

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
            description: `Purchase of ${items.length} items`
          })
        })

        if (!response.ok) {
          throw new Error('Wallet payment failed')
        }

        // Update local user balance
        updateUser({ wallet_balance: (user.wallet_balance || 0) - transactionTotal })

        toast({
          title: "Order placed successfully!",
          description: "Payment deducted from your wallet.",
          variant: "success"
        })

        clearCart()
        const reference = `WALLET-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        navigate(`/checkout/success?reference=${reference}&method=wallet`)

      } else {
        // Paystack Inline Payment
        handlePaystackPayment(transactionTotal)
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Payment failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
      setIsProcessing(false)
    }
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
            onClick={() => navigate('/stores')}
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
                        <img
                          src={getProviderLogo(item.provider)}
                          alt={item.provider}
                          className="w-full h-full object-cover"
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
                              onClick={() => handleQuantityChange(item.id, item.recipientPhone, -1)}
                              className="px-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors h-full flex items-center justify-center"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.recipientPhone, 1)}
                              className="px-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors h-full flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2"
                            onClick={() => removeFromCart(item.id, item.recipientPhone)}
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
                <div className="space-y-3">
                  {/* Wallet Payment Button */}
                  <div>
                    <Button
                      className="w-full py-6 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                      onClick={() => {
                        handleCheckout("wallet")
                      }}
                      disabled={isProcessing || !user || (user.wallet_balance || 0) === 0 || (user.wallet_balance || 0) < totalPrice}
                    >
                      {isProcessing && paymentMethod === 'wallet' ? (
                        <div className="flex items-center gap-2 text-base">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-base">
                          <Wallet className="w-5 h-5" />
                          Pay with Wallet - GHS {totalPrice.toFixed(2)}
                        </div>
                      )}
                    </Button>
                    {user && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Wallet Balance: GHS {(user.wallet_balance || 0).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* MoMo Payment Button */}
                  <Button
                    className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      handleCheckout("momo")
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing && paymentMethod === 'momo' ? (
                      <div className="flex items-center gap-2 text-base">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-base">
                        <CreditCard className="w-5 h-5" />
                        Pay with MoMo - GHS {(totalPrice * 1.0195).toFixed(2)}
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
              onClick={() => navigate('/stores')}
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
