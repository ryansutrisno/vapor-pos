-- Insert demo users (skip superadmin as it already exists)
INSERT INTO users (email, name, role, tenant_id, subscription_plan, is_active) VALUES 
  ('admin@demo.com', 'Demo Admin', 'admin', '22222222-2222-2222-2222-222222222222', 'multi_store_5', true),
  ('warehouse@demo.com', 'Demo Warehouse', 'warehouse', '22222222-2222-2222-2222-222222222222', 'multi_store_5', true),
  ('kasir@demo.com', 'Demo Kasir', 'kasir', '22222222-2222-2222-2222-222222222222', 'multi_store_5', true)
ON CONFLICT (email) DO NOTHING;

-- Get the admin user ID for demo tenant
DO $$
DECLARE
    admin_user_id UUID;
    store1_id UUID := gen_random_uuid();
    store2_id UUID := gen_random_uuid();
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@demo.com';
    
    -- Insert demo stores
     INSERT INTO stores (id, name, address, admin_id, tenant_id, is_active) VALUES 
       (store1_id, 'Vapor Store Central', 'Jl. Sudirman No. 123, Jakarta Pusat', admin_user_id, '22222222-2222-2222-2222-222222222222', true),
       (store2_id, 'Vapor Store Kemang', 'Jl. Kemang Raya No. 45, Jakarta Selatan', admin_user_id, '22222222-2222-2222-2222-222222222222', true)
     ON CONFLICT (id) DO NOTHING;

     -- Insert demo products for store 1
     INSERT INTO products (name, category, price, stock, store_id, tenant_id, description) VALUES 
       -- Device products
       ('SMOK Nord 4', 'device', 450000, 25, store1_id, '22222222-2222-2222-2222-222222222222', 'Pod system dengan battery 2000mAh'),
       ('Vaporesso XROS 3', 'device', 350000, 30, store1_id, '22222222-2222-2222-2222-222222222222', 'Pod system compact dengan airflow adjustable'),
       ('GeekVape Aegis Legend 2', 'device', 850000, 15, store1_id, '22222222-2222-2222-2222-222222222222', 'Mod tahan air dengan chipset AS-100'),
       
       -- Liquid products
       ('Salt Nic Mango Ice 30ml', 'liquid', 85000, 50, store1_id, '22222222-2222-2222-2222-222222222222', 'Salt nicotine 25mg rasa mangga dingin'),
       ('Freebase Strawberry Cream 60ml', 'liquid', 120000, 40, store1_id, '22222222-2222-2222-2222-222222222222', 'Freebase 3mg rasa strawberry cream'),
       ('Premium Liquid Vanilla Custard 60ml', 'liquid', 150000, 35, store1_id, '22222222-2222-2222-2222-222222222222', 'Premium liquid rasa vanilla custard'),
       
       -- Peripheral products
       ('Coil SMOK LP2 0.23ohm', 'peripheral', 45000, 100, store1_id, '22222222-2222-2222-2222-222222222222', 'Replacement coil untuk SMOK Nord series'),
       ('Cotton Bacon Prime', 'peripheral', 65000, 80, store1_id, '22222222-2222-2222-2222-222222222222', 'Organic cotton untuk RDA/RTA'),
       ('Wire Kanthal A1 24AWG', 'peripheral', 35000, 60, store1_id, '22222222-2222-2222-2222-222222222222', 'Kawat kanthal untuk coil building'),
       
       -- Service
       ('Jasa Recoil RDA', 'service', 25000, 999, store1_id, '22222222-2222-2222-2222-222222222222', 'Jasa pembuatan coil untuk RDA'),
       ('Jasa Recoil RTA', 'service', 30000, 999, store1_id, '22222222-2222-2222-2222-222222222222', 'Jasa pembuatan coil untuk RTA');

     -- Insert demo products for store 2
     INSERT INTO products (name, category, price, stock, store_id, tenant_id, description) VALUES 
       ('SMOK Nord 4', 'device', 450000, 20, store2_id, '22222222-2222-2222-2222-222222222222', 'Pod system dengan battery 2000mAh'),
       ('Salt Nic Mango Ice 30ml', 'liquid', 85000, 45, store2_id, '22222222-2222-2222-2222-222222222222', 'Salt nicotine 25mg rasa mangga dingin'),
       ('Coil SMOK LP2 0.23ohm', 'peripheral', 45000, 80, store2_id, '22222222-2222-2222-2222-222222222222', 'Replacement coil untuk SMOK Nord series'),
       ('Jasa Recoil RDA', 'service', 25000, 999, store2_id, '22222222-2222-2222-2222-222222222222', 'Jasa pembuatan coil untuk RDA');

END $$;

-- Insert demo orders
INSERT INTO orders (email, plan_type, billing_cycle, amount, payment_status) VALUES 
  ('newcustomer@example.com', 'single_store', 'yearly', 500000, 'pending'),
  ('business@example.com', 'multi_store_5', 'monthly', 150000, 'pending')
ON CONFLICT DO NOTHING;