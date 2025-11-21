
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

        const validations = await db.prepare(`
      SELECT 
        v.*, 
        u.name as user_name, 
        u.email as user_email,
        u.phone as user_phone
      FROM agent_validations v 
      LEFT JOIN users u ON v.user_id = u.id 
      ORDER BY v.created_at DESC 
      LIMIT ? OFFSET ?
    `)
            .bind(limit, offset)
            .all()

        const total = await db.prepare('SELECT COUNT(*) as count FROM agent_validations').first<{ count: number }>()

        return NextResponse.json({
            validations: validations.results,
            pagination: {
                page,
                limit,
                total: total?.count || 0,
                totalPages: Math.ceil((total?.count || 0) / limit)
            }
        })

    } catch (error) {
        console.error('Admin Validations Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
