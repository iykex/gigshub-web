import { getDB } from '../lib/db';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const KEEP_EMAILS = [
    'isaacantwi.pro@gmail.com',
    'iyke.earth@gmail.com',
    'fsamuel7152@gmail.com',
    'godtechprime@gmail.com'
];

async function cleanupUsers() {
    console.log('🧹 Starting User Cleanup...');

    const db = getDB();
    if (!db) {
        console.error('❌ Could not initialize DB adapter. Check environment variables.');
        process.exit(1);
    }

    try {
        // 1. Get all users
        console.log('👥 Fetching all users...');
        const users = await db.prepare('SELECT id, email, name FROM users').all<{ id: string, email: string, name: string }>();

        if (!users.results || users.results.length === 0) {
            console.log('   No users found.');
            return;
        }

        console.log(`   Found ${users.results.length} users.`);

        // 2. Identify users to delete
        const usersToDelete = users.results.filter(user => !KEEP_EMAILS.includes(user.email));

        if (usersToDelete.length === 0) {
            console.log('   No users to delete. All users are in the keep list.');
            return;
        }

        console.log(`   Found ${usersToDelete.length} users to delete.`);

        // 3. Delete users and related data
        for (const user of usersToDelete) {
            console.log(`   🗑️ Deleting user: ${user.email} (${user.id})...`);

            // Delete from related tables first (though CASCADE should handle some, we'll be explicit where needed or if CASCADE isn't reliable in D1/SQLite setup)
            // Note: user_passwords has ON DELETE CASCADE in schema, but let's be safe.
            // Other tables like orders, wallet_ledger, topup_requests, agent_validations reference user_id.
            // We should probably delete those records too to maintain referential integrity if CASCADE isn't set up for them.

            // Check schema for CASCADE:
            // user_passwords: ON DELETE CASCADE - OK
            // topup_requests: FOREIGN KEY (user_id) REFERENCES users(id) - No CASCADE specified in schema.sql provided earlier? 
            // Actually, let's check the schema file content I read.
            // topup_requests: FOREIGN KEY (user_id) REFERENCES users(id)
            // agent_validations: FOREIGN KEY (user_id) REFERENCES users(id)
            // orders: No FK constraint in CREATE TABLE, just an index.
            // wallet_ledger: No FK constraint in CREATE TABLE.

            // So we must manually delete related records for tables without CASCADE.

            await db.prepare('DELETE FROM user_passwords WHERE user_id = ?').bind(user.id).run();
            await db.prepare('DELETE FROM topup_requests WHERE user_id = ?').bind(user.id).run();
            await db.prepare('DELETE FROM agent_validations WHERE user_id = ?').bind(user.id).run();
            await db.prepare('DELETE FROM orders WHERE user_id = ?').bind(user.id).run();
            await db.prepare('DELETE FROM wallet_ledger WHERE user_id = ?').bind(user.id).run();

            // Finally delete the user
            await db.prepare('DELETE FROM users WHERE id = ?').bind(user.id).run();

            console.log(`      ✅ Deleted ${user.email}`);
        }

        console.log('✨ Cleanup completed successfully!');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
}

cleanupUsers();