import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function GET(request: NextRequest) {
    console.log('Wallet API called')
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        console.log('UserId:', userId)

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const user = await db.prepare('SELECT wallet_balance FROM users WHERE id = ?').bind(userId).first<{ wallet_balance: number }>()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const transactions = await db.prepare('SELECT * FROM wallet_ledger WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').bind(userId).all()

        return NextResponse.json({
            balance: user.wallet_balance,
            transactions: transactions.results
        })

    } catch (error: any) {
        console.error('Wallet API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, amount, type } = body

        if (!userId || !amount || type !== 'topup') {
            return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const user = await db.prepare('SELECT wallet_balance FROM users WHERE id = ?').bind(userId).first<{ wallet_balance: number }>()
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const topupAmount = parseFloat(amount)
        const newBalance = (user.wallet_balance || 0) + topupAmount

        // Update user balance
        await db.prepare('UPDATE users SET wallet_balance = ? WHERE id = ?')
            .bind(newBalance, userId)
            .run()

        // Create ledger entry
        await db.prepare('INSERT INTO wallet_ledger (user_id, change, balance_after, type, reference) VALUES (?, ?, ?, ?, ?)')
            .bind(userId, topupAmount, newBalance, 'topup', `TOPUP-${Date.now()}`)
            .run()

        return NextResponse.json({ success: true, newBalance })

    } catch (error: any) {
        console.error('Wallet Topup Error:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
