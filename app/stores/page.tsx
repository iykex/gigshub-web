"use client"

import { useState } from "react"
import { HomeNavbar } from "@/components/nav/home-navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { ChevronRight, Sparkles } from "lucide-react"
import Image from "next/image"

interface StoreItem {
    id: string
    name: string
    description: string
    packagesCount: number
    gradient: string
    accentColor: string
    logoUrl: string
}

export default function StoresPage() {
    const { user } = useAuth()
    const router = useRouter()

    const stores: StoreItem[] = [
        {
            id: 'mtn',
            name: 'MTN',
            description: 'MTN Data Bundles',
            packagesCount: 13,
            gradient: 'linear-gradient(135deg, #FFCC00 0%, #FFB800 100%)',
            accentColor: '#FFCC00',
            logoUrl: '/logos/mtn.png'
        },
        {
            id: 'airteltigo-ishare',
            name: 'AirtelTigo',
            description: 'iShare Data Bundles',
            packagesCount: 8,
            gradient: 'linear-gradient(135deg, #0078d4 0%, #0078d4 100%)',
            accentColor: '#0078d4',
            logoUrl: '/logos/airteltigo.png'
        },
        {
            id: 'airteltigo-bigtime',
            name: 'AirtelTigo',
            description: 'BigTime Data Bundles',
            packagesCount: 6,
            gradient: 'linear-gradient(135deg, #0078d4 0%, #0078d4 100%)',
            accentColor: '#0078d4',
            logoUrl: '/logos/airteltigo.png'
        },
        {
            id: 'telecel',
            name: 'Telecel',
            description: 'Telecel Data Bundles',
            packagesCount: 10,
            gradient: 'linear-gradient(135deg, #e74c3c 0%, #e74c3c 100%)',
            accentColor: '#e74c3c',
            logoUrl: '/logos/telecel.png'
        },
        {
            id: 'afa-registration',
            name: 'AFA Registration',
            description: 'Register Your SIM Card',
            packagesCount: 1,
            gradient: 'linear-gradient(135deg, #FFCC00 0%, #FFB800 100%)',
            accentColor: '#FFCC00',
            logoUrl: '/logos/afa.png'
        },
    ]

    return (
        <div className="flex-1 flex flex-col relative bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            {/* Background Glow */}
            <div
                className="absolute inset-0 z-0 blur-[100px] pointer-events-none select-none
          bg-[radial-gradient(circle_at_top_center,rgba(70,130,180,0.3),transparent_70%)]
          dark:bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.02),transparent_70%)]"
            />

            <div className="relative z-10 flex-1 flex flex-col">
                <HomeNavbar />
                <div className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 mb-4"
                        >
                            <span className="text-base font-bold text-[#0077BE] uppercase tracking-wider">
                                Data Store
                            </span>
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto"
                        >
                            Browse premium data packages from Ghana's leading telecom providers
                        </motion.p>
                        {user?.role === 'agent' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="mt-6"
                            >
                                <div
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(70, 130, 180, 0.15) 0%, rgba(70, 130, 180, 0.08) 100%)',
                                        backdropFilter: 'blur(20px)',
                                        WebkitBackdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(70, 130, 180, 0.2)',
                                        boxShadow: `
                                            0 4px 16px rgba(70, 130, 180, 0.1),
                                            inset 0 1px 0 rgba(255, 255, 255, 0.3)
                                        `,
                                    }}
                                >
                                    <Sparkles className="w-4 h-4 text-[#0077BE]" />
                                    <span className="text-[#0077BE] dark:text-[#4A9FD8] font-semibold">
                                        Agent Pricing Active
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Store Cards */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {stores.map((store, index) => (
                            <motion.div
                                key={store.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 15
                                }}
                                whileHover={{ y: -8 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(`/stores/${store.id}`)}
                                className="cursor-pointer group"
                            >
                                <div
                                    className="relative rounded-[28px] p-5 overflow-hidden"
                                    style={{
                                        background: store.gradient,
                                        backdropFilter: 'blur(40px) saturate(180%)',
                                        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        boxShadow: `
                                            0 20px 60px rgba(0, 0, 0, 0.25),
                                            0 8px 24px rgba(0, 0, 0, 0.15),
                                            inset 0 1px 0 rgba(255, 255, 255, 0.4),
                                            inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                                        `,
                                    }}
                                >
                                    {/* Glassy overlay for frosted effect */}
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(0, 0, 0, 0.1) 100%)',
                                        }}
                                    />

                                    {/* Hover glow */}
                                    <motion.div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background: `radial-gradient(circle at center, ${store.accentColor}15 0%, transparent 70%)`,
                                        }}
                                    />

                                    <div className="relative flex items-center justify-between">
                                        {/* Left side - Logo and Info */}
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Logo Container with gradient accent */}
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-0 rounded-[24px] opacity-20 blur-xl"
                                                    style={{
                                                        background: store.gradient,
                                                    }}
                                                />
                                                <div
                                                    className="relative w-16 h-16 rounded-[18px] flex items-center justify-center overflow-hidden"
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.95)',
                                                        backdropFilter: 'blur(20px)',
                                                        WebkitBackdropFilter: 'blur(20px)',
                                                        boxShadow: `
                                                            0 8px 32px rgba(0, 0, 0, 0.12),
                                                            inset 0 1px 0 rgba(255, 255, 255, 0.8),
                                                            inset 0 -1px 0 rgba(0, 0, 0, 0.05)
                                                        `,
                                                    }}
                                                >
                                                    <Image
                                                        src={store.logoUrl}
                                                        alt={store.name}
                                                        width={64}
                                                        height={64}
                                                        className="object-cover scale-110"
                                                    />
                                                </div>
                                            </div>

                                            {/* Text Info */}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white mb-0.5 drop-shadow-lg">
                                                    {store.name}
                                                </h3>
                                                <p className="text-white/90 text-xs font-medium mb-1.5 drop-shadow">
                                                    {store.description}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                                        style={{
                                                            background: 'rgba(255, 255, 255, 0.25)',
                                                            backdropFilter: 'blur(10px)',
                                                            WebkitBackdropFilter: 'blur(10px)',
                                                            color: 'white',
                                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                                        }}
                                                    >
                                                        {store.packagesCount} packages
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right side - View Button */}
                                        <motion.div
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-full"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.95)',
                                                backdropFilter: 'blur(20px)',
                                                WebkitBackdropFilter: 'blur(20px)',
                                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                                boxShadow: `
                                                    0 4px 16px rgba(0, 0, 0, 0.15),
                                                    inset 0 1px 0 rgba(255, 255, 255, 0.8),
                                                    inset 0 -1px 0 rgba(0, 0, 0, 0.05)
                                                `,
                                            }}
                                            whileHover={{ scale: 1.05, x: 5 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        >
                                            <span className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                                View
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-gray-700" />
                                        </motion.div>
                                    </div>

                                    {/* Bottom accent line */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{
                                            background: store.gradient,
                                        }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Info Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-20 text-center"
                    >
                        <div
                            className="inline-block px-8 py-5 rounded-[24px] max-w-2xl"
                            style={{
                                background: 'rgba(70, 130, 180, 0.08)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                border: '1px solid rgba(70, 130, 180, 0.15)',
                                boxShadow: `
                                    0 8px 32px rgba(70, 130, 180, 0.1),
                                    inset 0 1px 0 rgba(255, 255, 255, 0.3)
                                `,
                            }}
                        >
                            <div className="flex items-center justify-center gap-3 text-gray-700 dark:text-gray-300">
                                <Sparkles className="w-5 h-5 text-[#0077BE]" />
                                <p>
                                    <span className="font-semibold">Pro Tip:</span> Agents enjoy exclusive pricing on all data packages
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <Footer />
            </div>
        </div>
    )
}
