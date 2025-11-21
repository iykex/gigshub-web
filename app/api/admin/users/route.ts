
import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = (page - 1) * limit

        const users = await db.prepare('SELECT id, name, email, phone, role, wallet_balance, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?')
            .bind(limit, offset)
            .all()

        const total = await db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>()

        return NextResponse.json({
            users: users.results,
            pagination: {
                page,
                limit,
                total: total?.count || 0,
                totalPages: Math.ceil((total?.count || 0) / limit)
            }
        })

    } catch (error) {
        console.error('Admin Users Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
