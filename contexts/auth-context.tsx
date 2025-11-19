"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  role: "admin" | "agent" | "customer"
  name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email?: string, password?: string) => Promise<void>
  signup: (email?: string, password?: string, username?: string) => Promise<void>
  signOut: () => Promise<void>
  sendPasswordResetEmail: (email?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock loading user session
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const login = async (email?: string, password?: string) => {
    // Mock sign in
    console.log("Logging in with", email, password)
    setUser({ id: "1", email: "user@example.com", role: "customer" })
  }

  const signup = async (email?: string, password?: string, username?: string) => {
    // Mock sign up
    console.log("Signing up with", email, password, username)
    setUser({ id: "1", email: "user@example.com", role: "customer" })
  }

  const signOut = async () => {
    setUser(null)
  }

  const sendPasswordResetEmail = async (email?: string) => {
    // Mock sending email
    console.log("Sending password reset email to", email)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, signOut, sendPasswordResetEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
