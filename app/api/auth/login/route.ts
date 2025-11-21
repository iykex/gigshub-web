import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Get the database instance (works for both local and remote)
        const db = getDB()

        if (!db) {
            throw new Error('Database connection failed')
        }

        // Find user by email
        const user = await db.prepare(
            'SELECT id, name, phone, email, role, wallet_balance, created_at FROM users WHERE email = ?'
        ).bind(email).first<any>()

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Get password hash
        const passwordRecord = await db.prepare(
            'SELECT password_hash FROM user_passwords WHERE user_id = ?'
        ).bind(user.id).first<any>()

        if (!passwordRecord) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Verify password
        const isValid = await bcrypt.compare(password, passwordRecord.password_hash)

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            success: true,
            user
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            {
                error: 'Failed to login',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
