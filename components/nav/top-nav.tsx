"use client"

import Link from "next/link"
import Image from 'next/image'
import { Menu, X, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export function TopNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/store', label: 'Store' },
    { href: '/dashboard/agent', label: 'Agent' },
    { href: '/dashboard/admin', label: 'Admin' },
  ]

  const getHref = (path: string) => {
    if (path === '/') return '/'
    return user ? path : '/login'
  }

  return (
    <nav className="sticky top-0 z-50 w-full px-3 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between glassmorphism rounded-full px-3 py-2 md:px-6 shadow-sm bg-white/60 dark:bg-black/60 backdrop-blur-md border border-white/20">
          {/* Logo */}
          <Link href={getHref('/')} className="flex items-center transition-shadow">
            <Image
              src="/gigshub-logo.png"
              alt="GiGSHUB"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getHref(link.href)}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  "hover:text-primary focus:text-primary focus:outline-none",
                  pathname === link.href
                    ? "text-primary bg-white dark:bg-gray-700 shadow-sm"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
            {user ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="rounded-full">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-lg p-3 border border-white/20">
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={getHref(link.href)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-full transition-all duration-300",
                      "hover:text-primary focus:text-primary focus:outline-none",
                      pathname === link.href
                        ? "text-primary bg-white dark:bg-gray-800 shadow-sm"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{link.label}</span>
                    <ChevronRight size={16} className={cn(
                      "transition-transform",
                      pathname === link.href && "text-primary"
                    )} />
                  </Link>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                {user ? (
                  <button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-full transition-all duration-300 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                  >
                    <span>Sign Out</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <Link href="/login" className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-full transition-all duration-300 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
                    <span>Sign In</span>
                    <ChevronRight size={16} />
                  </Link>
                )}
                <div className="pt-2 px-4">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
