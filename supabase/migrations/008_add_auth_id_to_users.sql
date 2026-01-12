-- Migration: Add auth_id column to users table to link with Supabase Auth
-- This fixes the mismatch between auth user ID and database user ID

-- Add auth_id column to users table
ALTER TABLE users ADD COLUMN auth_id UUID;

-- Create unique index on auth_id for performance and uniqueness
CREATE UNIQUE INDEX idx_users_auth_id ON users(auth_id) WHERE auth_id IS NOT NULL;

-- For existing users, set auth_id = id as a temporary measure
-- This will be updated by the setup script for proper auth linking
UPDATE users SET auth_id = id WHERE auth_id IS NULL;

-- Add comment to document the purpose of auth_id column
COMMENT ON COLUMN users.auth_id IS 'UUID from Supabase Auth that links to auth.uid(). Used for RLS policies and authentication.';

-- Update RLS policies to use auth_id instead of id for auth matching
-- Drop existing policies that use auth.uid() = id
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Superadmins can view all users" ON users;
DROP POLICY IF EXISTS "Superadmins can manage all users" ON users;

-- Create new RLS policies using auth_id
-- Users can view their own data
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (
    auth_id = auth.uid()
  );

-- Users can update their own data (limited fields)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (
    auth_id = auth.uid()
  ) WITH CHECK (
    auth_id = auth.uid()
  );

-- Superadmins can view all users
CREATE POLICY "users_superadmin_select" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid() 
      AND u.role = 'superadmin'
    )
  );

-- Superadmins can manage all users
CREATE POLICY "users_superadmin_all" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid() 
      AND u.role = 'superadmin'
    )
  );

-- Admins can view users in their tenant
CREATE POLICY "users_admin_tenant_select" ON users
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users u
      WHERE u.auth_id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- Admins can manage users in their tenant (except other admins)
CREATE POLICY "users_admin_tenant_manage" ON users
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users u
      WHERE u.auth_id = auth.uid() 
      AND u.role = 'admin'
    )
    AND role != 'admin' -- Admins cannot manage other admins
    AND role != 'superadmin' -- Admins cannot manage superadmins
  );

-- Update settings RLS policies to use auth_id
DROP POLICY IF EXISTS "settings_superadmin_all_access" ON settings;

-- Recreate settings policy with auth_id
CREATE POLICY "settings_superadmin_all_access" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- Update other table policies to use auth_id where needed
-- Stores policies
DROP POLICY IF EXISTS "Admins can view stores in their tenant" ON stores;
DROP POLICY IF EXISTS "Admins can manage stores in their tenant" ON stores;

CREATE POLICY "stores_admin_tenant_select" ON stores
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "stores_admin_manage" ON stores
  FOR ALL USING (
    admin_id IN (
      SELECT id FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Products policies
DROP POLICY IF EXISTS "Users can view products in their tenant" ON products;
DROP POLICY IF EXISTS "Warehouse and admins can manage products" ON products;

CREATE POLICY "products_tenant_select" ON products
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "products_manage" ON products
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('warehouse', 'admin', 'superadmin')
    )
  );

-- Transactions policies
DROP POLICY IF EXISTS "Users can view transactions in their tenant" ON transactions;
DROP POLICY IF EXISTS "Kasir and admins can manage transactions" ON transactions;

CREATE POLICY "transactions_tenant_select" ON transactions
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "transactions_manage" ON transactions
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('kasir', 'admin', 'superadmin')
    )
  );

-- Transaction items policies
DROP POLICY IF EXISTS "Users can view transaction items in their tenant" ON transaction_items;
DROP POLICY IF EXISTS "Kasir and admins can manage transaction items" ON transaction_items;

CREATE POLICY "transaction_items_select" ON transaction_items
  FOR SELECT USING (
    transaction_id IN (
      SELECT id FROM transactions 
      WHERE tenant_id IN (
        SELECT tenant_id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "transaction_items_manage" ON transaction_items
  FOR ALL USING (
    transaction_id IN (
      SELECT id FROM transactions 
      WHERE tenant_id IN (
        SELECT tenant_id FROM users 
        WHERE auth_id = auth.uid() 
        AND role IN ('kasir', 'admin', 'superadmin')
      )
    )
  );

-- User stores policies
DROP POLICY IF EXISTS "Users can view their store assignments" ON user_stores;
DROP POLICY IF EXISTS "Admins can manage store assignments" ON user_stores;

CREATE POLICY "user_stores_select" ON user_stores
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "user_stores_manage" ON user_stores
  FOR ALL USING (
    store_id IN (
      SELECT id FROM stores 
      WHERE tenant_id IN (
        SELECT tenant_id FROM users 
        WHERE auth_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    )
  );

-- Orders policies
DROP POLICY IF EXISTS "Superadmins can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Superadmins can manage all orders" ON orders;

CREATE POLICY "orders_superadmin_all" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role = 'superadmin'
    )
  );

CREATE POLICY "orders_user_own" ON orders
  FOR SELECT USING (
    email IN (
      SELECT email FROM users WHERE auth_id = auth.uid()
    )
  );

-- Add verification query
DO $$
BEGIN
  RAISE NOTICE 'Migration 008 completed successfully.';
  RAISE NOTICE 'Added auth_id column to users table and updated all RLS policies.';
  RAISE NOTICE 'Users table now has % users with auth_id set.', 
    (SELECT COUNT(*) FROM users WHERE auth_id IS NOT NULL);
END $$;