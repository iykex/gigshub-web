
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

        // 1. Get the topup request
        const topup = await db.prepare('SELECT * FROM topup_requests WHERE id = ?').bind(id).first<any>()

        if (!topup) {
            return NextResponse.json({ error: 'Topup request not found' }, { status: 404 })
        }

        if (topup.status !== 'pending') {
            return NextResponse.json({ error: 'Topup request already processed' }, { status: 400 })
        }

        const now = new Date().toISOString()
        const newStatus = action === 'approve' ? 'approved' : 'rejected'

        if (action === 'approve') {
            // Transaction-like sequence (D1 remote doesn't support true transactions easily yet)

            // 1. Update Topup Status
            await db.prepare('UPDATE topup_requests SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?')
                .bind(newStatus, adminNote || 'Approved by admin', now, id)
                .run()

            // 2. Update User Balance
            await db.prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?')
                .bind(topup.amount, topup.user_id)
                .run()

            // 3. Add Ledger Entry
            // Get new balance
            const user = await db.prepare('SELECT wallet_balance FROM users WHERE id = ?').bind(topup.user_id).first<{ wallet_balance: number }>()

            await db.prepare('INSERT INTO wallet_ledger (user_id, change, balance_after, type, reference, created_at) VALUES (?, ?, ?, ?, ?, ?)')
                .bind(topup.user_id, topup.amount, user?.wallet_balance || 0, 'topup', topup.reference, now)
                .run()

        } else {
            // Just update status
            await db.prepare('UPDATE topup_requests SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?')
                .bind(newStatus, adminNote || 'Rejected by admin', now, id)
                .run()
        }

        return NextResponse.json({ success: true, status: newStatus })

    } catch (error) {
        console.error('Topup Action Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
