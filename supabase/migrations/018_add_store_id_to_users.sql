-- Migration: Add store_id to users table for kasir store assignment
-- This allows kasir users to be assigned to specific stores

-- Add store_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);

-- Create index for better performance on store_id queries
CREATE INDEX IF NOT EXISTS idx_users_store_id ON users(store_id);

-- Add comment to document the purpose of store_id column
COMMENT ON COLUMN users.store_id IS 'Store assignment for kasir role users. NULL for admin/warehouse/superadmin roles.';

-- Update existing kasir users to be assigned to first available store in their tenant
-- This is a one-time migration for existing data
UPDATE users 
SET store_id = (
  SELECT s.id 
  FROM stores s 
  WHERE s.tenant_id = users.tenant_id 
  LIMIT 1
)
WHERE role = 'kasir' AND store_id IS NULL;

-- Add constraint to ensure kasir users have store assignment
-- Note: This is commented out to allow flexibility during development
-- ALTER TABLE users ADD CONSTRAINT check_kasir_store_assignment 
-- CHECK (role != 'kasir' OR store_id IS NOT NULL);

-- Create function to get user's assigned store info
CREATE OR REPLACE FUNCTION get_user_store_info(user_id UUID)
RETURNS TABLE (
  store_id UUID,
  store_name VARCHAR(100),
  store_address TEXT,
  tenant_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.address,
    s.tenant_id
  FROM users u
  LEFT JOIN stores s ON s.id = u.store_id
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_store_info(UUID) TO authenticated;