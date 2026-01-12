-- Create RLS policies for all tables

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.email() = email);

-- Allow service role to manage all users (for admin operations)
CREATE POLICY "Service role can manage all users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Stores table policies
CREATE POLICY "Users can view stores in their tenant" ON stores
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE email = auth.email()
    )
  );

CREATE POLICY "Admins can manage stores in their tenant" ON stores
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE email = auth.email() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Products table policies
CREATE POLICY "Users can view products in their tenant" ON products
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE email = auth.email()
    )
  );

CREATE POLICY "Warehouse and admins can manage products" ON products
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE email = auth.email() 
      AND role IN ('warehouse', 'admin', 'superadmin')
    )
  );

-- Transactions table policies
CREATE POLICY "Users can view transactions in their tenant" ON transactions
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE email = auth.email()
    )
  );

CREATE POLICY "Kasir and admins can manage transactions" ON transactions
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE email = auth.email() 
      AND role IN ('kasir', 'admin', 'superadmin')
    )
  );

-- Transaction items table policies
CREATE POLICY "Users can view transaction items in their tenant" ON transaction_items
  FOR SELECT USING (
    transaction_id IN (
      SELECT id FROM transactions 
      WHERE tenant_id IN (
        SELECT tenant_id FROM users WHERE email = auth.email()
      )
    )
  );

CREATE POLICY "Kasir and admins can manage transaction items" ON transaction_items
  FOR ALL USING (
    transaction_id IN (
      SELECT id FROM transactions 
      WHERE tenant_id IN (
        SELECT tenant_id FROM users 
        WHERE email = auth.email() 
        AND role IN ('kasir', 'admin', 'superadmin')
      )
    )
  );

-- User stores table policies
CREATE POLICY "Users can view their store assignments" ON user_stores
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  );

CREATE POLICY "Admins can manage store assignments" ON user_stores
  FOR ALL USING (
    store_id IN (
      SELECT id FROM stores 
      WHERE tenant_id IN (
        SELECT tenant_id FROM users 
        WHERE email = auth.email() 
        AND role IN ('admin', 'superadmin')
      )
    )
  );

-- Orders table policies (for subscription management)
CREATE POLICY "Superadmins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.email() 
      AND role = 'superadmin'
    )
  );

CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (email = auth.email());

CREATE POLICY "Superadmins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.email() 
      AND role = 'superadmin'
    )
  );

-- Enable RLS on transaction_items table (if not already enabled)
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Grant additional permissions for authenticated users
GRANT SELECT, INSERT, UPDATE ON transaction_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_stores TO authenticated;
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;