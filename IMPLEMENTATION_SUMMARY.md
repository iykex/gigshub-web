# Sample Data & Admin Views Implementation

## Summary

I've successfully created sample data for testing and implemented admin views for both AFA registrations and orders.

## What Was Done

### 1. ✅ Created Sample Data
**File**: `scripts/seed-sample-data.sql`

Added sample data for:
- **5 Sample Orders** (transactions with type 'payment' or 'purchase')
  - Various statuses: success, pending, failed
  - Different products: MTN, Telecel, AirtelTigo data bundles
  
- **5 Sample AFA Registrations**
  - 3 completed (paid)
  - 2 pending
  - Realistic Ghanaian names, towns, and ID types

**Run with**: `npm run db:seed-sample`

### 2. ✅ Created Admin AFA Registrations Page
**File**: `src/app/dashboard/admin/afa/page.tsx`

Features:
- 📊 Table view of all AFA registrations
- 🔍 Search by name, phone, town, or ID number
- 🎯 Filter by status (all, completed, pending, failed)
- 👁️ View detailed information in modal
- 📄 Pagination support
- 🎨 Status badges (color-coded)
- 📱 Responsive design

**Access at**: `/dashboard/admin/afa`

### 3. ✅ Created API Endpoint
**Endpoint**: `GET /api/admin/afa-registrations`

Query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search term
- `status` - Filter by status (all, completed, pending, failed)

Returns:
```json
{
  "registrations": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### 4. ✅ Updated Navigation
- Added "AFA Registrations" link to admin sidebar
- Icon: FileText
- Position: Between "Orders" and "Topups"

### 5. ✅ Fixed Vite Proxy
**File**: `vite.config.ts`

Changed proxy from production URL to local:
```typescript
target: 'http://localhost:8788'  // Was: production worker URL
```

**Important**: Restart `npm run dev` for this to take effect!

## Current Database State

After running the sample data script:

### Orders (Transactions)
- **Total**: 6 orders (1 existing + 5 new)
- **Types**: payment, purchase
- **Statuses**: success, pending, failed

### AFA Registrations
- **Total**: 5 registrations
- **Completed**: 3 (with payment references)
- **Pending**: 2 (awaiting payment)

## How to Test

### 1. Restart Dev Server (IMPORTANT!)
```bash
# Stop npm run dev (Ctrl+C)
npm run dev
```

### 2. View Admin Orders
1. Navigate to: `http://localhost:5173/dashboard/admin/orders`
2. You should see **6 orders** now
3. Try searching and filtering

### 3. View AFA Registrations
1. Navigate to: `http://localhost:5173/dashboard/admin/afa`
2. You should see **5 registrations**
3. Try:
   - Searching by name or phone
   - Filtering by status
   - Clicking "View Details" (eye icon)

## Available Scripts

```bash
# Add AFA package to database
npm run db:add-afa

# Seed sample data (orders + AFA registrations)
npm run db:seed-sample

# Create AFA table (already done)
npx wrangler d1 execute gigshub-db --remote --file=./scripts/create-afa-table.sql
```

## Database Queries

Check data directly:

```bash
# View all orders
npx wrangler d1 execute gigshub-db --remote --command "SELECT * FROM transactions WHERE type IN ('purchase', 'payment')"

# View all AFA registrations
npx wrangler d1 execute gigshub-db --remote --command "SELECT * FROM afa_registrations"

# Count by status
npx wrangler d1 execute gigshub-db --remote --command "SELECT status, COUNT(*) as count FROM afa_registrations GROUP BY status"
```

## Next Steps

1. **Restart dev server** to apply vite proxy changes
2. **Test admin orders page** - should show 6 orders
3. **Test AFA registrations page** - should show 5 registrations
4. **Test search and filters** on both pages

## Troubleshooting

### Orders still not showing?
- Make sure you restarted `npm run dev`
- Check browser console for errors
- Verify API is running on port 8788

### AFA page not loading?
- Check that the route exists in App.tsx
- Verify the API endpoint is working: `curl http://localhost:8788/api/admin/afa-registrations`
- Check browser console for errors
