import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, name, phone } = body

        if (!userId || !name) {
            return NextResponse.json({ error: 'User ID and name are required' }, { status: 400 })
        }

        const db = getDB()
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        // Update user profile
        await db.prepare(`
            UPDATE users 
            SET name = ?, phone = ?
            WHERE id = ?
        `).bind(name, phone || null, userId).run()

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully'
        })
    } catch (error) {
        console.error('Update Profile Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
