
import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    try {
        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const { results } = await db.prepare('SELECT * FROM pricing ORDER BY provider, price').all()

        return NextResponse.json({ products: results })
    } catch (error) {
        console.error('Fetch Products Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const { id, price, agent_price, is_active } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
        }

        // Get current product for audit
        const current = await db.prepare('SELECT * FROM pricing WHERE id = ?').bind(id).first<any>()

        if (!current) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        const now = new Date().toISOString()

        // Update product
        await db.prepare(`
      UPDATE pricing 
      SET price = ?, agent_price = ?, is_active = ?, updated_at = ? 
      WHERE id = ?
    `).bind(price, agent_price, is_active ? 1 : 0, now, id).run()

        // Audit log (if price changed)
        if (current.price !== price || current.agent_price !== agent_price) {
            await db.prepare(`
        INSERT INTO pricing_audit (pricing_id, old_price, new_price, changed_by, changed_at, comment)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(id, current.price, price, 'admin', now, 'Price update via admin dashboard').run()
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Update Product Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
