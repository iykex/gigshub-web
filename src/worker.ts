/// <reference types="@cloudflare/workers-types" />
import bcrypt from 'bcryptjs'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
    DB: D1Database
    PAYSTACK_SECRET_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors())

app.get('/', (c) => {
    return c.text('GigsHub API')
})

// Pricing API
app.get('/api/pricing', async (c) => {
    try {
        const db = c.env.DB
        if (!db) {
            return c.json({ error: 'Database connection not available' }, 503)
        }

        const provider = c.req.query('provider')
        let result: any

        if (provider) {
            result = await db.prepare(
                'SELECT * FROM pricing WHERE provider = ? AND is_active = 1 ORDER BY CAST(REPLACE(size, "GB", "") AS REAL)'
            ).bind(provider).all()
        } else {
            result = await db.prepare(
                'SELECT * FROM pricing WHERE is_active = 1 ORDER BY provider, CAST(REPLACE(size, "GB", "") AS REAL)'
            ).all()
        }

        return c.json({
            success: true,
            data: result.results || [],
            count: result.results?.length || 0
        })
    } catch (error) {
        console.error('Error fetching pricing:', error)
        return c.json({ error: 'Failed to fetch pricing data' }, 500)
    }
})

// Helper functions
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function generateRandomPassword(length = 10) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let retVal = ""
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n))
    }
    return retVal
}

// Alternative password hashing using Web Crypto API (faster and more reliable on Cloudflare Workers)
async function hashPasswordCrypto(password: string, providedSalt?: Uint8Array): Promise<string> {
    const encoder = new TextEncoder()
    const salt = providedSalt || crypto.getRandomValues(new Uint8Array(16))

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    )

    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as any,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    )

    const exportedKey = await crypto.subtle.exportKey('raw', key) as ArrayBuffer
    const hashBuffer = new Uint8Array(exportedKey)
    const hashHex = Array.from(hashBuffer).map(b => b.toString(16).padStart(2, '0')).join('')
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')

    return `${saltHex}:${hashHex}`
}

async function verifyPasswordCrypto(password: string, storedHash: string): Promise<boolean> {
    try {
        const [saltHex, originalHashHex] = storedHash.split(':')
        if (!saltHex || !originalHashHex) return false

        const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
        const newHash = await hashPasswordCrypto(password, salt)
        const [_, newHashHex] = newHash.split(':')

        return newHashHex === originalHashHex
    } catch (error) {
        console.error('Password verification error:', error)
        return false
    }
}

// Helper to detect hash type
function isBcryptHash(hash: string): boolean {
    return hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')
}

