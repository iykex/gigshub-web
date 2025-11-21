
import { getDB } from '../lib/db';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

async function resetRemotePassword() {
    console.log('🔄 Resetting Remote Password...');

    const email = 'isaacantwi.pro@gmail.com';
    const newPassword = 'password123';

    try {
        // 1. Initialize Remote DB
        const db = getDB();
        if (!db) throw new Error('Could not initialize DB adapter');

        // 2. Find User
        console.log(`🔎 Finding user: ${email}...`);
        const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>();

        if (!user) {
            console.error('❌ User not found on remote DB!');
            return;
        }
        console.log(`✅ Found user ID: ${user.id}`);

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log(`🔑 Generated new hash: ${hashedPassword}`);

        // 4. Update Password on Remote
        console.log('fw Writing to remote database...');
        const now = new Date().toISOString();

        // We use a transaction-like approach: delete old, insert new to be safe
        // Or just INSERT OR REPLACE if supported, but let's use standard SQL

        // Check if password record exists
        const existing = await db.prepare('SELECT user_id FROM user_passwords WHERE user_id = ?').bind(user.id).first();

        if (existing) {
            await db.prepare('UPDATE user_passwords SET password_hash = ? WHERE user_id = ?')
                .bind(hashedPassword, user.id).run();
            console.log('✅ Updated existing password record');
        } else {
            await db.prepare('INSERT INTO user_passwords (user_id, password_hash, created_at) VALUES (?, ?, ?)')
                .bind(user.id, hashedPassword, now).run();
            console.log('✅ Created new password record');
        }

        console.log('✨ Password reset successfully!');

    } catch (error) {
        console.error('❌ Failed to reset password:', error);
    }
}

resetRemotePassword();
