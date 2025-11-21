#!/bin/bash

# Test D1 Database Connection and Queries

echo "🔍 Testing GiGSHUB D1 Database"
echo "================================"
echo ""

# Test 1: Count all pricing records
echo "📊 Test 1: Total pricing records"
npx wrangler d1 execute gigshub-db --command "SELECT COUNT(*) as total FROM pricing;"
echo ""

# Test 2: Count by provider
echo "📊 Test 2: Packages by provider"
npx wrangler d1 execute gigshub-db --command "SELECT provider, COUNT(*) as packages FROM pricing GROUP BY provider;"
echo ""

# Test 3: Sample MTN packages
echo "📊 Test 3: MTN Packages (first 5)"
npx wrangler d1 execute gigshub-db --command "SELECT id, name, size, price, agent_price FROM pricing WHERE provider = 'MTN' LIMIT 5;"
echo ""

# Test 4: Check users table
echo "📊 Test 4: Users table structure"
npx wrangler d1 execute gigshub-db --command "SELECT COUNT(*) as total_users FROM users;"
echo ""

# Test 5: Check orders table
echo "📊 Test 5: Orders table structure"
npx wrangler d1 execute gigshub-db --command "SELECT COUNT(*) as total_orders FROM orders;"
echo ""

echo "✅ Database tests complete!"