// Login API - FIXED VERSION
app.post('/api/auth/login', async (c) => {
    console.log('[Login] Request received')
    try {
        const body = await c.req.json()
        const { email, password } = body
        console.log('[Login] Attempting login for:', email)

        if (!email || !password) {
            console.log('[Login] Missing credentials')
            return c.json({ error: 'Email and password are required' }, 400)
        }

        const db = c.env.DB
        if (!db) {
            console.error('[Login] DB connection missing')
            return c.json({ error: 'Database connection failed' }, 503)
        }

        // Step 1: Get user details
        console.log('[Login] Fetching user details...')
        const foundUser = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<any>()

        if (!foundUser) {
            console.log('[Login] User not found')
            return c.json({ error: 'Invalid email or password' }, 401)
        }

        // Step 2: Get password hash
        console.log('[Login] Fetching password hash...')
        const passwordRecord = await db.prepare('SELECT password_hash FROM user_passwords WHERE user_id = ?').bind(foundUser.id).first<any>()

        const result = { ...foundUser, password_hash: passwordRecord?.password_hash }

        if (!result) {
            console.log('[Login] User not found')
            return c.json({ error: 'Invalid email or password' }, 401)
        }

        if (!result.password_hash) {
            console.log('[Login] No password hash found for user')
            return c.json({ error: 'Invalid email or password' }, 401)
        }

        console.log('[Login] User found:', result.id)
        console.log('[Login] Hash type:', isBcryptHash(result.password_hash) ? 'bcrypt' : 'crypto')

        // Verify password with timeout protection and support for both hash types
        console.log('[Login] Verifying password...')
        let isValid = false

        try {
            if (isBcryptHash(result.password_hash)) {
                // Use bcrypt for bcrypt hashes (with timeout)
                console.log('[Login] Using bcrypt verification...')
                isValid = await Promise.race([
                    bcrypt.compare(password, result.password_hash),
                    new Promise<boolean>((_, reject) =>
                        setTimeout(() => reject(new Error('Password verification timeout')), 8000)
                    )
                ])
            } else {
                // Use crypto for crypto hashes
                console.log('[Login] Using crypto verification...')
                isValid = await verifyPasswordCrypto(password, result.password_hash)
            }
        } catch (error) {
            console.error('[Login] Password verification error:', error)
            // If bcrypt times out or fails, return authentication error
            return c.json({
                error: 'Authentication failed',
                details: error instanceof Error ? error.message : 'Verification timeout'
            }, 500)
        }

        console.log('[Login] Password verification result:', isValid)

        if (!isValid) {
            return c.json({ error: 'Invalid email or password' }, 401)
        }

        // Remove password_hash before returning
        const { password_hash, ...user } = result

        console.log('[Login] Login successful')
        return c.json({
            success: true,
            user
        })

    } catch (error) {
        console.error('[Login] Critical error:', error)
        return c.json({
            error: 'Failed to login',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500)
    }
})

// User: Get Wallet
app.get('/api/user/wallet', async (c) => {
    try {
        const userId = c.req.query('userId')
        if (!userId) return c.json({ error: 'User ID required' }, 400)

        const db = c.env.DB
        const user = await db.prepare('SELECT wallet_balance FROM users WHERE id = ?').bind(userId).first<any>()

        if (!user) return c.json({ error: 'User not found' }, 404)

        // Get transactions
        const transactions = await db.prepare(`
            SELECT id, type, reference, amount as change, created_at
            FROM transactions
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        `).bind(userId).all()

        return c.json({
            balance: user.wallet_balance || 0,
            transactions: transactions.results || []
        })
    } catch (error) {
        return c.json({ error: 'Failed to fetch wallet data' }, 500)
    }
})

// User: Wallet Topup (Disabled for users, use Paystack)
app.post('/api/user/wallet', async (c) => {
    return c.json({ error: 'Manual topup is restricted to administrators. Please use the payment gateway.' }, 403)
})

// User: Update Profile
app.put('/api/user/profile', async (c) => {
    try {
        const { userId, name, phone } = await c.req.json()
        const db = c.env.DB

        if (!userId) {
            return c.json({ error: 'User ID required' }, 400)
        }

        await db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?')
            .bind(name, phone, userId).run()

        return c.json({ success: true })
    } catch (error) {
        return c.json({ error: 'Failed to update profile' }, 500)
    }
})

// User: Get Orders
app.get('/api/user/orders', async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1')
        const limit = parseInt(c.req.query('limit') || '10')
        const search = c.req.query('search') || ''
        const offset = (page - 1) * limit

        const db = c.env.DB

        // For now, return orders from transactions
        // In a real app, you'd have a separate orders table
        const result = await db.prepare(`
            SELECT id, description as product_name, amount, status, created_at
            FROM transactions
            WHERE type = 'purchase' OR type = 'payment'
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `).bind(limit, offset).all()

        const count = await db.prepare("SELECT COUNT(*) as total FROM transactions WHERE type = 'purchase' OR type = 'payment'").first<any>()

        return c.json({
            orders: result.results || [],
            pagination: {
                totalPages: Math.ceil((count?.total || 0) / limit)
            }
        })
    } catch (error) {
        return c.json({ error: 'Failed to fetch orders' }, 500)
    }
})

