"use client"

import { useAuth } from "@/contexts/auth-context"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Calendar, Shield, Edit2, Save, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function AgentProfilePage() {
    const { user, updateUser } = useAuth()
    const { toast } = useToast()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || ''
    })

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    name: formData.name,
                    phone: formData.phone
                })
            })

            if (!response.ok) {
                throw new Error('Failed to update profile')
            }

            // Update auth context
            updateUser({ name: formData.name, phone: formData.phone })

            toast({
                title: "Success",
                description: "Profile updated successfully",
            })
            setIsEditing(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            phone: user?.phone || ''
        })
        setIsEditing(false)
    }

    // Format the created_at date properly
    const formatMemberSince = (dateString: string | undefined) => {
        if (!dateString) return 'N/A'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return 'N/A'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Agent Profile</h1>
                    <p className="text-muted-foreground">View and manage your agent account information</p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Profile Information */}
            <GlassCard className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-sm text-muted-foreground capitalize">{user.role} Account</p>
                    </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                value={isEditing ? formData.name : user.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted/50" : ""}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={user.email || ''}
                                disabled
                                className="bg-muted/50"
                            />
                            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                value={isEditing ? formData.phone : user.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted/50" : ""}
                                placeholder="Enter phone number"
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Account Type
                            </Label>
                            <Input
                                id="role"
                                value={user.role?.toUpperCase() || 'USER'}
                                disabled
                                className="bg-muted/50 capitalize"
                            />
                        </div>

                        {/* Created At */}
                        <div className="space-y-2">
                            <Label htmlFor="created" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Member Since
                            </Label>
                            <Input
                                id="created"
                                value={formatMemberSince(user.created_at)}
                                disabled
                                className="bg-muted/50"
                            />
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Agent Benefits */}
            <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Agent Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-medium">Discounted Pricing</h4>
                            <p className="text-sm text-muted-foreground">Access special agent pricing on all products</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="p-2 rounded-lg bg-green-500/20">
                            <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h4 className="font-medium">Bulk Orders</h4>
                            <p className="text-sm text-muted-foreground">Process multiple orders for your customers</p>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    )
}
