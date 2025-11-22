-- Add AFA Registration Package to D1 Database
-- Run with: npx wrangler d1 execute gigshub-db --remote --file=./scripts/add-afa-package.sql

-- Check if AFA package already exists
-- If it exists, this will show an error which you can ignore

INSERT INTO pricing (provider, name, size, price, agent_price, product_code, is_active)
VALUES ('AFA', 'AFA SIM Registration', 'Standard', 5.00, 4.50, 'AFA-REG-001', 1);

-- Verify it was added
SELECT * FROM pricing WHERE provider = 'AFA';
