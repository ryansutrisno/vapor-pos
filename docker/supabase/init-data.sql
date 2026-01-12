-- Supabase Local Development Initialization
-- This script runs on first container startup to seed test data

-- Test tenant ID for development
DO $$
BEGIN
    -- Create demo tenant if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
        RAISE NOTICE 'Tables not found, migrations will be applied separately';
    END IF;
END $$;

-- Insert test users with known passwords (password: test123)
-- Password hash: $2b$10$dummyhashreplacewithrealhash
INSERT INTO users (id, email, name, role, tenant_id, subscription_plan, is_active, email_verified, is_trial_user, created_at, updated_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'superadmin@test.com', 'Test Superadmin', 'superadmin', NULL, 'single_store', true, true, false, NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'admin@test.com', 'Test Admin', 'admin', '33333333-3333-3333-3333-333333333333', 'multi_store_5', true, true, false, NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'warehouse@test.com', 'Test Warehouse', 'warehouse', '33333333-3333-3333-3333-333333333333', 'multi_store_5', true, true, false, NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', 'kasir@test.com', 'Test Kasir', 'kasir', '33333333-3333-3333-3333-333333333333', 'multi_store_5', true, true, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo stores for the admin tenant
INSERT INTO stores (id, name, address, admin_id, tenant_id, is_active, created_at) VALUES
    ('aaaa1111-1111-1111-1111-111111111111', 'Vapor Store Central', 'Jl. Sudirman No. 123, Jakarta Pusat', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', true, NOW()),
    ('aaaa2222-2222-2222-2222-222222222222', 'Vapor Store Kemang', 'Jl. Kemang Raya No. 45, Jakarta Selatan', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo products for Store 1
INSERT INTO products (id, name, category, price, stock, store_id, tenant_id, image_url, description, created_at, updated_at) VALUES
    -- Device products
    ('p0010001-1111-1111-1111-111111111111', 'SMOK Nord 4', 'device', 450000.00, 25, 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'https://example.com/smok-nord-4.jpg', 'Pod system dengan battery 2000mAh', NOW(), NOW()),
    ('p0010002-1111-1111-1111-111111111111', 'Vaporesso XROS 3', 'device', 350000.00, 30, 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'https://example.com/vaporesso-xros-3.jpg', 'Pod system compact dengan airflow adjustable', NOW(), NOW()),
    ('p0010003-1111-1111-1111-111111111111', 'GeekVape Aegis Legend 2', 'device', 850000.00, 15, 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'https://example.com/aegis-legend-2.jpg', 'Mod tahan air dengan chipset AS-100', NOW(), NOW()),
    -- Liquid products
    ('p0020001-1111-1111-1111-111111111111', 'Salt Nic Mango Ice 30ml', 'liquid', 85000.00, 50, 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'https://example.com/mango-ice.jpg', 'Salt nicotine 25mg rasa mangga dingin', NOW(), NOW()),
    ('p0020002-1111-1111-1111-111111111111', 'Freebase Strawberry Cream 60ml', 'liquid', 120000.00, 40, 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'https://example.com/strawberry-cream.jpg', 'Freebase 3mg rasa strawberry cream', NOW(), NOW()),
    ('p0020003-1111-1111-1111-111111111111', 'Premium Liquid Vanilla Custard 60ml', 'liquid', 150000.00, 35, 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'https://example.com/vanilla-custard.jpg', 'Premium liquid rasa vanilla custard', NOW(), NOW()),
    -- Peripheral products
    ('p0030001-1111-1111-1111-111111111111', 'Coil SMOK LP2 0.23ohm', 'peripheral', 45000.00, 100, 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'https://example.com/coil-lp2.jpg', 'Replacement coil untuk SMOK Nord series', NOW(), NOW()),
    ('p0030002-1111-1111-1111-111111111111', 'Cotton Bacon Prime', 'peripheral', 65000.00, 80, 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'https://example.com/cotton-bacon.jpg', 'Organic cotton untuk RDA/RTA', NOW(), NOW()),
    ('p0030003-1111-1111-1111-111111111111', 'Wire Kanthal A1 24AWG', 'peripheral', 35000.00, 60, 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'https://example.com/kanthal-a1.jpg', 'Kawat kanthal untuk coil building', NOW(), NOW()),
    -- Service products
    ('p0040001-1111-1111-1111-111111111111', 'Jasa Recoil RDA', 'service', 25000.00, 999, 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'Jasa pembuatan coil untuk RDA', NOW(), NOW()),
    ('p0040002-1111-1111-1111-111111111111', 'Jasa Recoil RTA', 'service', 30000.00, 999, 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NULL, 'Jasa pembuatan coil untuk RTA', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo products for Store 2
INSERT INTO products (id, name, category, price, stock, store_id, tenant_id, image_url, description, created_at, updated_at) VALUES
    ('p0010004-2222-2222-2222-222222222222', 'SMOK Nord 4', 'device', 450000.00, 20, 'aaaa2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'https://example.com/smok-nord-4.jpg', 'Pod system dengan battery 2000mAh', NOW(), NOW()),
    ('p0020004-2222-2222-2222-222222222222', 'Salt Nic Mango Ice 30ml', 'liquid', 85000.00, 45, 'aaaa2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'https://example.com/mango-ice.jpg', 'Salt nicotine 25mg rasa mangga dingin', NOW(), NOW()),
    ('p0030004-2222-2222-2222-222222222222', 'Coil SMOK LP2 0.23ohm', 'peripheral', 45000.00, 80, 'aaaa2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'https://example.com/coil-lp2.jpg', 'Replacement coil untuk SMOK Nord series', NOW(), NOW()),
    ('p0040003-2222-2222-2222-222222222222', 'Jasa Recoil RDA', 'service', 25000.00, 999, 'aaaa2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NULL, 'Jasa pembuatan coil untuk RDA', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert user-store assignments
INSERT INTO user_stores (id, user_id, store_id, assigned_at) VALUES
    ('us001-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111', NOW()),
    ('us002-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', NOW()),
    ('us003-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'aaaa1111-1111-1111-1111-111111111111', NOW()),
    ('us004-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'aaaa1111-1111-1111-1111-111111111111', NOW()),
    ('us005-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'aaaa2222-2222-2222-2222-222222222222', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert global settings
INSERT INTO settings (id, key, value, tenant_id, created_at, updated_at) VALUES
    ('s001-sendgrid-api', 'sendgrid_api_key', 'dummy-sendgrid-key', NULL, NOW(), NOW()),
    ('s002-sendgrid-email', 'sendgrid_from_email', 'noreply@vaporpos.local', NULL, NOW(), NOW()),
    ('s003-sendgrid-name', 'sendgrid_from_name', 'VaporPOS Dev', NULL, NOW(), NOW()),
    ('s004-midtrans-server', 'midtrans_server_key', 'dummy-midtrans-key', NULL, NOW(), NOW()),
    ('s005-midtrans-production', 'midtrans_is_production', 'false', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo orders for testing
INSERT INTO orders (id, email, plan_type, billing_cycle, amount, payment_status, customer_name, customer_phone, customer_company, created_at) VALUES
    ('ord001-1111-1111-1111-111111111111', 'customer1@example.com', 'single_store', 'monthly', 250000.00, 'pending', 'John Doe', '08123456789', 'Test Company', NOW()),
    ('ord002-2222-2222-2222-222222222222', 'customer2@example.com', 'multi_store_5', 'yearly', 1500000.00, 'pending', 'Jane Smith', '08123456790', 'Business Corp', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Customer Seed Data (Added for WhatsApp feature)
-- ============================================
INSERT INTO customers (id, tenant_id, name, phone, email, total_transactions, total_spent, created_at) VALUES
    ('cust001-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Ahmad Wijaya', '6281234567890', 'ahmad@example.com', 5, 2500000.00, NOW()),
    ('cust002-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Budi Santoso', '6282345678901', 'budi@example.com', 3, 1500000.00, NOW()),
    ('cust003-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Citra Dewi', '6283456789012', 'citra@example.com', 8, 4200000.00, NOW()),
    ('cust004-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Dodi Prasetyo', '6284567890123', 'dodi@example.com', 2, 850000.00, NOW()),
    ('cust005-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Eka Susanto', '6285678901234', 'eka@example.com', 12, 6800000.00, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Tenant Settings with WhatsApp & Receipt Config
-- ============================================
INSERT INTO tenant_settings (id, tenant_id, fonnte_api_key, use_fonnte, use_wa_link_fallback, tax_rate, receipt_paper_size, receipt_show_logo, receipt_show_qrcode, receipt_footer_text, receipt_thank_you_message, created_at, updated_at) VALUES
    ('ts001-demo-tenant-settings', '33333333-3333-3333-3333-333333333333', NULL, false, true, 11.00, '80mm', false, false, 'Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan', 'Terima kasih atas kunjungan Anda!', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Update transactions with customer_id references
-- ============================================
-- This is a sample update for demonstration
-- In production, customer_id would be set during checkout
-- UPDATE transactions 
-- SET customer_id = 'cust001-1111-1111-1111-111111111111'
-- WHERE tenant_id = '33333333-3333-3333-3333-333333333333' 
-- AND customer_id IS NULL
-- LIMIT 5;

RAISE NOTICE 'Test data and customer seeder seeded successfully';
