"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Home, Store, User, Settings, Menu, X, ChevronRight, ShoppingCart } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useCart } from "@/contexts/cart-context"

const MotionLink = motion(Link)

export function MobileNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const [isExpanded, setIsExpanded] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [showPill, setShowPill] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Close expanded menu on any scroll
      if (isExpanded) {
        setIsExpanded(false)
      }

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
  }, [isExpanded, lastScrollY])

  // Lock body scroll when menu is expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isExpanded])

  // Hide mobile nav on auth pages
  const hideOnPaths = ['/login', '/signup', '/signin', '/sign-up', '/sign-in']
  if (hideOnPaths.includes(pathname)) {
    return null
  }

  const links = [
    { href: "/", icon: Home, label: "Home", description: "Back to homepage" },
    { href: "/stores", icon: Store, label: "Stores", description: "Browse products" }, // Fixed href to /stores
    { href: "/checkout", icon: ShoppingCart, label: "Cart", description: "View shopping cart" }, // Added Cart
    { href: "/dashboard/agent", icon: User, label: "Agent", description: "Agent dashboard" },
    { href: "/dashboard/admin", icon: Settings, label: "Admin", description: "Admin panel" },
  ]

  return (
    <>
      {/* Expanded Full-Screen Menu Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[60] bg-black/20 dark:bg-black/40 md:hidden"
              onClick={() => setIsExpanded(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: "100%", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: "100%", scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 35,
                mass: 0.8
              }}
              className="fixed bottom-0 left-0 right-0 z-[70] md:hidden"
              style={{
                maxHeight: '70vh',
              }}
            >
              <div
                className="relative mx-4 mb-4 rounded-[32px] overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(60px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(60px) saturate(200%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 20px 60px rgba(0, 0, 0, 0.15),
                    0 8px 24px rgba(0, 0, 0, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.6),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.08)
                  `,
                }}
              >
                {/* Liquid gradient overlay */}
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.05) 100%)',
                  }}
                />

                {/* Dark mode styles */}
                <style jsx>{`
                  @media (prefers-color-scheme: dark) {
                    div[style*="rgba(255, 255, 255, 0.85)"] {
                      background: rgba(30, 30, 30, 0.85) !important;
                      border: 1px solid rgba(255, 255, 255, 0.15) !important;
                      box-shadow: 
                        0 20px 60px rgba(0, 0, 0, 0.5),
                        0 8px 24px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.15),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.4) !important;
                    }
                  }
                `}</style>

                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Navigation
                    </h2>
                    <motion.button
                      onClick={() => setIsExpanded(false)}
                      whileTap={{ scale: 0.9 }}
                      className="relative p-2 rounded-full"
                      style={{
                        background: 'rgba(120, 120, 128, 0.15)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                      }}
                    >
                      <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </motion.button>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="relative px-4 py-4 space-y-2">
                  {links.map((link, index) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href
                    const isHovered = hoveredIndex === index
                    const isCart = link.href === '/checkout'

                    return (
                      <MotionLink
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsExpanded(false)}
                        onHoverStart={() => setHoveredIndex(index)}
                        onHoverEnd={() => setHoveredIndex(null)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative block"
                      >
                        <div
                          className="relative flex items-center gap-4 px-4 py-4 rounded-2xl overflow-hidden"
                          style={{
                            background: isActive
                              ? 'linear-gradient(135deg, rgba(70, 130, 180, 0.2) 0%, rgba(70, 130, 180, 0.1) 100%)'
                              : isHovered
                                ? 'rgba(120, 120, 128, 0.08)'
                                : 'transparent',
                            backdropFilter: isActive || isHovered ? 'blur(20px)' : 'none',
                            WebkitBackdropFilter: isActive || isHovered ? 'blur(20px)' : 'none',
                            border: isActive
                              ? '1px solid rgba(70, 130, 180, 0.25)'
                              : '1px solid transparent',
                            boxShadow: isActive
                              ? `
                                0 4px 20px rgba(70, 130, 180, 0.15),
                                inset 0 1px 0 rgba(255, 255, 255, 0.3),
                                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                              `
                              : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          {/* Icon container with liquid background */}
                          <div
                            className="relative flex items-center justify-center w-12 h-12 rounded-xl"
                            style={{
                              background: isActive
                                ? 'linear-gradient(135deg, rgba(70, 130, 180, 0.3) 0%, rgba(70, 130, 180, 0.2) 100%)'
                                : 'rgba(120, 120, 128, 0.1)',
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              boxShadow: isActive
                                ? 'inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.1)'
                                : 'none',
                            }}
                          >
                            <Icon
                              className={cn(
                                "w-5 h-5 transition-all duration-300",
                                isActive && "text-[#0077BE] dark:text-[#4A9FD8]",
                                !isActive && "text-gray-600 dark:text-gray-400"
                              )}
                            />
                            {isCart && totalItems > 0 && (
                              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-[#0077BE] text-white border-2 border-white dark:border-[#0a0a0a]">
                                {totalItems}
                              </span>
                            )}
                          </div>

                          {/* Text content */}
                          <div className="flex-1">
                            <div className={cn(
                              "font-medium transition-colors duration-300",
                              isActive && "text-[#0077BE] dark:text-[#4A9FD8]",
                              !isActive && "text-gray-900 dark:text-gray-100"
                            )}>
                              {link.label}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {link.description}
                            </div>
                          </div>

                          {/* Chevron indicator */}
                          <ChevronRight
                            className={cn(
                              "w-5 h-5 transition-all duration-300",
                              isActive && "text-[#0077BE] dark:text-[#4A9FD8] opacity-100",
                              !isActive && "text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100"
                            )}
                          />

                          {/* Active indicator - liquid glow */}
                          {isActive && (
                            <motion.div
                              layoutId="menu-active-indicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                              style={{
                                background: 'linear-gradient(180deg, rgba(70, 130, 180, 0.8) 0%, rgba(70, 130, 180, 0.4) 100%)',
                                boxShadow: '0 0 12px rgba(70, 130, 180, 0.5)',
                              }}
                              transition={{
                                type: 'spring',
                                bounce: 0.2,
                                duration: 0.6,
                              }}
                            />
                          )}
                        </div>
                      </MotionLink>
                    )
                  })}
                </div>

                {/* Footer with subtle gradient */}
                <div
                  className="relative px-6 py-4 mt-2"
                  style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.02) 100%)',
                  }}
                >
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Swipe down or tap outside to close
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                <style jsx>{`
                  @media (prefers-color-scheme: dark) {
                    nav > div > div:first-child {
                      background: rgba(30, 30, 30, 0.75) !important;
                      border: 1px solid rgba(255, 255, 255, 0.15) !important;
                      box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        0 2px 8px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.12),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.3) !important;
                    }
                  }
                `}</style>

                {/* Navigation Items */}
                {links.map((link, index) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  const isCart = link.href === '/checkout'

                  return (
                    <MotionLink
                      key={link.href}
                      href={link.href}
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

                {/* Divider */}
                <div
                  className="w-px h-8 mx-1"
                  style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(120, 120, 128, 0.3) 50%, transparent 100%)',
                  }}
                />

                {/* Menu Button */}
                <motion.button
                  onClick={() => setIsExpanded(!isExpanded)}
                  whileTap={{ scale: 0.88 }}
                  className="relative p-3 rounded-full flex items-center justify-center"
                >
                  {/* Hover/Active effect */}
                  <motion.div
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 rounded-full opacity-0"
                    style={{
                      background: 'rgba(120, 120, 128, 0.12)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                    transition={{ duration: 0.2 }}
                  />

                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative z-10"
                  >
                    {isExpanded ? (
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </motion.div>
                  <span className="sr-only">Menu</span>
                </motion.button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
