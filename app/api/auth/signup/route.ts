import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'
import bcrypt from 'bcryptjs'

// Generate a simple UUID
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get local D1 database for development
function getLocalDB() {
    const dbPath = path.join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject', 'ae610cd37aebf51439f4d2f53a440c4cb6d1eb63cd18b3b251b21503c44a5c12.sqlite')
    return new Database(dbPath)
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

        // Get the local database
        const db = getLocalDB()

        // Check if user already exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)

        if (existingUser) {
            db.close()
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

        db.prepare(
            `INSERT INTO users (id, name, phone, email, role, wallet_balance, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(
            userId,
            username || null,
            phone || null,
            email,
            role,
            0,
            now
        )

        // Store password hash in a separate table
        try {
            db.prepare(
                `CREATE TABLE IF NOT EXISTS user_passwords (
          user_id TEXT PRIMARY KEY,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL
        )`
            ).run()

            db.prepare(
                `INSERT INTO user_passwords (user_id, password_hash, created_at)
         VALUES (?, ?, ?)`
            ).run(userId, hashedPassword, now)
        } catch (e) {
            console.error('Password storage error:', e)
        }

        db.close()

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
