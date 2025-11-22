"use client"

import { Link, useLocation } from "react-router-dom"
import { Home, Store, User, Settings, ShoppingCart } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"

const MotionLink = motion(Link)

export function MobileNav() {
  const pathname = useLocation().pathname
  const { totalItems } = useCart()
  const { user } = useAuth()
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showPill, setShowPill] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Hide pill when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowPill(false)
      } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowPill(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Hide mobile nav on auth pages
  const hideOnPaths = ['/login', '/signup', '/signin', '/sign-up', '/sign-in']
  if (hideOnPaths.includes(pathname)) {
    return null
  }

  const allLinks = [
    { href: "/", icon: Home, label: "Home", description: "Back to homepage", public: true },
    { href: "/stores", icon: Store, label: "Stores", description: "Browse products", public: false },
    { href: "/checkout", icon: ShoppingCart, label: "Cart", description: "View shopping cart", public: true },
    { href: "/dashboard/agent", icon: User, label: "Agent", description: "Agent dashboard", public: false },
    { href: "/dashboard/admin", icon: Settings, label: "Admin", description: "Admin panel", public: false },
  ]

  const links = allLinks.filter(link => link.public || user)

  return (
    <>
      {/* Bottom Pill Navigation Bar */}
      <AnimatePresence>
        {showPill && (
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }}
            className="fixed bottom-6 left-0 right-0 z-50 flex justify-center max-w-7xl mx-auto px-4 md:hidden pointer-events-none"
          >
            <div className="pointer-events-auto">
              <div
                className="relative flex items-center gap-1 px-3 py-2.5 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.12),
                    0 2px 8px rgba(0, 0, 0, 0.06),
                    inset 0 1px 0 rgba(255, 255, 255, 0.6),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.08)
                  `,
                }}
              >
                {/* Liquid gradient overlay */}
                <div
                  className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 100%)',
                  }}
                />

                {/* Dark mode styles */}


                {/* Navigation Items */}
                {links.map((link, index) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  const isCart = link.href === '/checkout'

                  return (
                    <MotionLink
                      key={link.href}
                      to={link.href}
                      whileTap={{ scale: 0.88 }}
                      className="relative p-3 rounded-full flex items-center justify-center"
                    >
                      {/* Active state - Liquid pill */}
                      {isActive && (
                        <motion.div
                          layoutId="pill-nav-active"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, rgba(70, 130, 180, 0.25) 0%, rgba(70, 130, 180, 0.15) 100%)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(70, 130, 180, 0.3)',
                            boxShadow: `
                              0 4px 16px rgba(70, 130, 180, 0.2),
                              inset 0 1px 0 rgba(255, 255, 255, 0.3),
                              inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                            `,
                          }}
                          transition={{
                            type: 'spring',
                            bounce: 0.2,
                            duration: 0.6,
                            mass: 0.8
                          }}
                        />
                      )}

                      <div className="relative">
                        <Icon
                          className={cn(
                            "w-5 h-5 relative z-10 transition-all duration-300",
                            isActive && "text-[#0077BE] dark:text-[#4A9FD8]",
                            !isActive && "text-gray-600 dark:text-gray-400"
                          )}
                        />
                        {isCart && totalItems > 0 && (
                          <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-0.5 rounded-full text-[9px] font-bold bg-[#0077BE] text-white border border-white dark:border-[#0a0a0a] z-20">
                            {totalItems}
                          </span>
                        )}
                      </div>
                      <span className="sr-only">{link.label}</span>
                    </MotionLink>
                  )
                })}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
