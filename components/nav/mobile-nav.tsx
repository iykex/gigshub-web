"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Home, Store, User, Settings, Plus } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

const MotionLink = motion(Link)

export function MobileNav() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > 50 && currentScrollY > lastScrollY) {
        setIsExpanded(false)
      } else if (currentScrollY < 20) {
        setIsExpanded(true)
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

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/store", icon: Store, label: "Store" },
    { href: "/dashboard/agent", icon: User, label: "Agent" },
    { href: "/dashboard/admin", icon: Settings, label: "Admin" },
  ]

  return (
    <nav className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6 md:hidden pointer-events-none">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="
              glass-pill flex items-center gap-4 
              px-6 py-3 bg-white/80 dark:bg-gray-900/80
              backdrop-blur-xl shadow-2xl rounded-full 
              border border-white/20 pointer-events-auto
            "
          >
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href

              return (
                <MotionLink
                  key={link.href}
                  href={link.href}
                  whileTap={{ scale: 0.92 }}
                  className="
                    relative p-3 rounded-full 
                    flex items-center justify-center
                  "
                >
                  {/* TRUE PILL ACTIVE */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="
                        absolute inset-y-1 -inset-x-2
                        rounded-full bg-primary/15 
                        border border-primary/10
                        -z-10
                      "
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.45 }}
                    />
                  )}

                  {/* TRUE PILL HOVER */}
                  {!isActive && (
                    <motion.div
                      className="
                        absolute inset-y-1 -inset-x-2
                        rounded-full bg-muted/40 opacity-0
                        hover:opacity-100 transition-all
                        -z-10
                      "
                    />
                  )}

                  <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                  <span className="sr-only">{link.label}</span>
                </MotionLink>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="pointer-events-auto"
          >
            <button
              onClick={() => setIsExpanded(true)}
              className="
                w-14 h-14 flex items-center justify-center 
                rounded-full bg-primary text-primary-foreground 
                shadow-lg hover:scale-110 active:scale-95 
                transition-all duration-300
              "
            >
              <Plus className="w-6 h-6" />
              <span className="sr-only">Expand Menu</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
