
import { getDB } from '../lib/db';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config();

const SAMPLE_USERS = [
    {
        name: 'Admin User',
        email: 'admin@gigshub.com',
        role: 'admin',
        phone: '0500000000',
        password: 'adminpassword'
    },
    {
        name: 'Agent User',
        email: 'agent@gigshub.com',
        role: 'agent',
        phone: '0500000001',
        password: 'agentpassword'
    },
    {
        name: 'Regular User',
        email: 'user@gigshub.com',
        role: 'user',
        phone: '0500000002',
        password: 'userpassword'
    }
];

const SAMPLE_PRODUCTS = [
    { provider: 'MTN', name: 'MTN 1GB', size: '1GB', price: 10.0, agent_price: 9.0, product_code: 'MTN_1GB' },
    { provider: 'MTN', name: 'MTN 2GB', size: '2GB', price: 20.0, agent_price: 18.0, product_code: 'MTN_2GB' },
    { provider: 'Telecel', name: 'Telecel 1.5GB', size: '1.5GB', price: 15.0, agent_price: 13.5, product_code: 'TCL_1.5GB' },
    { provider: 'AT', name: 'AT Big Time 2GB', size: '2GB', price: 12.0, agent_price: 11.0, product_code: 'AT_2GB' }
];

async function seedRemoteData() {
    console.log('🌱 Starting Remote Data Seeding...');

    const db = getDB();
    if (!db) {
        console.error('❌ Could not initialize DB adapter. Check environment variables.');
        process.exit(1);
    }

    try {
        // 1. Update Schema
        console.log('📜 Updating Schema...');
        const schemaPath = path.join(process.cwd(), 'scripts', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon to execute statements individually
        // Remove comments and empty lines
        const statements = schemaSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            try {
                await db.exec(statement);
            } catch (e) {
                console.warn(`⚠️ Schema statement warning (might already exist): ${e}`);
            }
        }
        console.log('✅ Schema updated.');

        // 2. Seed Users
        console.log('👤 Seeding Users...');
        for (const user of SAMPLE_USERS) {
            const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(user.email).first<{ id: string }>();
            let userId = existing?.id;

            if (!existing) {
                userId = randomUUID();
                await db.prepare(
                    'INSERT INTO users (id, name, email, phone, role, wallet_balance) VALUES (?, ?, ?, ?, ?, ?)'
                ).bind(userId, user.name, user.email, user.phone, user.role, 100.0).run();
                console.log(`   + Created user: ${user.email}`);
            } else {
                console.log(`   = User exists: ${user.email}`);
            }

            // Set Password
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const existingPwd = await db.prepare('SELECT user_id FROM user_passwords WHERE user_id = ?').bind(userId).first();

            if (existingPwd) {
                await db.prepare('UPDATE user_passwords SET password_hash = ? WHERE user_id = ?')
                    .bind(hashedPassword, userId).run();
            } else {
                await db.prepare('INSERT INTO user_passwords (user_id, password_hash, created_at) VALUES (?, ?, ?)')
                    .bind(userId, hashedPassword, new Date().toISOString()).run();
            }
        }

        // 3. Seed Products (Pricing)
        console.log('📦 Seeding Products...');
        // Clear existing pricing to avoid duplicates for this seed script
        await db.exec('DELETE FROM pricing');

        for (const product of SAMPLE_PRODUCTS) {
            await db.prepare(
                'INSERT INTO pricing (provider, name, size, price, agent_price, product_code) VALUES (?, ?, ?, ?, ?, ?)'
            ).bind(product.provider, product.name, product.size, product.price, product.agent_price, product.product_code).run();
        }
        console.log(`   + Seeded ${SAMPLE_PRODUCTS.length} products.`);

        // 4. Seed Orders
        console.log('🛍️ Seeding Orders...');
        const users = await db.prepare('SELECT id, phone FROM users').all<{ id: string, phone: string }>();
        const products = await db.prepare('SELECT id, provider, price FROM pricing').all<{ id: number, provider: string, price: number }>();

        if (users.results && products.results) {
            for (let i = 0; i < 10; i++) {
                const user = users.results[Math.floor(Math.random() * users.results.length)];
                const product = products.results[Math.floor(Math.random() * products.results.length)];
                const status = ['pending', 'processing', 'success', 'failed'][Math.floor(Math.random() * 4)];

                await db.prepare(
                    'INSERT INTO orders (id, user_id, phone, provider, package_id, amount, status, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
                ).bind(
                    randomUUID(),
                    user.id,
                    user.phone,
                    product.provider,
                    product.id,
                    product.price,
                    status,
                    `REF-${Math.floor(Math.random() * 1000000)}`
                ).run();
            }
            console.log('   + Seeded 10 random orders.');
        }

        // 5. Seed Topups
        console.log('💳 Seeding Topup Requests...');
        if (users.results) {
            for (let i = 0; i < 5; i++) {
                const user = users.results[Math.floor(Math.random() * users.results.length)];
                const status = ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)];

                await db.prepare(
                    'INSERT INTO topup_requests (id, user_id, amount, reference, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)'
                ).bind(
                    randomUUID(),
                    user.id,
                    (Math.random() * 100).toFixed(2),
                    `TOP-${Math.floor(Math.random() * 1000000)}`,
                    'MOMO',
                    status
                ).run();
            }
            console.log('   + Seeded 5 random topup requests.');
        }

        // 6. Seed Agent Validations
        console.log('🕵️ Seeding Agent Validations...');
        if (users.results) {
            const user = users.results[0]; // Just use the first user for demo
            await db.prepare(
                'INSERT INTO agent_validations (id, user_id, business_name, business_registration_number, status) VALUES (?, ?, ?, ?, ?)'
            ).bind(
                randomUUID(),
                user.id,
                'Demo Business Ltd',
                'BN-12345678',
                'pending'
            ).run();
            console.log('   + Seeded 1 agent validation request.');
        }

        console.log('✨ Seeding completed successfully!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    }
}

seedRemoteData();
