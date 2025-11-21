
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, User, Settings, LogOut, Wallet, ShoppingBag, ShieldCheck } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string
        title: string
        icon: React.ReactNode
    }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
    const pathname = usePathname()
    const { signOut, user } = useAuth()

    return (
        <nav
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
                className
            )}
            {...props}
        >
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                            : "text-muted-foreground"
                    )}
                >
                    {item.icon}
                    {item.title}
                </Link>
            ))}

            {user?.role === 'admin' && (
                <Link
                    href="/dashboard/admin"
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                        pathname.startsWith('/dashboard/admin')
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                            : "text-muted-foreground"
                    )}
                >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Dashboard
                </Link>
            )}

            <div className="lg:pt-4 lg:mt-4 lg:border-t lg:border-border">
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </nav>
    )
}
