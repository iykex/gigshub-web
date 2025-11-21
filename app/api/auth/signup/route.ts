import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Generate a simple UUID
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, username, phone, role = 'user' } = body

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Validate password strength
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            )
        }

        // Get the database instance
        const db = getDB()

        if (!db) {
            throw new Error('Database connection failed')
        }

        // Check if user already exists
        const existingUser = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            )
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user
        const userId = generateId()
        const now = new Date().toISOString()

        await db.prepare(
            `INSERT INTO users (id, name, phone, email, role, wallet_balance, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            userId,
            username || null,
            phone || null,
            email,
            role,
            0,
            now
        ).run()

        // Store password hash in a separate table
        try {
            // Create table if not exists (this should ideally be in migration, but keeping for safety)
            await db.prepare(
                `CREATE TABLE IF NOT EXISTS user_passwords (
          user_id TEXT PRIMARY KEY,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL
        )`
            ).run()

            await db.prepare(
                `INSERT INTO user_passwords (user_id, password_hash, created_at)
         VALUES (?, ?, ?)`
            ).bind(userId, hashedPassword, now).run()
        } catch (e) {
            console.error('Password storage error:', e)
            // We might want to rollback user creation here in a real app
        }

        // Return success (don't send password back)
        return NextResponse.json({
            success: true,
            user: {
                id: userId,
                email,
                name: username,
                phone,
                role,
                wallet_balance: 0,
                created_at: now
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            {
                error: 'Failed to create user',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
