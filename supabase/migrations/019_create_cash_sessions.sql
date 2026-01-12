-- Create cash_sessions table for tracking daily cash operations per store/kasir
CREATE TABLE cash_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  opening_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_cash DECIMAL(10,2),
  expected_cash DECIMAL(10,2),
  cash_difference DECIMAL(10,2),
  total_sales DECIMAL(10,2) DEFAULT 0,
  total_expenses DECIMAL(10,2) DEFAULT 0,
  cash_adjustments DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cash_sessions_store_id ON cash_sessions(store_id);
CREATE INDEX idx_cash_sessions_user_id ON cash_sessions(user_id);
CREATE INDEX idx_cash_sessions_tenant_id ON cash_sessions(tenant_id);
CREATE INDEX idx_cash_sessions_date ON cash_sessions(session_date);
CREATE INDEX idx_cash_sessions_status ON cash_sessions(status);

-- Create unique constraint to prevent multiple open sessions per store per day
CREATE UNIQUE INDEX idx_cash_sessions_unique_open 
ON cash_sessions(store_id, session_date) 
WHERE status = 'open';

-- Add RLS (Row Level Security)
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view cash sessions from their tenant" ON cash_sessions
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Kasir can insert cash sessions for their store" ON cash_sessions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    store_id IN (
      SELECT store_id FROM users WHERE id = auth.uid() AND role = 'kasir'
    ) AND
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Kasir can update their own cash sessions" ON cash_sessions
  FOR UPDATE USING (
    user_id = auth.uid() AND
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all cash sessions in their tenant" ON cash_sessions
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON cash_sessions TO authenticated;
GRANT SELECT ON cash_sessions TO anon;

-- Create function to get current active cash session for a store
CREATE OR REPLACE FUNCTION get_active_cash_session(store_uuid UUID)
RETURNS cash_sessions AS $$
DECLARE
  session cash_sessions;
BEGIN
  SELECT * INTO session
  FROM cash_sessions
  WHERE store_id = store_uuid 
    AND session_date = CURRENT_DATE 
    AND status = 'open'
  LIMIT 1;
  
  RETURN session;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate expected cash for a session
CREATE OR REPLACE FUNCTION calculate_expected_cash(session_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  session_data cash_sessions;
  expected_amount DECIMAL(10,2);
BEGIN
  SELECT * INTO session_data
  FROM cash_sessions
  WHERE id = session_id;
  
  IF session_data IS NULL THEN
    RETURN 0;
  END IF;
  
  expected_amount := session_data.opening_cash + 
                    session_data.total_sales - 
                    session_data.total_expenses + 
                    session_data.cash_adjustments;
  
  RETURN expected_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cash_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cash_sessions_updated_at
  BEFORE UPDATE ON cash_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_cash_sessions_updated_at();

-- Add comments
COMMENT ON TABLE cash_sessions IS 'Tracks daily cash operations for each store and kasir';
COMMENT ON COLUMN cash_sessions.opening_cash IS 'Cash amount at the start of the day';
COMMENT ON COLUMN cash_sessions.closing_cash IS 'Actual cash amount at the end of the day';
COMMENT ON COLUMN cash_sessions.expected_cash IS 'Calculated expected cash based on transactions';
COMMENT ON COLUMN cash_sessions.cash_difference IS 'Difference between expected and actual closing cash';
COMMENT ON COLUMN cash_sessions.total_sales IS 'Total cash sales for the day';
COMMENT ON COLUMN cash_sessions.total_expenses IS 'Total cash expenses for the day';
COMMENT ON COLUMN cash_sessions.cash_adjustments IS 'Manual cash adjustments (positive or negative)';