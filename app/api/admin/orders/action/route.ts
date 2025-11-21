import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const body = await request.json()
        const { orderId, status } = body

        if (!orderId || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const validStatuses = ['pending', 'processing', 'success', 'failed', 'refunded']
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        await db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind(status, orderId)
            .run()

        return NextResponse.json({ success: true, message: 'Order status updated successfully' })

    } catch (error: any) {
        console.error('Admin Order Action Error:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
