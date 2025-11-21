"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Lock, Bell, Shield, Moon, Sun, Check } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

export default function AgentSettingsPage() {
    const { toast } = useToast()
    const { theme, setTheme } = useTheme()
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [orderNotifications, setOrderNotifications] = useState(true)

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match.",
                variant: "destructive"
            })
            return
        }

        if (newPassword.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters long.",
                variant: "destructive"
            })
            return
        }

        setIsChangingPassword(true)
        try {
            // TODO: Implement password change API
            await new Promise(resolve => setTimeout(resolve, 1000))

            toast({
                title: "Success",
                description: "Password changed successfully.",
            })

            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to change password. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsChangingPassword(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Security Settings */}
                <GlassCard className="p-6 bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-200/30 dark:border-red-800/30">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-red-500/10">
                            <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Security</h2>
                            <p className="text-sm text-muted-foreground">Update your password</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="bg-background/50"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="bg-background/50"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="bg-background/50"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isChangingPassword}
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            {isChangingPassword ? "Changing..." : "Change Password"}
                        </Button>
                    </form>
                </GlassCard>

                {/* Appearance */}
                <GlassCard className="p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-200/30 dark:border-purple-800/30">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            {theme === 'dark' ?
                                <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" /> :
                                <Sun className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            }
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Appearance</h2>
                            <p className="text-sm text-muted-foreground">Customize your theme</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label className="mb-3 block">Theme Preference</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTheme('light')}
                                    className={`p-4 rounded-lg border-2 transition-all ${theme === 'light'
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-border hover:border-purple-500/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <Sun className="h-5 w-5" />
                                        {theme === 'light' && <Check className="h-4 w-4 text-purple-600" />}
                                    </div>
                                    <p className="font-medium text-sm">Light</p>
                                    <p className="text-xs text-muted-foreground">Bright theme</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTheme('dark')}
                                    className={`p-4 rounded-lg border-2 transition-all ${theme === 'dark'
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-border hover:border-purple-500/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <Moon className="h-5 w-5" />
                                        {theme === 'dark' && <Check className="h-4 w-4 text-purple-600" />}
                                    </div>
                                    <p className="font-medium text-sm">Dark</p>
                                    <p className="text-xs text-muted-foreground">Dark theme</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Notifications */}
            <GlassCard className="p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-200/30 dark:border-blue-800/30">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                        <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Notifications</h2>
                        <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                        <div className="flex-1">
                            <Label htmlFor="email-notifications" className="text-base font-medium cursor-pointer">
                                Email Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
                        </div>
                        <Switch
                            id="email-notifications"
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                        <div className="flex-1">
                            <Label htmlFor="order-notifications" className="text-base font-medium cursor-pointer">
                                Order Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">Get notified when order status changes</p>
                        </div>
                        <Switch
                            id="order-notifications"
                            checked={orderNotifications}
                            onCheckedChange={setOrderNotifications}
                        />
                    </div>
                </div>
            </GlassCard>

            {/* Account Information */}
            <GlassCard className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-200/30 dark:border-green-800/30">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-green-500/10">
                        <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Account Information</h2>
                        <p className="text-sm text-muted-foreground">Your account details</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Account Type</p>
                        <p className="text-lg font-semibold">Agent Account</p>
                    </div>

                    <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <p className="text-lg font-semibold text-green-600 dark:text-green-400">Active</p>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}
