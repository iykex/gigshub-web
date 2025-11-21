
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

            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <h4 className="text-base font-medium">Security</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                        Manage your password and account security.
                    </p>
                    <ChangePasswordForm />
                </div>

                <div className="grid gap-2">
                    <h4 className="text-base font-medium text-red-600 dark:text-red-400">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                        Irreversible account actions.
                    </p>
                    <div className="border border-red-200 dark:border-red-900/50 rounded-xl p-6 bg-red-50/50 dark:bg-red-900/10">
                        <h5 className="font-semibold text-red-900 dark:text-red-200 mb-2">Delete Account</h5>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                            Request to permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <button
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                            onClick={() => alert("Account deletion request sent to admin.")}
                        >
                            Request Deletion
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
