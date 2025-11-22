import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export function PWAInstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        // Check if already installed
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://')

        if (isInstalled) {
            return
        }

        // Check if user has dismissed the banner before
        const dismissed = localStorage.getItem('pwa-banner-dismissed')
        if (dismissed) {
            const dismissedTime = parseInt(dismissed)
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

            // Show again after 7 days
            if (daysSinceDismissed < 7) {
                return
            }
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowBanner(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt')
        }

        setDeferredPrompt(null)
        setShowBanner(false)
    }

    const handleDismiss = () => {
        localStorage.setItem('pwa-banner-dismissed', Date.now().toString())
        setShowBanner(false)
    }

    if (!showBanner) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:max-w-md"
            >
                <div
                    className="relative rounded-2xl p-4 shadow-2xl border"
                    style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(40px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.3),
              0 8px 24px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.6),
              inset 0 -1px 0 rgba(0, 0, 0, 0.08)
            `
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>

                    <div className="flex items-start gap-4 pr-8">
                        {/* App Icon */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                            G
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Install GiGSHUB
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Install our app for a better experience with offline access and faster loading.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleInstall}
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                >
                                    Install
                                </Button>
                                <Button
                                    onClick={handleDismiss}
                                    size="sm"
                                    variant="outline"
                                >
                                    Not Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
