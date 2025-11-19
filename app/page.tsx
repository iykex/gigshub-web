"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Smartphone, Shield, Zap, Clock, GraduationCap, ShoppingBag, MessageCircle, Info, CheckCircle, Users, Crown, X, Wifi, KeyRound, Heart, ChevronRight, UserPlus, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { DataPurchaseCard } from "@/components/cards/data-purchase-card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion } from "framer-motion"

export default function HomePageClient() {
  const router = useRouter()
  const { user: currentUser, loading } = useAuth()
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && currentUser) {
      const path =
        currentUser.role === "admin"
          ? "/dashboard"
          : currentUser.role === "agent"
          ? "/agent/dashboard"
          : "/customer/dashboard"
      router.replace(path)
    }
  }, [currentUser, loading, router])

  const handleGetStarted = () => router.push("/buy-data")

  return (
    <div>

      <HomeNavbar />
        <div className="min-h-screen flex flex-col relative max-w-6xl mx-auto px-3 sm:px-6 pt-0 pb-4">
          {/* Hero Section */}
          <section className="flex flex-col md:flex-row items-center justify-center flex-grow gap-6 md:gap-10 py-12">
        {/* Left Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="md:w-1/2 text-center md:text-left"
        >
          <Badge className="bg-blue-100 text-blue-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full inline-flex items-center justify-center text-xs md:text-sm mb-4">
            <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Fast Delivery
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-gray-900 dark:text-white" style={{ fontWeight: 900 }}>
            Instant Data <br />
            <span className="text-blue-500">
              Services 4U
            </span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto md:mx-0 mt-4 mb-8">
            Get your data bundles, AFA Registration, and more in minutes with secure payments and 24/7 support.
          </p>

          <div className="md:hidden mt-8">
            <DataPurchaseCard />
          </div>
          <div className="hidden md:block mt-8">
            <DataPurchaseCard />
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:w-1/2 w-full"
        >
          <div className="hidden md:block">
            <div className="relative w-full max-w-sm mx-auto">
              <Image
                src="/phone-mockup-1.png"
                alt="Modern phone mockup"
                width={400}
                height={400}
                className="w-full h-auto rounded-3xl object-cover drop-shadow-xl mix-blend-multiply dark:mix-blend-lighten"
                priority
              />
            </div>
          </div>
          <div className="mt-8 md:hidden">
            <div className="relative w-full max-w-sm mx-auto">
              <Image
                src="/phone-mockup-1.png"
                alt="Another modern phone mockup"
                width={400}
                height={400}
                className="w-full h-auto rounded-3xl object-cover drop-shadow-xl mix-blend-multiply dark:mix-blend-lighten"
                priority
              />
            </div>
          </div>
        </motion.div>
      </section>
    </div>
      <Footer />


      {/* Benefits Modal */}
      {isBenefitsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Sticky Close Button */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-t-3xl border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Why Choose GiGSHUB?
              </h3>
              <button
                onClick={() => setIsBenefitsModalOpen(false)}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1 sm:p-2 transition-colors duration-200"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-200" />
              </button>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <p className="text-center text-gray-600 dark:text-gray-300 mb-4 text-xs sm:text-sm md:text-base">
                Enjoy exclusive discounts and benefits by creating your account.
              </p>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {/* Customer */}
                <Card className="border border-gray-200 dark:border-gray-800 backdrop-blur-md">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 dark:text-gray-100" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          Customer Account
                        </h4>
                        <Badge className="bg-gray-200 text-gray-900 text-xs">
                          Up to 5% Discount
                        </Badge>
                      </div>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        Discounts on all packages
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        Order tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        Priority support
                      </li>
                    </ul>
                    <Button
                      onClick={() => router.push("/signup")}
                      className="w-full mt-4 sm:mt-6 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm sm:text-base py-2 sm:py-3"
                    >
                      <UserPlus className="w-4 h-4 mr-2" /> 
                      Create Account
                    </Button>
                  </CardContent>
                </Card>

                {/* Agent */}
                <Card className="border border-blue-200 dark:border-blue-800 backdrop-blur-md">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 dark:text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          Agent Account
                        </h4>
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          Up to 10% Discount
                        </Badge>
                      </div>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        Bulk purchases
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        Reseller dashboard
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        Priority support
                      </li>
                    </ul>
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-2 mt-4 text-xs text-blue-800 dark:text-blue-300">
                      <strong>Note:</strong> GHS 30 activation fee required.
                    </div>
                    <Button
                      onClick={() => router.push("/signup")}
                      className="w-full mt-4 sm:mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm sm:text-base py-2 sm:py-3"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Become an Agent
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