// Get Current User API
app.get('/api/auth/me', async (c) => {
    try {
        const email = c.req.query('email')

        if (!email) {
            return c.json({ error: 'Email required' }, 400)
        }

        const db = c.env.DB
        const user = await db.prepare('SELECT id, name, phone, email, role, wallet_balance, created_at FROM users WHERE email = ?').bind(email).first()

        if (!user) {
            return c.json({ error: 'User not found' }, 404)
        }

        return c.json({ user })
    } catch (error) {
        return c.json({ error: 'Failed to fetch user' }, 500)
    }
})

// Signup API - Updated to use Web Crypto by default
app.post('/api/auth/signup', async (c) => {
    try {
        const body = await c.req.json()
        const { email, password: providedPassword, username, phone, role = 'user', useBcrypt = false } = body

        if (!email) {
            return c.json({ error: 'Email is required' }, 400)
        }

        let password = providedPassword
        let isAutoGeneratedPassword = false

        // Handle Agent Registration (Auto-generate password)
        if (role === 'agent') {
            password = generateRandomPassword(12)
            isAutoGeneratedPassword = true
        } else {
            // Regular user registration requires password
            if (!password) {
                return c.json({ error: 'Password is required' }, 400)
            }
            if (password.length < 6) {
                return c.json({ error: 'Password must be at least 6 characters long' }, 400)
            }
        }

        const db = c.env.DB
        if (!db) {
            return c.json({ error: 'Database connection failed' }, 503)
        }

        // Check if user already exists
        const existingUser = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()

        if (existingUser) {
            return c.json({ error: 'User with this email already exists' }, 409)
        }

        // Hash the password - Use Web Crypto by default (faster), or bcrypt if explicitly requested
        let hashedPassword: string
        if (useBcrypt) {
            console.log('[Signup] Using bcrypt for password hashing')
            hashedPassword = await bcrypt.hash(password, 10)
        } else {
            console.log('[Signup] Using Web Crypto for password hashing')
            hashedPassword = await hashPasswordCrypto(password)
        }

        // Create new user
        const userId = generateId()
        const now = new Date().toISOString()

        await db.prepare(
            `INSERT INTO users (id, name, phone, email, role, wallet_balance, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            userId,
            username || null,
            phone || null,
            email,
            role,
            0,
            now
        ).run()

        // Store password hash in a separate table
        try {
            await db.prepare(
                `CREATE TABLE IF NOT EXISTS user_passwords (
                    user_id TEXT PRIMARY KEY,
                    password_hash TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )`
            ).run()

            await db.prepare(
                `INSERT INTO user_passwords (user_id, password_hash, created_at)
                 VALUES (?, ?, ?)`
            ).bind(userId, hashedPassword, now).run()
        } catch (e) {
            console.error('Password storage error:', e)
            // Cleanup: delete the user if password storage failed
            await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run()
            throw new Error('Failed to store password securely')
        }

        return c.json({
            success: true,
            user: {
                id: userId,
                email,
                name: username,
                phone,
                role,
                wallet_balance: 0,
                created_at: now
            },
            generatedPassword: isAutoGeneratedPassword ? password : undefined
        }, 201)

    } catch (error) {
        console.error('Signup error:', error)
        return c.json({
            error: 'Failed to create user',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500)
    }
})

// Migration endpoint to convert bcrypt hashes to crypto hashes (optional)
app.post('/api/auth/migrate-password', async (c) => {
    try {
        const body = await c.req.json()
        const { email, password } = body

        if (!email || !password) {
            return c.json({ error: 'Email and password are required' }, 400)
        }

        const db = c.env.DB
        if (!db) {
            return c.json({ error: 'Database connection failed' }, 503)
        }

        // Get user and current hash
        const result = await db.prepare(`
            SELECT u.id, p.password_hash
            FROM users u
            LEFT JOIN user_passwords p ON u.id = p.user_id
            WHERE u.email = ?
        `).bind(email).first<any>()

        if (!result || !result.password_hash) {
            return c.json({ error: 'User not found' }, 404)
        }

        // Check if already using crypto hash
        if (!isBcryptHash(result.password_hash)) {
            return c.json({ success: true, message: 'Already using crypto hash' })
        }

        // Verify current password with bcrypt
        const isValid = await bcrypt.compare(password, result.password_hash)
        if (!isValid) {
            return c.json({ error: 'Invalid password' }, 401)
        }

        // Create new crypto hash
        const newHash = await hashPasswordCrypto(password)

        // Update database
        await db.prepare(
            'UPDATE user_passwords SET password_hash = ? WHERE user_id = ?'
        ).bind(newHash, result.id).run()

        return c.json({
            success: true,
            message: 'Password hash migrated to crypto format'
        })

    } catch (error) {
        console.error('Migration error:', error)
        return c.json({
            error: 'Failed to migrate password',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500)
    }
})

// Paystack API Integration
// const PAYSTACK_SECRET_KEY = 'sk_test_a240e34e3c3907de996184fd987dadf9bff2f0ff'

app.post('/api/payment/initialize', async (c) => {
    try {
        const body = await c.req.json()
        const { email, amount, reference } = body
        const PAYSTACK_SECRET_KEY = c.env.PAYSTACK_SECRET_KEY

        if (!PAYSTACK_SECRET_KEY) {
            console.error('PAYSTACK_SECRET_KEY is missing in environment variables')
            return c.json({ error: 'Server configuration error' }, 500)
        }

        if (!email || !amount) {
            return c.json({ error: 'Email and amount are required' }, 400)
        }

        // Amount in kobo/pesewas
        const amountInKobo = Math.round(parseFloat(amount) * 100)

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                amount: amountInKobo,
                reference,
                callback_url: 'http://localhost:5173/payment/callback' // Update for production
            })
        })

        const data = await response.json() as any

        if (!data.status) {
            return c.json({ error: data.message || 'Payment initialization failed' }, 400)
        }

        return c.json(data)
    } catch (error) {
        console.error('Payment init error:', error)
        return c.json({ error: 'Failed to initialize payment' }, 500)
    }
})

app.post('/api/payment/verify', async (c) => {
    try {
        const body = await c.req.json()
        const { reference, type = 'payment' } = body
        const PAYSTACK_SECRET_KEY = c.env.PAYSTACK_SECRET_KEY

        if (!PAYSTACK_SECRET_KEY) {
            return c.json({ error: 'Server configuration error' }, 500)
        }

        if (!reference) {
            return c.json({ error: 'Reference is required' }, 400)
        }

        const db = c.env.DB
        if (!db) {
            return c.json({ error: 'Database connection failed' }, 503)
        }

        // Verify with Paystack
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
            }
        })

        const data = await response.json() as any

        if (!data.status || data.data.status !== 'success') {
            return c.json({ error: data.message || 'Payment verification failed' }, 400)
        }

        const transactionData = data.data
        const email = transactionData.customer.email
        const amount = transactionData.amount / 100 // Convert kobo to GHS

        // Find user by email (case-insensitive)
        let userId = null
        try {
            const user = await db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').bind(email).first<any>()
            userId = user ? user.id : null
            console.log(`[Payment] Found user ${userId} for email ${email}`)
        } catch (e) {
            console.error('[Payment] Error finding user:', e)
        }

        try {
            // Create transactions table if not exists
            await db.prepare(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    reference TEXT UNIQUE,
                    amount REAL,
                    status TEXT,
                    type TEXT,
                    provider TEXT,
                    description TEXT,
                    created_at TEXT
                )
            `).run()

            // Create agent_requests table if not exists
            await db.prepare(`
                CREATE TABLE IF NOT EXISTS agent_requests (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    reference TEXT,
                    amount REAL,
                    status TEXT,
                    created_at TEXT
                )
            `).run()

            // Check if transaction already exists
            const existingTx = await db.prepare('SELECT id FROM transactions WHERE reference = ?').bind(reference).first()

            if (!existingTx) {
                // Log transaction
                const txId = generateId()
                const now = new Date().toISOString()
                let description = 'Data Bundle Purchase'

                if (type === 'topup') description = 'Wallet Topup'
                if (type === 'agent_registration') description = 'Agent Registration Fee'

                await db.prepare(`
                    INSERT INTO transactions (id, user_id, reference, amount, status, type, provider, description, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    txId,
                    userId,
                    reference,
                    amount,
                    'success',
                    type,
                    'paystack',
                    description,
                    now
                ).run()

                console.log(`[Payment] Transaction ${reference} logged successfully`)

                // Handle specific types
                if (type === 'topup' && userId) {
                    await db.prepare(`
                        UPDATE users 
                        SET wallet_balance = COALESCE(wallet_balance, 0) + ? 
                        WHERE id = ?
                    `).bind(amount, userId).run()
                    console.log(`[Payment] Credited ${amount} to user ${userId}`)
                } else if (type === 'agent_registration' && userId) {
                    // Log agent request
                    const requestId = generateId()
                    await db.prepare(`
                        INSERT INTO agent_requests (id, user_id, reference, amount, status, created_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `).bind(requestId, userId, reference, amount, 'pending', now).run()
                    console.log(`[Payment] Agent request created for user ${userId}`)
                }
            } else {
                console.log(`[Payment] Transaction ${reference} already exists`)
            }
        } catch (dbError) {
            console.error('[Payment] Database error:', dbError)
            // We don't fail the request here because the payment was verified with Paystack
            // But we should probably alert the admin
        }

        return c.json({
            status: true,
            message: "Payment verified successfully",
            data: transactionData
        })
    } catch (error) {
        console.error('Payment verification error:', error)
        return c.json({
            error: 'Failed to verify payment',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500)
    }
})

// Wallet Payment Endpoint
app.post('/api/wallet/pay', async (c) => {
    try {
        const body = await c.req.json()
        const { userId, amount, description } = body

        if (!userId || !amount) {
            return c.json({ error: 'User ID and amount are required' }, 400)
        }

        const db = c.env.DB
        if (!db) return c.json({ error: 'Database connection failed' }, 503)

        // Check balance
        const user = await db.prepare('SELECT wallet_balance FROM users WHERE id = ?').bind(userId).first<any>()

        if (!user) {
            return c.json({ error: 'User not found' }, 404)
        }

        if (user.wallet_balance < amount) {
            return c.json({ error: 'Insufficient wallet balance' }, 400)
        }

        // Deduct balance
        await db.prepare('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?')
            .bind(amount, userId)
            .run()

        // Record transaction (if you have a transactions table, which you should)
        // await db.prepare('INSERT INTO transactions ...').run()

        return c.json({ success: true, message: 'Payment successful' })
    } catch (error) {
        console.error('Wallet payment error:', error)
        return c.json({ error: 'Wallet payment failed' }, 500)
    }
})

// Admin: Get All Users
app.get('/api/admin/users', async (c) => {
    try {
        const db = c.env.DB
        // Ensure is_active column exists (lazy migration)
        try {
            await db.prepare('ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1').run()
        } catch (e) {
            // Ignore if column exists
        }

        const result = await db.prepare('SELECT id, name, email, phone, role, wallet_balance, is_active, created_at FROM users ORDER BY created_at DESC').all()
        return c.json({ users: result.results })
    } catch (error) {
        return c.json({ error: 'Failed to fetch users' }, 500)
    }
})

// Admin: Update User
app.put('/api/admin/users/:id', async (c) => {
    try {
        const userId = c.req.param('id')
        const body = await c.req.json()
        const { role, is_active } = body
        const db = c.env.DB

        if (role) {
            await db.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, userId).run()
        }
        if (is_active !== undefined) {
            await db.prepare('UPDATE users SET is_active = ? WHERE id = ?').bind(is_active, userId).run()
        }

        return c.json({ success: true })
    } catch (error) {
        return c.json({ error: 'Failed to update user' }, 500)
    }
})

// Admin: Delete User
app.delete('/api/admin/users/:id', async (c) => {
    try {
        const userId = c.req.param('id')
        const db = c.env.DB
        await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run()
        return c.json({ success: true })
    } catch (error) {
        return c.json({ error: 'Failed to delete user' }, 500)
    }
})

// Admin: Wallet Management (Credit/Debit)
app.post('/api/admin/wallet/transaction', async (c) => {
    try {
        const body = await c.req.json()
        const { userId, amount, type, description } = body // type: 'credit' or 'debit'
        const db = c.env.DB

        if (!userId || !amount || !type) {
            return c.json({ error: 'Missing required fields' }, 400)
        }

        const numericAmount = parseFloat(amount)
        if (isNaN(numericAmount)) return c.json({ error: 'Invalid amount' }, 400)

        // Update balance
        if (type === 'credit') {
            await db.prepare('UPDATE users SET wallet_balance = COALESCE(wallet_balance, 0) + ? WHERE id = ?').bind(numericAmount, userId).run()
        } else if (type === 'debit') {
            await db.prepare('UPDATE users SET wallet_balance = COALESCE(wallet_balance, 0) - ? WHERE id = ?').bind(numericAmount, userId).run()
        } else {
            return c.json({ error: 'Invalid transaction type' }, 400)
        }

        // Log transaction
        const txId = generateId()
        const now = new Date().toISOString()
        const txType = type === 'credit' ? 'admin_credit' : 'admin_debit'

        await db.prepare(`
            INSERT INTO transactions (id, user_id, reference, amount, status, type, provider, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            txId,
            userId,
            `ADMIN-${Date.now()}`,
            numericAmount,
            'success',
            txType,
            'admin',
            description || `Admin ${type}`,
            now
        ).run()

        return c.json({ success: true })
    } catch (error) {
        console.error('Wallet transaction error:', error)
        return c.json({ error: 'Failed to process transaction' }, 500)
    }
})

// Admin: Get Store Items
app.get('/api/admin/stores', async (c) => {
    try {
        const db = c.env.DB
        const result = await db.prepare('SELECT * FROM pricing ORDER BY provider, size').all()
        return c.json({ products: result.results })
    } catch (error) {
        return c.json({ error: 'Failed to fetch store items' }, 500)
    }
})

// Admin: Store Management (Add/Update)
app.post('/api/admin/stores', async (c) => {
    try {
        const body = await c.req.json()
        const { id, provider, plan_id, size, price, is_active } = body
        const db = c.env.DB

        if (id) {
            // Update
            await db.prepare(`
                UPDATE pricing 
                SET provider = ?, plan_id = ?, size = ?, price = ?, is_active = ?
                WHERE id = ?
            `).bind(provider, plan_id, size, price, is_active, id).run()
        } else {
            // Create
            const newId = generateId()
            await db.prepare(`
                INSERT INTO pricing (id, provider, plan_id, size, price, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(newId, provider, plan_id, size, price, is_active !== undefined ? is_active : 1).run()
        }

        return c.json({ success: true })
    } catch (error) {
        return c.json({ error: 'Failed to save store item' }, 500)
    }
})

// Admin: Delete Store Item
app.delete('/api/admin/stores/:id', async (c) => {
    try {
        const id = c.req.param('id')
        const db = c.env.DB
        await db.prepare('DELETE FROM pricing WHERE id = ?').bind(id).run()
        return c.json({ success: true })
    } catch (error) {
        return c.json({ error: 'Failed to delete store item' }, 500)
    }
})

// Admin: Get Topups
app.get('/api/admin/topups', async (c) => {
    try {
        const db = c.env.DB
        const page = parseInt(c.req.query('page') || '1')
        const limit = parseInt(c.req.query('limit') || '10')
        const offset = (page - 1) * limit

        const result = await db.prepare(`
            SELECT t.*, u.name as user_name, u.email as user_email 
            FROM transactions t 
            LEFT JOIN users u ON t.user_id = u.id 
            WHERE t.type = 'topup' 
            ORDER BY t.created_at DESC 
            LIMIT ? OFFSET ?
        `).bind(limit, offset).all()

        const count = await db.prepare("SELECT COUNT(*) as total FROM transactions WHERE type = 'topup'").first<any>()

        return c.json({
            topups: result.results,
            pagination: {
                totalPages: Math.ceil((count?.total || 0) / limit)
            }
        })
    } catch (error) {
        return c.json({ error: 'Failed to fetch topups' }, 500)
    }
})

// Admin: Topup Action (Approve/Reject)
app.post('/api/admin/topups/action', async (c) => {
    try {
        const { id, action } = await c.req.json()
        const db = c.env.DB

        const tx = await db.prepare('SELECT * FROM transactions WHERE id = ?').bind(id).first<any>()
        if (!tx) return c.json({ error: 'Transaction not found' }, 404)

        if (action === 'approve') {
            await db.batch([
                db.prepare("UPDATE transactions SET status = 'approved' WHERE id = ?").bind(id),
                db.prepare("UPDATE users SET wallet_balance = COALESCE(wallet_balance, 0) + ? WHERE id = ?").bind(tx.amount, tx.user_id)
            ])
        } else if (action === 'reject') {
            await db.prepare("UPDATE transactions SET status = 'rejected' WHERE id = ?").bind(id).run()
        }

        return c.json({ success: true })
    } catch (error) {
        return c.json({ error: 'Failed to process action' }, 500)
    }
})

// Admin: Stats
// Admin: Get Orders
app.get('/api/admin/orders', async (c) => {
    try {
        const db = c.env.DB
        const page = parseInt(c.req.query('page') || '1')
        const limit = parseInt(c.req.query('limit') || '10')
        const search = c.req.query('search') || ''
        const status = c.req.query('status') || 'all'
        const offset = (page - 1) * limit

        let query = `
            SELECT t.*, u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM transactions t 
            LEFT JOIN users u ON t.user_id = u.id 
            WHERE (t.type = 'purchase' OR t.type = 'payment')
        `

        const params: any[] = []

        if (status && status !== 'all') {
            query += ` AND t.status = ?`
            params.push(status)
        }

        if (search) {
            query += ` AND (t.id LIKE ? OR u.email LIKE ? OR u.name LIKE ?)`
            params.push(`%${search}%`, `%${search}%`, `%${search}%`)
        }

        query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`
        params.push(limit, offset)

        const result = await db.prepare(query).bind(...params).all()

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM transactions t 
            LEFT JOIN users u ON t.user_id = u.id 
            WHERE (t.type = 'purchase' OR t.type = 'payment')
        `
        const countParams: any[] = []

        if (status && status !== 'all') {
            countQuery += ` AND t.status = ?`
            countParams.push(status)
        }

        if (search) {
            countQuery += ` AND (t.id LIKE ? OR u.email LIKE ? OR u.name LIKE ?)`
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
        }

        const count = await db.prepare(countQuery).bind(...countParams).first<any>()

        return c.json({
            orders: result.results.map((r: any) => ({
                id: r.id,
                user_id: r.user_id,
                user_name: r.user_name,
                user_email: r.user_email,
                phone: r.user_phone,
                product_name: r.description,
                amount: r.amount,
                status: r.status,
                created_at: r.created_at,
                provider: r.provider
            })),
            pagination: {
                totalPages: Math.ceil((count?.total || 0) / limit)
            }
        })
    } catch (error) {
        console.error('Fetch orders error:', error)
        return c.json({ error: 'Failed to fetch orders' }, 500)
    }
})

// Admin: Order Action
app.post('/api/admin/orders/action', async (c) => {
    try {
        const { orderId, status } = await c.req.json()
        const db = c.env.DB

        if (!['success', 'failed', 'pending'].includes(status)) {
            return c.json({ error: 'Invalid status' }, 400)
        }

        await db.prepare('UPDATE transactions SET status = ? WHERE id = ?')
            .bind(status, orderId)
            .run()

        return c.json({ success: true })
    } catch (error) {
        return c.json({ error: 'Failed to update order' }, 500)
    }
})

// Admin: Get Validations (Agent Requests)
app.get('/api/admin/validations', async (c) => {
    try {
        const db = c.env.DB
        const page = parseInt(c.req.query('page') || '1')
        const limit = parseInt(c.req.query('limit') || '10')
        const offset = (page - 1) * limit

        // Ensure agent_requests table exists
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS agent_requests (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                reference TEXT,
                amount REAL,
                status TEXT,
                business_name TEXT,
                business_registration_number TEXT,
                created_at TEXT
            )
        `).run()

        const result = await db.prepare(`
            SELECT ar.*, u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM agent_requests ar
            LEFT JOIN users u ON ar.user_id = u.id
            WHERE ar.status = 'pending'
            ORDER BY ar.created_at DESC
            LIMIT ? OFFSET ?
        `).bind(limit, offset).all()

        const count = await db.prepare("SELECT COUNT(*) as total FROM agent_requests WHERE status = 'pending'").first<any>()

        return c.json({
            validations: result.results,
            pagination: {
                totalPages: Math.ceil((count?.total || 0) / limit)
            }
        })
    } catch (error) {
        console.error('Fetch validations error:', error)
        return c.json({ error: 'Failed to fetch validations' }, 500)
    }
})

// Admin: Validation Action
app.post('/api/admin/validations/action', async (c) => {
    try {
        const { id, action } = await c.req.json()
        const db = c.env.DB

        const request = await db.prepare('SELECT * FROM agent_requests WHERE id = ?').bind(id).first<any>()
        if (!request) return c.json({ error: 'Request not found' }, 404)

        if (action === 'approve') {
            await db.batch([
                db.prepare("UPDATE agent_requests SET status = 'approved' WHERE id = ?").bind(id),
                db.prepare("UPDATE users SET role = 'agent' WHERE id = ?").bind(request.user_id)
            ])
        } else if (action === 'reject') {
            await db.prepare("UPDATE agent_requests SET status = 'rejected' WHERE id = ?").bind(id).run()
        }

        return c.json({ success: true })
    } catch (error) {
        return c.json({ error: 'Failed to process validation' }, 500)
    }
})

// Admin: Send SMS
app.post('/api/admin/sms', async (c) => {
    try {
        const { recipients, message } = await c.req.json()

        // Placeholder for SMS integration (e.g., Twilio, mNotify, Arkesel)
        console.log(`[SMS] Sending to ${recipients.length} recipients: ${message}`)

        // Simulate success
        return c.json({ success: true, count: recipients.length })
    } catch (error) {
        return c.json({ error: 'Failed to send SMS' }, 500)
    }
})

app.get('/api/admin/stats', async (c) => {
    try {
        const db = c.env.DB
        const usersCount = await db.prepare('SELECT COUNT(*) as count FROM users').first<any>()
        const revenue = await db.prepare("SELECT SUM(amount) as total FROM transactions WHERE status = 'success' OR status = 'approved'").first<any>()
        const pending = await db.prepare("SELECT COUNT(*) as count FROM transactions WHERE status = 'pending'").first<any>()

        return c.json({
            totalUsers: usersCount?.count || 0,
            totalRevenue: revenue?.total || 0,
            pendingRequests: pending?.count || 0
        })
    } catch (error) {
        return c.json({ error: 'Failed to fetch stats' }, 500)
    }
})

export default app