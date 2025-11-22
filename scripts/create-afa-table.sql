-- Create AFA Registrations Table
-- Run with: npx wrangler d1 execute gigshub-db --remote --file=./scripts/create-afa-table.sql

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_afa_phone ON afa_registrations(phone_number);
CREATE INDEX IF NOT EXISTS idx_afa_status ON afa_registrations(status);
CREATE INDEX IF NOT EXISTS idx_afa_payment_status ON afa_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_afa_created_at ON afa_registrations(created_at DESC);

-- Verify table was created
SELECT name, sql FROM sqlite_master WHERE type='table' AND name='afa_registrations';
