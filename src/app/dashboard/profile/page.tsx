import { useAuth } from "@/contexts/auth-context"
import { GlassCard } from "@/components/ui/glass-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Shield, Calendar, CreditCard } from "lucide-react"

export default function ProfilePage() {
    const { user } = useAuth()

    if (!user) return null

    // Format date
    const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'N/A'

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    View and manage your personal information.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Main Profile Card */}
                <GlassCard className="md:col-span-2">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                            <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center md:text-left space-y-1 flex-1">
                            <h2 className="text-2xl font-bold">{user.name || 'User'}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300 capitalize">
                                    {user.role}
                                </span>
                                <span className="text-xs text-muted-foreground">Member since {joinDate}</span>
                            </div>
                        </div>
                        <Button variant="outline">Edit Profile</Button>
                    </div>
                </GlassCard>

                {/* Personal Info */}
                <GlassCard hoverEffect={false}>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        Personal Information
                    </h4>
                    <div className="space-y-4">
                        <div className="grid gap-1">
                            <span className="text-xs font-medium text-muted-foreground">Full Name</span>
                            <span className="text-sm">{user.name || 'Not set'}</span>
                        </div>
                        <Separator />
                        <div className="grid gap-1">
                            <span className="text-xs font-medium text-muted-foreground">Email Address</span>
                            <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm">{user.email}</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid gap-1">
                            <span className="text-xs font-medium text-muted-foreground">Phone Number</span>
                            <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm">{user.phone || 'Not set'}</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Account Info */}
                <GlassCard hoverEffect={false}>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-500" />
                        Account Details
                    </h4>
                    <div className="space-y-4">
                        <div className="grid gap-1">
                            <span className="text-xs font-medium text-muted-foreground">User ID</span>
                            <code className="text-xs bg-muted p-1 rounded">{user.id}</code>
                        </div>
                        <Separator />
                        <div className="grid gap-1">
                            <span className="text-xs font-medium text-muted-foreground">Account Type</span>
                            <div className="flex items-center gap-2">
                                <Shield className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm capitalize">{user.role}</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid gap-1">
                            <span className="text-xs font-medium text-muted-foreground">Wallet Balance</span>
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                    GHS {user.wallet_balance?.toFixed(2) || '0.00'}
                                </span>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
