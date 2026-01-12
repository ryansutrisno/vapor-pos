-- Fix RLS policies for cash_sessions table to use auth_id instead of auth.uid()

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view cash sessions from their tenant" ON cash_sessions;
DROP POLICY IF EXISTS "Kasir can insert cash sessions for their store" ON cash_sessions;
DROP POLICY IF EXISTS "Kasir can update their own cash sessions" ON cash_sessions;
DROP POLICY IF EXISTS "Admin can manage all cash sessions in their tenant" ON cash_sessions;

-- Create new RLS policies using auth_id
CREATE POLICY "Users can view cash sessions from their tenant" ON cash_sessions
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Kasir can insert cash sessions for their store" ON cash_sessions
  FOR INSERT WITH CHECK (
    user_id = (
      SELECT id FROM users WHERE auth_id = auth.uid()
    ) AND
    store_id = (
      SELECT store_id FROM users WHERE auth_id = auth.uid() AND role = 'kasir'
    ) AND
    tenant_id = (
      SELECT tenant_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Kasir can update their own cash sessions" ON cash_sessions
  FOR UPDATE USING (
    user_id = (
      SELECT id FROM users WHERE auth_id = auth.uid()
    ) AND
    tenant_id = (
      SELECT tenant_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all cash sessions in their tenant" ON cash_sessions
  FOR ALL USING (
    tenant_id = (
      SELECT tenant_id FROM users 
      WHERE auth_id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Update functions to use auth_id as well
CREATE OR REPLACE FUNCTION get_active_cash_session(store_uuid UUID)
RETURNS cash_sessions AS $$
DECLARE
  session cash_sessions;
  current_user_id UUID;
BEGIN
  -- Get current user id from auth_id
  SELECT id INTO current_user_id
  FROM users
  WHERE auth_id = auth.uid();
  
  SELECT * INTO session
  FROM cash_sessions
  WHERE store_id = store_uuid 
    AND session_date = CURRENT_DATE 
    AND status = 'open'
    AND user_id = current_user_id
  LIMIT 1;
  
  RETURN session;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant proper permissions
GRANT ALL PRIVILEGES ON cash_sessions TO authenticated;
GRANT SELECT ON cash_sessions TO anon;

-- Add comment
COMMENT ON TABLE cash_sessions IS 'Fixed RLS policies to use auth_id field for proper authentication';