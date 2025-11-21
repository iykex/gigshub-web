import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'
import bcrypt from 'bcryptjs'

// Get local D1 database for development
function getLocalDB() {
    const dbPath = path.join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject', 'ae610cd37aebf51439f4d2f53a440c4cb6d1eb63cd18b3b251b21503c44a5c12.sqlite')
    return new Database(dbPath)
}

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

        // Get the local database
        const db = getLocalDB()

        // Find user by email
        const user: any = db.prepare(
            'SELECT id, name, phone, email, role, wallet_balance, created_at FROM users WHERE email = ?'
        ).get(email)

        if (!user) {
            db.close()
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Get password hash
        const passwordRecord: any = db.prepare(
            'SELECT password_hash FROM user_passwords WHERE user_id = ?'
        ).get(user.id)

        db.close()

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
