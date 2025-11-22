
import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''
        const offset = (page - 1) * limit

        let query = `
      SELECT 
        o.*, 
        u.name as user_name, 
        u.email as user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
    `
        let countQuery = 'SELECT COUNT(*) as count FROM orders o LEFT JOIN users u ON o.user_id = u.id'
        const params: any[] = []

        if (search) {
            const searchCondition = ` WHERE o.id LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR o.product_name LIKE ?`
            query += searchCondition
            countQuery += searchCondition
            const searchParam = `%${search}%`
            params.push(searchParam, searchParam, searchParam, searchParam)
        }

        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?'
        params.push(limit, offset)

        const orders = await db.prepare(query)
            .bind(...params)
            .all()

        // For count, we need to bind search params only
        const countParams = search ? [params[0], params[1], params[2], params[3]] : []
        const total = await db.prepare(countQuery).bind(...countParams).first<{ count: number }>()

        return NextResponse.json({
            orders: orders.results,
            pagination: {
                page,
                limit,
                total: total?.count || 0,
                totalPages: Math.ceil((total?.count || 0) / limit)
            }
        })

    } catch (error) {
        console.error('Admin Orders Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
