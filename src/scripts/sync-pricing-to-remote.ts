/**
 * Script to clean up and sync pricing data to remote D1 database
 * This will:
 * 1. Delete all existing pricing data from remote D1
 * 2. Insert fresh pricing data from seed_pricing.sql
 */

import 'dotenv/config'
import { readFileSync } from 'fs'
import { join } from 'path'

// Define interfaces for Cloudflare D1 API response
interface D1QueryResult<T = any> {
    results: T[]
    success: boolean
    meta?: {
        duration?: number
        rows_read?: number
        rows_written?: number
    }
}

interface D1Response<T = any> {
    result: D1QueryResult<T>[]
    success: boolean
    errors: any[]
    messages: any[]
}

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_DATABASE_ID || !CLOUDFLARE_API_TOKEN) {
    console.error('❌ Missing required environment variables:')
    console.error('   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN')
    process.exit(1)
}

const D1_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_DATABASE_ID}/query`

async function executeQuery<T = any>(sql: string): Promise<D1Response<T>> {
    const response = await fetch(D1_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Query failed: ${error}`)
    }

    return response.json() as Promise<D1Response<T>>
}

async function main() {
    console.log('🧹 Cleaning up pricing data from remote D1...')

    try {
        // Step 1: Delete all existing pricing data
        console.log('   Deleting existing pricing data...')
        await executeQuery('DELETE FROM pricing')
        console.log('   ✅ Existing pricing data deleted')

        // Step 2: Read seed pricing SQL file
        console.log('\n📦 Reading seed pricing data...')
        const seedFilePath = join(process.cwd(), 'scripts', 'seed_pricing.sql')
        const seedSQL = readFileSync(seedFilePath, 'utf-8')

        // Remove comments and split by semicolons
        const cleanSQL = seedSQL
            .split('\n')
            .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
            .join('\n')

        // Step 3: Execute each INSERT statement
        console.log('   Inserting fresh pricing data...')
        const statements = cleanSQL.split(';').filter(s => s.trim().length > 0)

        let totalInserted = 0
        for (const statement of statements) {
            const trimmed = statement.trim()
            if (trimmed.startsWith('INSERT')) {
                await executeQuery(trimmed + ';')
                totalInserted++
                console.log(`   ✓ Inserted batch ${totalInserted}`)
            }
        }

        console.log(`   ✅ ${totalInserted} batches of pricing data inserted`)

        // Step 4: Verify the data
        console.log('\n🔍 Verifying data...')

        // Define the expected shape of the query result
        interface PricingSummaryRow {
            provider: string
            count: number
        }

        const result = await executeQuery<PricingSummaryRow>('SELECT provider, COUNT(*) as count FROM pricing GROUP BY provider')

        console.log('\n📊 Pricing data summary:')
        if (result.result && result.result[0] && result.result[0].results) {
            result.result[0].results.forEach((row) => {
                console.log(`   ${row.provider}: ${row.count} packages`)
            })
        }

        console.log('\n✅ Pricing data sync completed successfully!')
    } catch (error) {
        console.error('\n❌ Error syncing pricing data:', error)
        process.exit(1)
    }
}

main()
