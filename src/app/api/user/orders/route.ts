import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const userId = searchParams.get('userId') || ''

        const offset = (page - 1) * limit

        // Build query - orders table has product_name directly
        let query = `
            SELECT 
                o.*
            FROM orders o
            WHERE 1=1
        `
        const params: any[] = []

        // Filter by user if provided
        if (userId) {
            query += ` AND o.user_id = ?`
            params.push(userId)
        }

        // Search functionality
        if (search) {
            query += ` AND (o.id LIKE ? OR o.product_name LIKE ? OR o.phone LIKE ?)`
            const searchPattern = `%${search}%`
            params.push(searchPattern, searchPattern, searchPattern)
        }

        // Get total count
        const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM')
        const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>()
        const total = countResult?.total || 0

        // Add pagination
        query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`
        params.push(limit, offset)

        const { results } = await db.prepare(query).bind(...params).all()

        return NextResponse.json({
            orders: results,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Fetch Orders Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
