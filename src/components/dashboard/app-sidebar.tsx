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
    Menu
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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

    const isAdminPath = pathname.startsWith('/dashboard/admin')
    const isAgentPath = pathname.startsWith('/dashboard/agent')
    const navItems = isAdminPath ? adminNavItems : isAgentPath ? agentNavItems : userNavItems

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

    const NavContent = ({ collapsed }: { collapsed: boolean }) => (
        <div className="flex flex-col h-full">
            <div className={cn("flex items-center h-12 mb-4", collapsed ? "justify-center" : "justify-between px-2")}>
                {!collapsed && (
                    <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        {isAdminPath ? 'Admin Panel' : isAgentPath ? 'Agent Panel' : 'Menu'}
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
                {!isAdminPath && user?.role === 'admin' && (
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

                {/* Back to User Dashboard for Admin */}
                {isAdminPath && (
                    <Link
                        to="/dashboard"
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground mt-6 group relative",
                            "text-muted-foreground",
                            collapsed && "justify-center px-2"
                        )}
                    >
                        <ChevronLeft className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>Back to Dashboard</span>}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border-1 border-gray-200 shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                Back to Dashboard
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
                    <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-4 shadow-sm">
                        <NavContent collapsed={isCollapsed} />
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Trigger */}
            <div className="lg:hidden fixed top-1/2 right-4 -translate-y-1/2 z-[100]">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px] p-6">
                        <div className="mt-6 h-full">
                            <NavContent collapsed={false} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    )
}
