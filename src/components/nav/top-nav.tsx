import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, ChevronRight, LogOut, User, LayoutDashboard } from 'lucide-react'
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import { hasPermission, Role } from "@/lib/permissions"
import { getDashboardRoute, getDashboardLabel } from "@/lib/dashboard-utils"

const MotionLink = motion(Link)

function AuthButton({ isMobile = false, onClose }: { isMobile?: boolean, onClose?: () => void }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  if (user) {
    if (isMobile) {
      return (
        <>
          <MotionLink
            to="/dashboard"
            onClick={onClose}
            whileTap={{ scale: 0.97 }}
            className="block"
          >
            <div
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium"
              style={{
                background: 'linear-gradient(135deg, rgba(70, 130, 180, 0.15) 0%, rgba(70, 130, 180, 0.08) 100%)',
                border: '1px solid rgba(70, 130, 180, 0.2)',
              }}
            >
              <span className="text-[#0077BE] dark:text-[#4A9FD8] flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </span>
              <ChevronRight className="w-4 h-4 text-[#0077BE] dark:text-[#4A9FD8]" />
            </div>
          </MotionLink>
          <motion.button
            onClick={() => {
              signOut()
              navigate('/login')
              onClose?.()
            }}
            whileTap={{ scale: 0.97 }}
            className="w-full mt-1"
          >
            <div
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <span className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </span>
              <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </motion.button>
        </>
      )
    }

    return (
      <div className="relative">
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          whileTap={{ scale: 0.95 }}
          className="relative px-4 py-2 rounded-full text-sm font-medium overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(70, 130, 180, 0.2) 0%, rgba(70, 130, 180, 0.1) 100%)',
            border: '1px solid rgba(70, 130, 180, 0.3)',
          }}
        >
          <motion.div
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 opacity-0"
            style={{
              background: 'rgba(70, 130, 180, 0.15)',
            }}
            transition={{ duration: 0.2 }}
          />
          <span className="relative z-10 text-[#0077BE] dark:text-[#4A9FD8] flex items-center gap-2">
            <User className="w-4 h-4" />
            {user.name || user.email}
          </span>
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />

              {/* Dropdown Panel */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute right-0 mt-2 w-48 z-50"
              >
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: `
                      0 12px 40px rgba(0, 0, 0, 0.15),
                      0 4px 12px rgba(0, 0, 0, 0.08),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.08)
                    `,
                  }}
                >


                  <div className="p-2">
                    <motion.button
                      onClick={() => {
                        navigate('/dashboard')
                        setIsDropdownOpen(false)
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full px-3 py-2 rounded-xl text-sm font-medium text-left hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-2 text-gray-900 dark:text-gray-100"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </motion.button>

                    <div
                      className="h-px my-2"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(120, 120, 128, 0.3) 50%, transparent 100%)',
                      }}
                    />

                    <motion.button
                      onClick={() => {
                        signOut()
                        navigate('/login')
                        setIsDropdownOpen(false)
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full px-3 py-2 rounded-xl text-sm font-medium text-left hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (isMobile) {
    return (
      <MotionLink
        to="/login"
        onClick={onClose}
        whileTap={{ scale: 0.97 }}
        className="block"
      >
        <div
          className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium"
          style={{
            background: 'linear-gradient(135deg, rgba(70, 130, 180, 0.2) 0%, rgba(70, 130, 180, 0.1) 100%)',
            border: '1px solid rgba(70, 130, 180, 0.3)',
          }}
        >
          <span className="text-[#0077BE] dark:text-[#4A9FD8]">Sign In</span>
          <ChevronRight className="w-4 h-4 text-[#0077BE] dark:text-[#4A9FD8]" />
        </div>
      </MotionLink>
    )
  }

  return (
    <Link to="/login">
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="relative px-4 py-2 rounded-full text-sm font-medium overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(70, 130, 180, 0.2) 0%, rgba(70, 130, 180, 0.1) 100%)',
          border: '1px solid rgba(70, 130, 180, 0.3)',
        }}
      >
        <motion.div
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 opacity-0"
          style={{
            background: 'rgba(70, 130, 180, 0.15)',
          }}
          transition={{ duration: 0.2 }}
        />
        <span className="relative z-10 text-[#0077BE] dark:text-[#4A9FD8]">Sign In</span>
      </motion.div>
    </Link>
  )
}

