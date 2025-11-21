import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Type definitions for database records
interface User {
    id: string
    name: string | null
    phone: string | null
    email: string
    role: string
    wallet_balance: number
    created_at: string
}

interface UserPassword {
    user_id: string
    password_hash: string
    created_at: string
}

// Get local D1 database
function getLocalDB() {
    const dbPath = path.join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject', 'ae610cd37aebf51439f4d2f53a440c4cb6d1eb63cd18b3b251b21503c44a5c12.sqlite')
    return new Database(dbPath)
}

async function syncToRemote() {
    console.log('🔄 Syncing Local D1 to Remote...')
    console.log('================================\n')

    const db = getLocalDB()

    // Create password table on remote
    console.log('🔐 Creating password table on remote...')
    try {
        execSync(`npx wrangler d1 execute gigshub-db --remote --command "CREATE TABLE IF NOT EXISTS user_passwords (user_id TEXT PRIMARY KEY, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);"`, { stdio: 'inherit' })
    } catch (e) {
        console.error('Failed to create password table:', e)
    }

    // Get all users
    console.log('\n👥 Syncing users to remote...')
    const users = db.prepare('SELECT * FROM users').all() as User[]

    for (const user of users) {
        console.log(`  Syncing user: ${user.email}`)
        const cmd = `npx wrangler d1 execute gigshub-db --remote --command "INSERT OR REPLACE INTO users (id, name, phone, email, role, wallet_balance, created_at) VALUES ('${user.id}', ${user.name ? `'${user.name}'` : 'NULL'}, ${user.phone ? `'${user.phone}'` : 'NULL'}, '${user.email}', '${user.role}', ${user.wallet_balance}, '${user.created_at}');"`
        try {
            execSync(cmd, { stdio: 'pipe' })
        } catch (e) {
            console.error(`  Failed to sync user ${user.email}`)
        }
    }

    // Get all passwords
    console.log('\n🔐 Syncing passwords to remote...')
    try {
        const passwords = db.prepare('SELECT * FROM user_passwords').all() as UserPassword[]

        for (const pwd of passwords) {
            console.log(`  Syncing password for user: ${pwd.user_id}`)
            const cmd = `npx wrangler d1 execute gigshub-db --remote --command "INSERT OR REPLACE INTO user_passwords (user_id, password_hash, created_at) VALUES ('${pwd.user_id}', '${pwd.password_hash}', '${pwd.created_at}');"`
            try {
                execSync(cmd, { stdio: 'pipe' })
            } catch (e) {
                console.error(`  Failed to sync password for ${pwd.user_id}`)
            }
        }
    } catch (e) {
        console.error('No passwords table found locally')
    }

    db.close()

    console.log('\n✅ Sync complete!\n')
    console.log('Verify with:')
    console.log('  npx wrangler d1 execute gigshub-db --remote --command "SELECT COUNT(*) FROM users;"')
    console.log('  npx wrangler d1 execute gigshub-db --remote --command "SELECT COUNT(*) FROM user_passwords;"')
}

syncToRemote().catch(console.error)
