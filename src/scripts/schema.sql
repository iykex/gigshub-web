-- GiGSHUB Database Schema for Cloudflare D1

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    email TEXT,
    role TEXT CHECK(role IN ('guest','user','agent','admin')) DEFAULT 'guest',
    wallet_balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pricing table
CREATE TABLE IF NOT EXISTS pricing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT,
    name TEXT,
    size TEXT,
    price REAL,
    agent_price REAL NULL,
    product_code TEXT,
    is_active INTEGER DEFAULT 1,
    updated_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1
);

-- Pricing audit table
CREATE TABLE IF NOT EXISTS pricing_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pricing_id INTEGER,
    old_price REAL,
    new_price REAL,
    changed_by TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    comment TEXT
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NULL,
    phone TEXT,
    provider TEXT,
    package_id INTEGER,
    amount REAL,
    status TEXT CHECK(status IN ('pending','processing','success','failed','refunded')) DEFAULT 'pending',
    reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    telco_response TEXT
);

-- Wallet ledger table
CREATE TABLE IF NOT EXISTS wallet_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    change REAL,
    balance_after REAL,
    type TEXT CHECK(type IN ('topup','purchase','refund','agent_fee')),
    reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Passwords table
CREATE TABLE IF NOT EXISTS user_passwords (
    user_id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Topup Requests table (for manual admin approval)
CREATE TABLE IF NOT EXISTS topup_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    amount REAL,
    reference TEXT,
    payment_method TEXT,
    status TEXT CHECK(status IN ('pending','approved','rejected')) DEFAULT 'pending',
    admin_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Agent Validations table
CREATE TABLE IF NOT EXISTS agent_validations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    business_name TEXT,
    business_registration_number TEXT,
    id_card_url TEXT,
    status TEXT CHECK(status IN ('pending','approved','rejected')) DEFAULT 'pending',
    admin_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pricing_provider ON pricing(provider);
CREATE INDEX IF NOT EXISTS idx_pricing_product_code ON pricing(product_code);
CREATE INDEX IF NOT EXISTS idx_pricing_is_active ON pricing(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_user_id ON wallet_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_type ON wallet_ledger(type);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_created_at ON wallet_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_topup_requests_status ON topup_requests(status);
CREATE INDEX IF NOT EXISTS idx_agent_validations_status ON agent_validations(status);