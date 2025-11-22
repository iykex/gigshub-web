import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const body = await request.json()
        const { userId, action, role } = body

        if (!userId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (action === 'update_role') {
            if (!role || !['guest', 'user', 'agent', 'admin'].includes(role)) {
                return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
            }

            await db.prepare('UPDATE users SET role = ? WHERE id = ?')
                .bind(role, userId)
                .run()

            return NextResponse.json({ success: true, message: 'User role updated successfully' })
        }

        // Placeholder for ban functionality if schema supported it
        if (action === 'ban') {
            return NextResponse.json({ error: 'Ban functionality not implemented yet' }, { status: 501 })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error: any) {
        console.error('Admin User Action Error:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
