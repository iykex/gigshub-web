
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/lib/toast"
import { useAuth } from "@/contexts/auth-context"
import { Lock } from "lucide-react"

interface ErrorResponse {
    error: string
}

export function ChangePasswordForm() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.newPassword !== formData.confirmPassword) {
            toast({ title: "New passwords do not match", variant: "destructive" })
            return
        }

        if (formData.newPassword.length < 6) {
            toast({ title: "Password must be at least 6 characters", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            })

            if (!response.ok) {
                const error = await response.json() as ErrorResponse
                throw new Error(error.error || 'Failed to update password')
            }

            toast({ title: "Password updated successfully!" })
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Something went wrong",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    <CardTitle>Change Password</CardTitle>
                </div>
                <CardDescription>Update your account password securely</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <PasswordInput
                            id="currentPassword"
                            required
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <PasswordInput
                            id="newPassword"
                            required
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <PasswordInput
                            id="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Password"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
