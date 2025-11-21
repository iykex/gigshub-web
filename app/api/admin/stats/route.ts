
import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        // Run queries in parallel
        const [usersCount, ordersCount, revenue, pendingValidations] = await Promise.all([
            db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>(),
            db.prepare('SELECT COUNT(*) as count FROM orders').first<{ count: number }>(),
            db.prepare("SELECT SUM(amount) as total FROM orders WHERE status = 'success'").first<{ total: number }>(),
            db.prepare("SELECT COUNT(*) as count FROM agent_validations WHERE status = 'pending'").first<{ count: number }>()
        ])

        return NextResponse.json({
            totalUsers: usersCount?.count || 0,
            totalOrders: ordersCount?.count || 0,
            totalRevenue: revenue?.total || 0,
            pendingValidations: pendingValidations?.count || 0
        })

    } catch (error) {
        console.error('Admin Stats Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
