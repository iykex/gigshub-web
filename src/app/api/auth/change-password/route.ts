
import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, currentPassword, newPassword } = body

        if (!email || !currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Email, current password, and new password are required' },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'New password must be at least 6 characters long' },
                { status: 400 }
            )
        }

        const db = getDB()
        if (!db) throw new Error('Database connection failed')

        // 1. Find user
        const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>()
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Get current password hash
        const passwordRecord = await db.prepare('SELECT password_hash FROM user_passwords WHERE user_id = ?').bind(user.id).first<{ password_hash: string }>()

        if (!passwordRecord) {
            return NextResponse.json({ error: 'Password not set' }, { status: 400 })
        }

        // 3. Verify current password
        const isValid = await bcrypt.compare(currentPassword, passwordRecord.password_hash)
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid current password' }, { status: 401 })
        }

        // 4. Hash new password
        const newHashedPassword = await bcrypt.hash(newPassword, 10)

        // 5. Update password
        await db.prepare('UPDATE user_passwords SET password_hash = ? WHERE user_id = ?')
            .bind(newHashedPassword, user.id).run()

        return NextResponse.json({ success: true, message: 'Password updated successfully' })

    } catch (error) {
        console.error('Change password error:', error)
        return NextResponse.json(
            { error: 'Failed to update password' },
            { status: 500 }
        )
    }
}
