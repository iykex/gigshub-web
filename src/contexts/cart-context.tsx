"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
    id: number
    provider: string
    name: string
    size: string
    price: number
    agent_price: number | null
    product_code: string
    quantity: number
    recipientPhone: string
}

interface CartContextType {
    items: CartItem[]
    addToCart: (item: Omit<CartItem, 'quantity'>) => void
    removeFromCart: (id: number, phone: string) => void
    updateQuantity: (id: number, phone: string, quantity: number) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('orders')
            return savedCart ? JSON.parse(savedCart) : []
        }
        return []
    })

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('orders', JSON.stringify(items))
    }, [items])

    const addToCart = (item: Omit<CartItem, 'quantity'>) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id && i.recipientPhone === item.recipientPhone)
            if (existingItem) {
                return prevItems.map(i =>
                    i.id === item.id && i.recipientPhone === item.recipientPhone
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                )
            }
            return [...prevItems, { ...item, quantity: 1 }]
        })
    }

    const removeFromCart = (id: number, phone: string) => {
        setItems(prevItems => prevItems.filter(item => !(item.id === id && item.recipientPhone === phone)))
    }

    const updateQuantity = (id: number, phone: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id, phone)
            return
        }
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id && item.recipientPhone === phone ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => {
        setItems([])
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => {
        const price = item.agent_price || item.price
        return sum + (price * item.quantity)
    }, 0)

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
