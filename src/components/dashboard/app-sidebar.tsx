import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    User,
    Settings,
    LogOut,
    Wallet,
    ShoppingBag,
    ShieldCheck,
    Users,
    CreditCard,
    CheckCircle,
    Store,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Menu,
    FileText
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect, useRef } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { hasPermission, Role } from "@/lib/permissions"

const userNavItems = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Profile",
        href: "/dashboard/profile",
        icon: User,
    },
    {
        title: "Wallet",
        href: "/dashboard/wallet",
        icon: Wallet,
    },
    {
        title: "Orders",
        href: "/dashboard/orders",
        icon: ShoppingBag,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

const agentNavItems = [
    {
        title: "Overview",
        href: "/dashboard/agent",
        icon: LayoutDashboard,
    },
    {
        title: "Profile",
        href: "/dashboard/agent/profile",
        icon: User,
    },
    {
        title: "Wallet",
        href: "/dashboard/agent/wallet",
        icon: Wallet,
    },
    {
        title: "Orders",
        href: "/dashboard/agent/orders",
        icon: ShoppingBag,
    },
    {
        title: "Settings",
        href: "/dashboard/agent/settings",
        icon: Settings,
    },
]

const adminNavItems = [
    {
        title: "Overview",
        href: "/dashboard/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Users",
        href: "/dashboard/admin/users",
        icon: Users,
    },
    {
        title: "Orders",
        href: "/dashboard/admin/orders",
        icon: ShoppingBag,
    },
    {
        title: "AFA Registrations",
        href: "/dashboard/admin/afa",
        icon: FileText,
    },
    {
        title: "Topups",
        href: "/dashboard/admin/topups",
        icon: CreditCard,
    },
    {
        title: "Validations",
        href: "/dashboard/admin/validations",
        icon: CheckCircle,
    },
    {
        title: "Store",
        href: "/dashboard/admin/stores",
        icon: Store,
    },
    {
        title: "SMS",
        href: "/dashboard/admin/sms",
        icon: MessageSquare,
    },
]

export function AppSidebar() {
    const { pathname } = useLocation()
    const { signOut, user } = useAuth()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 50 }) // x: percentage from right, y: percentage from top
    const [isDragging, setIsDragging] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const dragStartPos = useRef({ x: 0, y: 0 })

    const isAdminPath = pathname.startsWith('/dashboard/admin')
    const isAgentPath = pathname.startsWith('/dashboard/agent')
    const navItems = isAdminPath ? adminNavItems : isAgentPath ? agentNavItems : userNavItems

    // Track theme changes
    useEffect(() => {
        const checkTheme = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'))
        }

        checkTheme()

        // Watch for theme changes
        const observer = new MutationObserver(checkTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        })

        return () => observer.disconnect()
    }, [])

    // Load saved position from localStorage
    useEffect(() => {
        const savedPosition = localStorage.getItem('sidebarButtonPosition')
        if (savedPosition) {
            setButtonPosition(JSON.parse(savedPosition))
        }
    }, [])

    // Auto-collapse on mobile/tablet, expand on desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(true)
            } else {
                setIsCollapsed(false)
            }
        }
        // Initial check
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Handle drag start
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true)
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
        dragStartPos.current = { x: clientX, y: clientY }
        e.preventDefault()
    }

    // Handle drag move
    useEffect(() => {
        const handleDragMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging) return

            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

            const deltaX = dragStartPos.current.x - clientX
            const deltaY = clientY - dragStartPos.current.y

            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            // Calculate new position as percentage
            const newX = Math.max(0, Math.min(100, buttonPosition.x + (deltaX / viewportWidth) * 100))
            const newY = Math.max(0, Math.min(100, buttonPosition.y + (deltaY / viewportHeight) * 100))

            setButtonPosition({ x: newX, y: newY })
            dragStartPos.current = { x: clientX, y: clientY }
        }

        const handleDragEnd = () => {
            if (isDragging) {
                setIsDragging(false)
                // Save position to localStorage
                localStorage.setItem('sidebarButtonPosition', JSON.stringify(buttonPosition))
            }
        }

        if (isDragging) {
            document.addEventListener('mousemove', handleDragMove)
            document.addEventListener('mouseup', handleDragEnd)
            document.addEventListener('touchmove', handleDragMove)
            document.addEventListener('touchend', handleDragEnd)
        }

        return () => {
            document.removeEventListener('mousemove', handleDragMove)
            document.removeEventListener('mouseup', handleDragEnd)
            document.removeEventListener('touchmove', handleDragMove)
            document.removeEventListener('touchend', handleDragEnd)
        }
    }, [isDragging, buttonPosition])

    const NavContent = ({ collapsed }: { collapsed: boolean }) => (
        <div className="flex flex-col h-full">
            <div className={cn("flex items-center h-12 mb-4", collapsed ? "justify-center" : "justify-between px-2")}>
                {!collapsed && (
                    <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        {isAdminPath ? 'Admin Panel' : isAgentPath ? 'Agent Panel' : 'Customer Panel'}
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex h-8 w-8"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <nav className="space-y-1 flex-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground group relative",
                            pathname === item.href || (item.href !== '/dashboard' && item.href !== '/dashboard/admin' && pathname.startsWith(item.href))
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                                : "text-muted-foreground",
                            collapsed && "justify-center px-2"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5 shrink-0", collapsed ? "mr-0" : "mr-0")} />
                        {!collapsed && <span>{item.title}</span>}

                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                {item.title}
                            </div>
                        )}
                    </Link>
                ))}

                {/* Admin Link for User Dashboard */}
                {!isAdminPath && hasPermission(user?.role as Role, 'access_admin_panel') && (
                    <Link
                        to="/dashboard/admin"
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground mt-6 group relative",
                            "text-muted-foreground hover:text-blue-600",
                            collapsed && "justify-center px-2"
                        )}
                    >
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>Admin Dashboard</span>}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                Admin Dashboard
                            </div>
                        )}
                    </Link>
                )}

                {/* Agent Link for User Dashboard */}
                {!isAgentPath && hasPermission(user?.role as Role, 'access_agent_panel') && (
                    <Link
                        to="/dashboard/agent"
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground mt-6 group relative",
                            "text-muted-foreground hover:text-blue-600",
                            collapsed && "justify-center px-2"
                        )}
                    >
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>Agent Dashboard</span>}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                Agent Dashboard
                            </div>
                        )}
                    </Link>
                )}

                {/* Customer Panel Link for Admin & Agent */}
                {(isAdminPath || isAgentPath) && hasPermission(user?.role as Role, 'access_customer_panel') && (
                    <Link
                        to="/dashboard"
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground mt-6 group relative",
                            "text-muted-foreground",
                            collapsed && "justify-center px-2"
                        )}
                    >
                        <ChevronLeft className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>Customer Panel</span>}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border-1 border-gray-200 shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                Customer Panel
                            </div>
                        )}
                    </Link>
                )}
            </nav>

            <div className={cn("mt-auto pt-4 border-t border-border", collapsed && "flex justify-center")}>
                <button
                    onClick={() => signOut()}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full group relative",
                        collapsed && "justify-center px-2 w-auto"
                    )}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                    {collapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-destructive text-destructive-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            Sign Out
                        </div>
                    )}
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                <div className="sticky top-24">
                    <div
                        className="rounded-2xl p-4 shadow-lg border backdrop-blur-xl transition-all duration-200"
                        style={{
                            background: isDarkMode ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            boxShadow: isDarkMode
                                ? `0 8px 32px rgba(0, 0, 0, 0.4),
                                   0 2px 8px rgba(0, 0, 0, 0.2),
                                   inset 0 1px 0 rgba(255, 255, 255, 0.1),
                                   inset 0 -1px 0 rgba(0, 0, 0, 0.2)`
                                : `0 8px 32px rgba(0, 0, 0, 0.08),
                                   0 2px 8px rgba(0, 0, 0, 0.04),
                                   inset 0 1px 0 rgba(255, 255, 255, 0.8),
                                   inset 0 -1px 0 rgba(0, 0, 0, 0.05)`
                        }}
                    >
                        <NavContent collapsed={isCollapsed} />
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Trigger - Draggable */}
            <div
                className="lg:hidden fixed z-[100] touch-none"
                style={{
                    right: `${buttonPosition.x}%`,
                    top: `${buttonPosition.y}%`,
                    transform: 'translate(50%, -50%)',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    transition: isDragging ? 'none' : 'all 0.2s ease-out'
                }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="w-[300px] sm:w-[400px] p-6 border-0 transition-all duration-200"
                        style={{
                            background: isDarkMode ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(40px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
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
                        <div className="mt-6 h-full">
                            <NavContent collapsed={false} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    )
}