export function TopNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const pathname = useLocation().pathname
  const { user } = useAuth()

  // Track theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const allNavLinks = [
    { href: '/', label: 'Home', permission: null },
    { href: '/stores', label: 'Store', permission: null },
    { href: '/dashboard/agent', label: 'Agent', permission: 'access_agent_panel' as const },
    { href: '/dashboard/admin', label: 'Admin', permission: 'access_admin_panel' as const },
  ]

  // Filter nav links based on permissions
  const navLinks = allNavLinks.filter(link => {
    if (!link.permission) return true
    return hasPermission(user?.role as Role, link.permission)
  })

  const getHref = (path: string) => {
    if (path === '/') return '/'
    return user ? path : '/login'
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full px-4 sm:px-6 py-3 max-w-7xl mx-auto">
        <motion.div
          initial={false}
          animate={{
            y: scrolled ? -2 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div
            className="relative flex items-center justify-between rounded-full px-4 py-2.5 md:px-6"
            style={{
              background: scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg-default)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid var(--nav-border)',
              boxShadow: scrolled ? 'var(--nav-shadow-scrolled)' : 'var(--nav-shadow-default)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >

            {/* Logo */}
            <Link to={getHref('/')} className="flex items-center relative z-10 transition-transform hover:scale-105 active:scale-95">
              <img
                src="/gigshub-logo.png"
                alt="GiGSHUB"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1 relative z-10">
              {navLinks.map((link) => {
                const isActive = pathname === link.href

                return (
                  <MotionLink
                    key={link.href}
                    to={getHref(link.href)}
                    whileTap={{ scale: 0.95 }}
                    className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300"
                  >
                    {/* Active state - Liquid pill */}
                    {isActive && (
                      <motion.div
                        layoutId="top-nav-active"
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

                    {/* Hover state */}
                    {!isActive && (
                      <motion.div
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 rounded-full opacity-0"
                        style={{
                          background: 'rgba(120, 120, 128, 0.1)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    <span className={cn(
                      "relative z-10 transition-colors duration-300",
                      isActive && "text-[#0077BE] dark:text-[#4A9FD8]",
                      !isActive && "text-gray-700 dark:text-gray-200"
                    )}>
                      {link.label}
                    </span>
                  </MotionLink>
                )
              })}

              {/* Theme Toggle */}
              <div className="ml-2">
                <ThemeToggle />
              </div>

              {/* Dashboard Button - Only for authenticated users */}
              {user && (
                <div className="ml-2">
                  <Link to={getDashboardRoute(user.role as Role)}>
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="relative px-4 py-2 rounded-full text-sm font-medium overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(70, 130, 180, 0.2) 0%, rgba(70, 130, 180, 0.1) 100%)',
                        border: '1px solid rgba(70, 130, 180, 0.3)',
                      }}
                    >
                      <motion.div
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 opacity-0"
                        style={{
                          background: 'rgba(70, 130, 180, 0.15)',
                        }}
                        transition={{ duration: 0.2 }}
                      />
                      <span className="relative z-10 text-[#0077BE] dark:text-[#4A9FD8] flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        {getDashboardLabel(user.role as Role)}
                      </span>
                    </motion.div>
                  </Link>
                </div>
              )}

              {/* Auth Button */}
              <div className="ml-2">
                <AuthButton />
              </div>
            </div>

            {/* Mobile Menu Button & Theme Toggle */}
            <div className="flex items-center gap-2 md:hidden relative z-10">
              <ThemeToggle />
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full"
                style={{
                  background: 'rgba(120, 120, 128, 0.1)',
                }}
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 90 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 35,
                mass: 0.8
              }}
              className="fixed top-20 left-4 right-4 z-50 md:hidden"
            >
              <div
                className="relative rounded-[24px] overflow-hidden transition-all duration-200"
                style={{
                  background: isDarkMode ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(60px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(60px) saturate(200%)',
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: isDarkMode
                    ? `0 20px 60px rgba(0, 0, 0, 0.6),
                       0 8px 24px rgba(0, 0, 0, 0.3),
                       inset 0 1px 0 rgba(255, 255, 255, 0.1),
                       inset 0 -1px 0 rgba(0, 0, 0, 0.3)`
                    : `0 20px 60px rgba(0, 0, 0, 0.15),
                       0 8px 24px rgba(0, 0, 0, 0.08),
                       inset 0 1px 0 rgba(255, 255, 255, 0.6),
                       inset 0 -1px 0 rgba(0, 0, 0, 0.08)`
                }}
              >
                {/* Liquid gradient overlay */}
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: isDarkMode
                      ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.1) 100%)'
                      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.05) 100%)',
                  }}
                />

                {/* Dark mode styles */}


                <div className="relative p-3 space-y-1">
                  {navLinks.map((link, index) => {
                    const isActive = pathname === link.href

                    return (
                      <MotionLink
                        key={link.href}
                        to={getHref(link.href)}
                        onClick={() => setIsMenuOpen(false)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative block"
                      >
                        <div
                          className="flex items-center justify-between px-4 py-3 rounded-2xl"
                          style={{
                            background: isActive
                              ? 'linear-gradient(135deg, rgba(70, 130, 180, 0.2) 0%, rgba(70, 130, 180, 0.1) 100%)'
                              : 'transparent',
                            backdropFilter: isActive ? 'blur(20px)' : 'none',
                            WebkitBackdropFilter: isActive ? 'blur(20px)' : 'none',
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
                          }}
                        >
                          <span className={cn(
                            "text-sm font-medium transition-colors duration-300",
                            isActive && "text-[#0077BE] dark:text-[#4A9FD8]",
                            !isActive && "text-gray-900 dark:text-gray-100"
                          )}>
                            {link.label}
                          </span>
                          <ChevronRight className={cn(
                            "w-4 h-4 transition-colors duration-300",
                            isActive && "text-[#0077BE] dark:text-[#4A9FD8]",
                            !isActive && "text-gray-400 dark:text-gray-500"
                          )} />
                        </div>
                      </MotionLink>
                    )
                  })}

                  {/* Divider */}
                  <div
                    className="h-px my-2"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(120, 120, 128, 0.3) 50%, transparent 100%)',
                    }}
                  />

                  {/* Auth Button */}
                  <AuthButton isMobile onClose={() => setIsMenuOpen(false)} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
