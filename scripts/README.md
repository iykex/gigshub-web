# D1 Database Sync Scripts

This directory contains scripts to manage and sync data to your Cloudflare D1 database.

## Prerequisites

Make sure you have these environment variables set in your `.env` file:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_DATABASE_ID=your_database_id
CLOUDFLARE_API_TOKEN=your_api_token
```

You can find these values in your Cloudflare dashboard or `wrangler.toml`.

## Available Scripts

### 1. Comprehensive Database Sync
```bash
npm run db:sync
```

This script will:
- ✅ Create `pricing` table if it doesn't exist
- ✅ Create `afa_registrations` table if it doesn't exist
- ✅ Add AFA package if not already present
- ✅ Show database statistics

**Use this script when:**
- Setting up the database for the first time
- Ensuring all tables and data are in sync
- Checking database status

### 2. Add AFA Package Only
```bash
npm run db:add-afa
```

This script will:
- ✅ Check if AFA package exists
- ✅ Add AFA package if missing
- ⚠️ Skip if already exists

**Use this script when:**
- You only need to add the AFA registration package
- You've already run the full sync before

## AFA Package Details

The scripts will add this package to your database:

```json
{
  "provider": "AFA",
  "name": "AFA SIM Registration",
  "size": "Standard",
  "price": 5.00,
  "agent_price": 4.50,
  "product_code": "AFA-REG-001",
  "is_active": 1
}
```

## Troubleshooting

### Error: Missing environment variables
Make sure your `.env` file contains all required Cloudflare credentials.

### Error: API request failed
- Check that your API token has D1 database permissions
- Verify your account ID and database ID are correct
- Ensure you're connected to the internet

### Package already exists
If the AFA package already exists, you can update it via:
- Admin dashboard at `/dashboard/admin/stores`
- Or manually via Cloudflare D1 console

## Manual Database Access

You can also access your D1 database directly:

```bash
# Open D1 console
npx wrangler d1 execute gigshub-db --command "SELECT * FROM pricing WHERE provider = 'AFA'"

# Execute SQL file
npx wrangler d1 execute gigshub-db --file=./scripts/your-script.sql
```

## Next Steps After Running Scripts

1. Visit `http://localhost:5173/stores/afa-registration`
2. The AFA registration fee should now display
3. You can update pricing at `/dashboard/admin/stores` under the "AFA" tab
