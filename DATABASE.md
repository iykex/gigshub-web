# GiGSHUB Database Guide

## Overview
GiGSHUB uses **Cloudflare D1**, a serverless SQLite database, for storing pricing, users, orders, and wallet transactions.

## Database Configuration
The D1 database is configured in `wrangler.toml`:
- **Database Name**: `gigshub-db`
- **Database ID**: `5975a6ae-df3c-44c3-a1c7-25d3b497ce51`
- **Binding**: `DB` (accessible in your app as `env.DB`)

## Database Schema

### Tables

#### 1. **users**
Stores user account information
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    email TEXT,
    role TEXT CHECK(role IN ('guest','user','agent','admin')) DEFAULT 'guest',
    wallet_balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **pricing**
Stores data package pricing (MTN, Telecel, AirtelTigo)
```sql
CREATE TABLE pricing (
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
```

#### 3. **pricing_audit**
Audit log for pricing changes
```sql
CREATE TABLE pricing_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pricing_id INTEGER,
    old_price REAL,
    new_price REAL,
    changed_by TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    comment TEXT
);
```

#### 4. **orders**
Stores all purchase orders
```sql
CREATE TABLE orders (
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
```

#### 5. **wallet_ledger**
Tracks all wallet transactions
```sql
CREATE TABLE wallet_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    change REAL,
    balance_after REAL,
    type TEXT CHECK(type IN ('topup','purchase','refund','agent_fee')),
    reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## NPM Scripts

### Quick Commands
```bash
# Apply schema (create all tables and indexes)
npm run db:schema

# Seed pricing data (38 packages: MTN, Telecel, AirtelTigo)
npm run db:seed

# Test database queries
npm run db:test

# Reset database (drop and recreate with seed data)
npm run db:reset
```

### Manual Wrangler Commands
```bash
# List all D1 databases
npx wrangler d1 list

# Execute SQL file
npx wrangler d1 execute gigshub-db --file=./scripts/schema.sql

# Execute SQL command
npx wrangler d1 execute gigshub-db --command "SELECT * FROM pricing LIMIT 5;"

# Access D1 console (interactive SQL)
npx wrangler d1 console gigshub-db
```

## API Endpoints

### GET `/api/pricing`
Fetch all active pricing packages

**Query Parameters:**
- `provider` (optional): Filter by provider (MTN, Telecel, AirtelTigo)

**Example:**
```bash
# Get all packages
curl http://localhost:3000/api/pricing

# Get MTN packages only
curl http://localhost:3000/api/pricing?provider=MTN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "provider": "MTN",
      "name": "MTN Regular 1GB",
      "size": "1GB",
      "price": 5.5,
      "agent_price": 4.9,
      "product_code": "mtn_reg_1gb",
      "is_active": 1,
      "updated_by": null,
      "updated_at": "2025-11-20T08:29:00.000Z",
      "version": 1
    }
  ],
  "count": 38
}
```

## Database Helper Functions

Located in `lib/db.ts`:

```typescript
import { getDB, getAllPricing, getPricingByProvider, getPricingById, getProviders } from '@/lib/db'

// In an API route or server component
export async function GET(request: NextRequest) {
  const db = getDB(process.env)
  
  // Get all pricing
  const allPricing = await getAllPricing(db)
  
  // Get pricing by provider
  const mtnPricing = await getPricingByProvider(db, 'MTN')
  
  // Get single pricing package
  const package = await getPricingById(db, 1)
  
  // Get list of providers
  const providers = await getProviders(db)
}
```

## Current Data

### Pricing Packages (38 total)
- **MTN**: 13 packages (1GB - 100GB)
- **Telecel**: 9 packages (5GB - 100GB)
- **AirtelTigo**: 16 packages (iShare: 1GB - 15GB, Bigtime: 20GB - 200GB)

### Pricing Summary
Run `npm run db:test` to see:
- Total packages count
- Packages per provider
- Sample package details
- Table row counts

## Local vs Remote

### Local Development (Default)
Commands run against local SQLite database in `.wrangler/state/v3/d1/`

### Remote (Production)
Add `--remote` flag to work with the live Cloudflare D1 database:
```bash
npx wrangler d1 execute gigshub-db --remote --file=./scripts/schema.sql
```

## Troubleshooting

### Database not found
```bash
# Verify database exists
npx wrangler d1 list

# Check wrangler.toml configuration
cat wrangler.toml
```

### No data returned
```bash
# Verify tables exist
npx wrangler d1 execute gigshub-db --command "SELECT name FROM sqlite_master WHERE type='table';"

# Check pricing data
npx wrangler d1 execute gigshub-db --command "SELECT COUNT(*) FROM pricing;"
```

### Reset everything
```bash
# Clear local database and reseed
rm -rf .wrangler/state/v3/d1/
npm run db:reset
```

## Next Steps

1. **Create API routes** for orders, users, and wallet operations
2. **Add authentication** to protect admin endpoints
3. **Implement migrations** for schema version control
4. **Set up production deployment** with `--remote` flag
5. **Create admin UI** for pricing management
6. **Add audit logging** for all price changes

## Resources
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
