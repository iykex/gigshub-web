import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Get total orders count
        const ordersCount = await db.prepare(`
            SELECT COUNT(*) as total
            FROM orders
            WHERE user_id = ?
        `).bind(userId).first<{ total: number }>()

        // Get successful orders count
        const successfulOrders = await db.prepare(`
            SELECT COUNT(*) as total
            FROM orders
            WHERE user_id = ? AND status = 'success'
        `).bind(userId).first<{ total: number }>()

        // Get total amount spent
        const totalSpent = await db.prepare(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM orders
            WHERE user_id = ? AND status = 'success'
        `).bind(userId).first<{ total: number }>()

        // Get commission earned (assuming 5% commission for agents)
        const commissionEarned = await db.prepare(`
            SELECT COALESCE(SUM(amount * 0.05), 0) as total
            FROM orders
            WHERE user_id = ? AND status = 'success'
        `).bind(userId).first<{ total: number }>()

        // Get recent orders
        const { results: recentOrders } = await db.prepare(`
            SELECT 
                o.*
            FROM orders o
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
            LIMIT 5
        `).bind(userId).all()

        return NextResponse.json({
            totalOrders: ordersCount?.total || 0,
            successfulOrders: successfulOrders?.total || 0,
            totalSpent: totalSpent?.total || 0,
            commissionEarned: commissionEarned?.total || 0,
            recentOrders: recentOrders || []
        })
    } catch (error) {
        console.error('Fetch Agent Stats Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
