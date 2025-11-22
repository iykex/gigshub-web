#!/usr/bin/env node

/**
 * Script to add AFA Registration package to D1 database
 * Run with: node scripts/add-afa-package.js
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

if (!ACCOUNT_ID || !DATABASE_ID || !API_TOKEN) {
    console.error('❌ Missing environment variables!')
    console.error('Please set: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN')
    process.exit(1)
}

const AFA_PACKAGE = {
    provider: 'AFA',
    name: 'AFA SIM Registration',
    size: 'Standard',
    price: 5.00,
    agent_price: 4.50,
    product_code: 'AFA-REG-001',
    is_active: 1
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

async function addAfaPackage() {
    try {
        console.log('🔍 Checking if AFA package already exists...')

        // Check if AFA package exists
        const checkResult = await executeQuery(
            "SELECT * FROM pricing WHERE provider = 'AFA' AND name = ?",
            [AFA_PACKAGE.name]
        )

        if (checkResult.result[0].results.length > 0) {
            console.log('⚠️  AFA package already exists:')
            console.log(checkResult.result[0].results[0])
            console.log('\n💡 To update the price, use the Admin Store page at /dashboard/admin/stores')
            return
        }

        console.log('➕ Adding AFA package to database...')

        // Insert AFA package
        const insertResult = await executeQuery(
            `INSERT INTO pricing (provider, name, size, price, agent_price, product_code, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                AFA_PACKAGE.provider,
                AFA_PACKAGE.name,
                AFA_PACKAGE.size,
                AFA_PACKAGE.price,
                AFA_PACKAGE.agent_price,
                AFA_PACKAGE.product_code,
                AFA_PACKAGE.is_active
            ]
        )

        console.log('✅ AFA package added successfully!')
        console.log('\nPackage details:')
        console.log(`  Provider: ${AFA_PACKAGE.provider}`)
        console.log(`  Name: ${AFA_PACKAGE.name}`)
        console.log(`  Price: GHS ${AFA_PACKAGE.price.toFixed(2)}`)
        console.log(`  Agent Price: GHS ${AFA_PACKAGE.agent_price.toFixed(2)}`)
        console.log(`  Product Code: ${AFA_PACKAGE.product_code}`)
        console.log('\n🎉 You can now use AFA registration at /stores/afa-registration')

    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

// Run the script
addAfaPackage()
