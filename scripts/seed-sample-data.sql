-- Add Sample Data for Testing
-- Run with: npx wrangler d1 execute gigshub-db --remote --file=./scripts/seed-sample-data.sql

-- Add sample transactions (orders)
INSERT INTO transactions (id, user_id, type, amount, status, reference, description, created_at)
VALUES 
    ('1763820000001-sample1', '1763638281488-zncf12x9u', 'payment', 10.00, 'success', 'ORD-1763820000001-001', 'MTN 5GB Data Bundle', '2025-11-22 14:00:00'),
    ('1763820000002-sample2', '1763638281488-zncf12x9u', 'payment', 15.00, 'success', 'ORD-1763820000002-002', 'Telecel 10GB Data Bundle', '2025-11-22 14:15:00'),
    ('1763820000003-sample3', '1763638281488-zncf12x9u', 'payment', 8.00, 'pending', 'ORD-1763820000003-003', 'AirtelTigo 3GB Data Bundle', '2025-11-22 14:30:00'),
    ('1763820000004-sample4', '1763638281488-zncf12x9u', 'purchase', 20.00, 'success', 'ORD-1763820000004-004', 'MTN 20GB Data Bundle', '2025-11-22 14:45:00'),
    ('1763820000005-sample5', '1763638281488-zncf12x9u', 'payment', 5.00, 'failed', 'ORD-1763820000005-005', 'Telecel 2GB Data Bundle', '2025-11-22 15:00:00');

-- Add sample AFA registrations
INSERT INTO afa_registrations (full_name, phone_number, town, occupation, id_number, id_type, package_id, amount, payment_reference, payment_status, status, created_at)
VALUES 
    ('Kwame Mensah', '0244123456', 'Accra', 'Teacher', 'GHA-123456789-0', 'NATIONAL_ID', 123, 5.00, 'PAY-AFA-001', 'paid', 'completed', '2025-11-22 10:00:00'),
    ('Ama Asante', '0554987654', 'Kumasi', 'Trader', 'GHA-987654321-1', 'NATIONAL_ID', 123, 5.00, 'PAY-AFA-002', 'paid', 'completed', '2025-11-22 11:30:00'),
    ('Kofi Boateng', '0204567890', 'Takoradi', 'Driver', 'VID-2024-12345', 'VOTER_ID', 123, 5.00, 'PAY-AFA-003', 'paid', 'completed', '2025-11-22 12:15:00'),
    ('Akua Owusu', '0274321098', 'Tema', 'Nurse', 'GHA-456789012-2', 'NATIONAL_ID', 123, 5.00, 'PAY-AFA-004', 'pending', 'pending', '2025-11-22 13:00:00'),
    ('Yaw Asamoah', '0501234567', 'Cape Coast', 'Student', 'GHA-789012345-3', 'NATIONAL_ID', 123, 5.00, NULL, 'pending', 'pending', '2025-11-22 14:00:00');

-- Verify data was inserted
SELECT 'Transactions Count:' as info, COUNT(*) as count FROM transactions WHERE type IN ('purchase', 'payment');
SELECT 'AFA Registrations Count:' as info, COUNT(*) as count FROM afa_registrations;
