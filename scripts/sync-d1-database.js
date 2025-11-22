#!/usr/bin/env node

/**
 * Comprehensive D1 Database Sync Script
 * Syncs pricing data, creates tables, and ensures database is ready
 * 
 * Usage: node scripts/sync-d1-database.js
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

if (!ACCOUNT_ID || !DATABASE_ID || !API_TOKEN) {
    console.error('❌ Missing environment variables!')
    console.error('Required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN')
    console.error('\nYou can find these in your .env file or wrangler.toml')
    process.exit(1)
}

async function executeQuery(sql, params = []) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sql: sql,
            params: params
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`API request failed: ${response.status} - ${error}`)
    }

    return await response.json()
}

async function ensurePricingTable() {
    console.log('📋 Ensuring pricing table exists...')

    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS pricing (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider TEXT NOT NULL,
            name TEXT NOT NULL,
            size TEXT,
            price REAL NOT NULL,
            agent_price REAL,
            product_code TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `

    await executeQuery(createTableSQL)
    console.log('✅ Pricing table ready')
}

async function ensureAfaRegistrationsTable() {
    console.log('📋 Ensuring afa_registrations table exists...')

    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS afa_registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            town TEXT NOT NULL,
            occupation TEXT NOT NULL,
            id_number TEXT NOT NULL,
            id_type TEXT NOT NULL,
            package_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            payment_reference TEXT,
            payment_status TEXT DEFAULT 'pending',
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `

    await executeQuery(createTableSQL)
    console.log('✅ AFA registrations table ready')
}

async function addAfaPackage() {
    console.log('\n🔍 Checking for AFA package...')

    // Check if AFA package exists
    const checkResult = await executeQuery(
        "SELECT * FROM pricing WHERE provider = 'AFA'"
    )

    if (checkResult.result[0].results.length > 0) {
        console.log('✅ AFA package already exists:')
        const pkg = checkResult.result[0].results[0]
        console.log(`   Name: ${pkg.name}`)
        console.log(`   Price: GHS ${pkg.price}`)
        console.log(`   Status: ${pkg.is_active ? 'Active' : 'Inactive'}`)
        return
    }

    console.log('➕ Adding AFA package...')

    await executeQuery(
        `INSERT INTO pricing (provider, name, size, price, agent_price, product_code, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['AFA', 'AFA SIM Registration', 'Standard', 5.00, 4.50, 'AFA-REG-001', 1]
    )

    console.log('✅ AFA package added successfully!')
    console.log('   Provider: AFA')
    console.log('   Name: AFA SIM Registration')
    console.log('   Price: GHS 5.00')
    console.log('   Agent Price: GHS 4.50')
}

async function showDatabaseStats() {
    console.log('\n📊 Database Statistics:')

    // Count pricing entries
    const pricingCount = await executeQuery('SELECT COUNT(*) as count FROM pricing')
    console.log(`   Pricing entries: ${pricingCount.result[0].results[0].count}`)

    // Count AFA registrations
    try {
        const afaCount = await executeQuery('SELECT COUNT(*) as count FROM afa_registrations')
        console.log(`   AFA registrations: ${afaCount.result[0].results[0].count}`)
    } catch (e) {
        console.log('   AFA registrations: 0 (table not yet created)')
    }

    // Show all pricing providers
    const providers = await executeQuery('SELECT DISTINCT provider FROM pricing')
    console.log(`   Providers: ${providers.result[0].results.map(p => p.provider).join(', ')}`)
}

async function main() {
    console.log('🚀 Starting D1 Database Sync...\n')

    try {
        // Ensure tables exist
        await ensurePricingTable()
        await ensureAfaRegistrationsTable()

        // Add AFA package if needed
        await addAfaPackage()

        // Show stats
        await showDatabaseStats()

        console.log('\n✅ Database sync completed successfully!')
        console.log('\n💡 Next steps:')
        console.log('   1. Visit http://localhost:5173/stores/afa-registration')
        console.log('   2. The AFA registration fee should now display')
        console.log('   3. You can update pricing at /dashboard/admin/stores')

    } catch (error) {
        console.error('\n❌ Error:', error.message)
        process.exit(1)
    }
}

// Run the script
main()
