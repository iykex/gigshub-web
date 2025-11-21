"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  role: "admin" | "agent" | "user" | "guest"
  name?: string
  phone?: string
  wallet_balance?: number
  created_at?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, username?: string, phone?: string) => Promise<void>
  signOut: () => Promise<void>
  sendPasswordResetEmail: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await response.json()
    const userData = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      name: data.user.name,
      phone: data.user.phone,
      wallet_balance: data.user.wallet_balance,
      created_at: data.user.created_at
    }

    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const signup = async (email: string, password: string, username?: string, phone?: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username, phone })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Signup failed')
    }

    const data = await response.json()
    const userData = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      name: data.user.name,
      phone: data.user.phone,
      wallet_balance: data.user.wallet_balance,
      created_at: data.user.created_at
    }

    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const sendPasswordResetEmail = async (email: string) => {
    // TODO: Implement password reset
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
