
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject', 'ae610cd37aebf51439f4d2f53a440c4cb6d1eb63cd18b3b251b21503c44a5c12.sqlite');
const db = new Database(dbPath);

async function fixDatabase() {
    console.log('🔧 Fixing local database...');

    // 1. Create user_passwords table
    db.exec(`
    CREATE TABLE IF NOT EXISTS user_passwords (
      user_id TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
    console.log('✅ Created user_passwords table');

    // 2. Get the user
    const email = 'isaacantwi.pro@gmail.com';
    const user: any = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (!user) {
        console.error(`❌ User ${email} not found! Please signup locally first.`);
        return;
    }
    console.log(`👤 Found user: ${email} (ID: ${user.id})`);

    // 3. Create a password hash (using 'password123' as default, change if needed)
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    // 4. Insert or Update password
    db.prepare(`
    INSERT OR REPLACE INTO user_passwords (user_id, password_hash, created_at)
    VALUES (?, ?, ?)
  `).run(user.id, hashedPassword, now);

    console.log(`🔐 Password set to '${password}' for user ${email}`);
    console.log('✨ Database fix complete!');
}

fixDatabase().catch(console.error);
