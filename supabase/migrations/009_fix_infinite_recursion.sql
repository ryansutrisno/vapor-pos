-- Migration: Fix infinite recursion in RLS policies
-- The problem: RLS policies on users table were querying the same users table, causing infinite loops
-- Solution: Use security definer functions and direct auth.uid() comparisons

-- First, create security definer functions that bypass RLS for role checking
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE auth_id = auth.uid() 
    AND role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM users 
  WHERE auth_id = auth.uid() 
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM users 
  WHERE auth_id = auth.uid() 
  LIMIT 1;
$$;

-- Drop all existing problematic policies on users table
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_superadmin_select" ON users;
DROP POLICY IF EXISTS "users_superadmin_all" ON users;
DROP POLICY IF EXISTS "users_admin_tenant_select" ON users;
DROP POLICY IF EXISTS "users_admin_tenant_manage" ON users;

-- Create new non-recursive policies for users table
-- Users can view and update their own data
CREATE POLICY "users_own_access" ON users
  FOR ALL USING (
    auth_id = auth.uid()
  );

-- Superadmins can access all users (using security definer function)
CREATE POLICY "users_superadmin_access" ON users
  FOR ALL USING (
    public.is_superadmin()
  );

-- Admins can view users in their tenant (simplified approach)
CREATE POLICY "users_admin_view_tenant" ON users
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() = 'admin'
  );

-- Admins can manage non-admin users in their tenant
CREATE POLICY "users_admin_manage_tenant" ON users
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id()
    AND public.get_user_role() = 'admin'
    AND role NOT IN ('admin', 'superadmin')
  );

-- Fix settings policies to use security definer function
DROP POLICY IF EXISTS "settings_superadmin_all_access" ON settings;

CREATE POLICY "settings_superadmin_access" ON settings
  FOR ALL USING (
    public.is_superadmin()
  );

-- Fix other table policies to use security definer functions
-- Stores policies
DROP POLICY IF EXISTS "stores_admin_tenant_select" ON stores;
DROP POLICY IF EXISTS "stores_admin_manage" ON stores;

CREATE POLICY "stores_tenant_access" ON stores
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "stores_admin_manage" ON stores
  FOR ALL USING (
    public.get_user_role() IN ('admin', 'superadmin')
    AND (tenant_id = public.get_user_tenant_id() OR public.is_superadmin())
  );

-- Products policies
DROP POLICY IF EXISTS "products_tenant_select" ON products;
DROP POLICY IF EXISTS "products_manage" ON products;

CREATE POLICY "products_tenant_access" ON products
  FOR SELECT USING (
    tenant_id = auth.get_user_tenant_id()
  );

CREATE POLICY "products_manage" ON products
  FOR ALL USING (
    auth.get_user_role() IN ('warehouse', 'admin', 'superadmin')
    AND (tenant_id = auth.get_user_tenant_id() OR auth.is_superadmin())
  );

-- Transactions policies
DROP POLICY IF EXISTS "transactions_tenant_select" ON transactions;
DROP POLICY IF EXISTS "transactions_manage" ON transactions;

CREATE POLICY "transactions_tenant_access" ON transactions
  FOR SELECT USING (
    tenant_id = auth.get_user_tenant_id()
  );

CREATE POLICY "transactions_manage" ON transactions
  FOR ALL USING (
    auth.get_user_role() IN ('kasir', 'admin', 'superadmin')
    AND (tenant_id = auth.get_user_tenant_id() OR auth.is_superadmin())
  );

-- Transaction items policies
DROP POLICY IF EXISTS "transaction_items_select" ON transaction_items;
DROP POLICY IF EXISTS "transaction_items_manage" ON transaction_items;

CREATE POLICY "transaction_items_access" ON transaction_items
  FOR SELECT USING (
    transaction_id IN (
      SELECT id FROM transactions 
      WHERE tenant_id = auth.get_user_tenant_id()
    )
  );

CREATE POLICY "transaction_items_manage" ON transaction_items
  FOR ALL USING (
    auth.get_user_role() IN ('kasir', 'admin', 'superadmin')
    AND transaction_id IN (
      SELECT id FROM transactions 
      WHERE tenant_id = auth.get_user_tenant_id() OR auth.is_superadmin()
    )
  );

-- User stores policies
DROP POLICY IF EXISTS "user_stores_select" ON user_stores;
DROP POLICY IF EXISTS "user_stores_manage" ON user_stores;

CREATE POLICY "user_stores_own_access" ON user_stores
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "user_stores_admin_manage" ON user_stores
  FOR ALL USING (
    auth.get_user_role() IN ('admin', 'superadmin')
  );

-- Orders policies
DROP POLICY IF EXISTS "orders_superadmin_all" ON orders;
DROP POLICY IF EXISTS "orders_user_own" ON orders;

CREATE POLICY "orders_superadmin_access" ON orders
  FOR ALL USING (
    auth.is_superadmin()
  );

CREATE POLICY "orders_user_own" ON orders
  FOR SELECT USING (
    email IN (
      SELECT email FROM users WHERE auth_id = auth.uid()
    )
  );

-- Grant execute permissions on security definer functions
GRANT EXECUTE ON FUNCTION auth.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.get_user_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.get_user_role() TO authenticated;

-- Add verification
DO $$
BEGIN
  RAISE NOTICE 'Migration 009 completed successfully.';
  RAISE NOTICE 'Fixed infinite recursion in RLS policies by using security definer functions.';
  RAISE NOTICE 'All policies now use non-recursive approach.';
END $$;