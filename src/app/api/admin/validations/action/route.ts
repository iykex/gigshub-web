
import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const { id, action, adminNote } = await request.json()

        if (!id || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
        }

        // 1. Get the validation request
        const validation = await db.prepare('SELECT * FROM agent_validations WHERE id = ?').bind(id).first<any>()

        if (!validation) {
            return NextResponse.json({ error: 'Validation request not found' }, { status: 404 })
        }

        if (validation.status !== 'pending') {
            return NextResponse.json({ error: 'Validation request already processed' }, { status: 400 })
        }

        const now = new Date().toISOString()
        const newStatus = action === 'approve' ? 'approved' : 'rejected'

        if (action === 'approve') {
            // 1. Update Validation Status
            await db.prepare('UPDATE agent_validations SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?')
                .bind(newStatus, adminNote || 'Approved by admin', now, id)
                .run()

            // 2. Update User Role to Agent
            await db.prepare("UPDATE users SET role = 'agent' WHERE id = ?")
                .bind(validation.user_id)
                .run()

        } else {
            // Just update status
            await db.prepare('UPDATE agent_validations SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?')
                .bind(newStatus, adminNote || 'Rejected by admin', now, id)
                .run()
        }

        return NextResponse.json({ success: true, status: newStatus })

    } catch (error) {
        console.error('Validation Action Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
