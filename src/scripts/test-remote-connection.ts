
import { getDB } from '../lib/db';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function testRemoteConnection() {
    console.log('🔄 Testing connection to Remote D1 Database...');
    console.log(`   Account ID: ${process.env.CLOUDFLARE_ACCOUNT_ID?.substring(0, 5)}...`);
    console.log(`   Database ID: ${process.env.CLOUDFLARE_DATABASE_ID}`);

    try {
        const db = getDB();

        if (!db) {
            console.error('❌ Failed to initialize DB adapter');
            return;
        }

        console.log('✅ DB Adapter initialized');

        // Test query
        const startTime = Date.now();
        const result = await db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
        const duration = Date.now() - startTime;

        console.log('✅ Query executed successfully!');
        console.log(`   User Count: ${result?.count}`);
        console.log(`   Latency: ${duration}ms`);

    } catch (error) {
        console.error('❌ Connection failed:', error);
    }
}

testRemoteConnection();
