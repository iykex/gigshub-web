#!/bin/bash

# Sync Local D1 Database to Remote
# This script syncs users and passwords from local to remote D1

echo "🔄 Syncing Local D1 to Remote..."
echo "================================"
echo ""

echo "⚠️  WARNING: This will sync all local data to remote!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Create password table on remote if it doesn't exist
echo ""
echo "🔐 Creating password table on remote..."
npx wrangler d1 execute gigshub-db --remote --command "
  CREATE TABLE IF NOT EXISTS user_passwords (
    user_id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
"

# Get user data from local and insert to remote
echo ""
echo "👥 Syncing users to remote..."
npx wrangler d1 execute gigshub-db --command "SELECT id, name, phone, email, role, wallet_balance, created_at FROM users;" | \
  tail -n +8 | head -n -1 | while IFS='│' read -r _ id name phone email role balance created _; do
    # Trim whitespace
    id=$(echo "$id" | xargs)
    name=$(echo "$name" | xargs)
    phone=$(echo "$phone" | xargs)
    email=$(echo "$email" | xargs)
    role=$(echo "$role" | xargs)
    balance=$(echo "$balance" | xargs)
    created=$(echo "$created" | xargs)
    
    if [ ! -z "$id" ] && [ "$id" != "id" ]; then
      echo "  Syncing user: $email"
      npx wrangler d1 execute gigshub-db --remote --command "
        INSERT OR REPLACE INTO users (id, name, phone, email, role, wallet_balance, created_at)
        VALUES ('$id', '$name', '$phone', '$email', '$role', $balance, '$created');
      " > /dev/null 2>&1
    fi
  done

# Get password data from local and insert to remote
echo ""
echo "🔐 Syncing passwords to remote..."
npx wrangler d1 execute gigshub-db --command "SELECT user_id, password_hash, created_at FROM user_passwords;" | \
  tail -n +8 | head -n -1 | while IFS='│' read -r _ user_id hash created _; do
    # Trim whitespace
    user_id=$(echo "$user_id" | xargs)
    hash=$(echo "$hash" | xargs)
    created=$(echo "$created" | xargs)
    
    if [ ! -z "$user_id" ] && [ "$user_id" != "user_id" ]; then
      echo "  Syncing password for user: $user_id"
      npx wrangler d1 execute gigshub-db --remote --command "
        INSERT OR REPLACE INTO user_passwords (user_id, password_hash, created_at)
        VALUES ('$user_id', '$hash', '$created');
      " > /dev/null 2>&1
    fi
  done

echo ""
echo "✅ Sync complete!"
echo ""
echo "Verify with:"
echo "  npx wrangler d1 execute gigshub-db --remote --command \"SELECT COUNT(*) FROM users;\""
echo "  npx wrangler d1 execute gigshub-db --remote --command \"SELECT COUNT(*) FROM user_passwords;\""
