"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { ChangePasswordForm } from "@/components/auth/change-password-form"

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name || user?.email}</p>
        </div>
        <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
      </div>

      <div className="grid gap-6">
        <ChangePasswordForm />
      </div>
    </div>
  )
}