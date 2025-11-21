
"use client"

import { ChangePasswordForm } from "@/components/auth/change-password-form"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6">
                <div className="grid gap-2">
                    <h4 className="text-base font-medium">Security</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                        Manage your password and account security.
                    </p>
                    <ChangePasswordForm />
                </div>
            </div>
        </div>
    )
}
