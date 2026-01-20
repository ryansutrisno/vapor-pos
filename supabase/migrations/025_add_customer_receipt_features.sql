-- Migration: Add Customer and Receipt Features
-- Created: 2026-01-10
-- Description: Add customers table, extend tenant_settings, and extend transactions

-- ============================================
-- 1. CREATE customers TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  total_transactions INT DEFAULT 0,
  total_spent DECIMAL(15,2) DEFAULT 0,
  last_transaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, phone)
);

-- Indexes for customers table
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- ============================================
-- 2. EXTEND tenant_settings TABLE
-- ============================================
-- WhatsApp Settings
DO $$ BEGIN
  ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS fonnte_api_key TEXT;
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column fonnte_api_key already exists';
END $$;

DO $$ BEGIN
  ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS use_fonnte BOOLEAN DEFAULT FALSE;
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column use_fonnte already exists';
END $$;

DO $$ BEGIN
  ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS use_wa_link_fallback BOOLEAN DEFAULT TRUE;
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column use_wa_link_fallback already exists';
END $$;

-- Receipt Settings
DO $$ BEGIN
  ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 11.00;
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column tax_rate already exists';
END $$;

DO $$ BEGIN
  ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS receipt_paper_size VARCHAR(10) DEFAULT '80mm';
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column receipt_paper_size already exists';
END $$;

DO $$ BEGIN
  ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS receipt_show_logo BOOLEAN DEFAULT FALSE;
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column receipt_show_logo already exists';
END $$;

DO $$ BEGIN
  ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS receipt_show_qrcode BOOLEAN DEFAULT FALSE;
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column receipt_show_qrcode already exists';
END $$;

DO $$ BEGIN
  ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS receipt_footer_text TEXT;
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column receipt_footer_text already exists';
END $$;

DO $$ BEGIN
  ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS receipt_thank_you_message TEXT;
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column receipt_thank_you_message already exists';
END $$;

-- ============================================
-- 3. EXTEND transactions TABLE
-- ============================================
DO $$ BEGIN
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column customer_id already exists';
END $$;

DO $$ BEGIN
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt_printed BOOLEAN DEFAULT FALSE;
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column receipt_printed already exists';
END $$;

DO $$ BEGIN
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wa_sent BOOLEAN DEFAULT FALSE;
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column wa_sent already exists';
END $$;

DO $$ BEGIN
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wa_message_id TEXT;
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column wa_message_id already exists';
END $$;

DO $$ BEGIN
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wa_phone TEXT;
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column wa_phone already exists';
END $$;

-- ============================================
-- 4. UPDATE existing transactions to have tax
-- ============================================
DO $$ BEGIN
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS subtotal DECIMAL(15,2);
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column subtotal already exists';
END $$;

DO $$ BEGIN
  ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(15,2);
EXCEPTION
  WHEN duplicate_column THEN RAISE NOTICE 'column tax_amount already exists';
END $$;

-- ============================================
-- 5. CREATE FUNCTION to auto-format phone
-- ============================================
CREATE OR REPLACE FUNCTION format_phone_for_storage(phone_input TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove all non-numeric characters
  phone_input := regexp_replace(phone_input, '[^0-9]', '', 'g');
  
  -- Replace leading 0 with 62
  IF phone_input LIKE '0%' THEN
    RETURN '62' || substring(phone_input from 2);
  END IF;
  
  -- Return as is if already starts with 62
  RETURN phone_input;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. CREATE FUNCTION to update timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger for customers table
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. RLS POLICIES (Row Level Security)
-- ============================================
-- Enable RLS for customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers
DROP POLICY IF EXISTS customers_tenant_access ON customers;
CREATE POLICY customers_tenant_access ON customers
  FOR ALL
  USING (tenant_id IN (
    SELECT id FROM tenants WHERE owner_id = auth.uid()
    UNION
    SELECT t.id FROM tenants t
    INNER JOIN tenant_users tu ON t.id = tu.tenant_id
    WHERE tu.user_id = auth.uid()
  ));

-- ============================================
-- 8. VIEWS
-- ============================================
-- View for customer with transaction summary
CREATE OR REPLACE VIEW customer_summary AS
SELECT
  c.id,
  c.tenant_id,
  c.name,
  c.phone,
  c.email,
  c.total_transactions,
  c.total_spent,
  c.last_transaction_at,
  c.created_at,
  t.name as tenant_name
FROM customers c
INNER JOIN tenants t ON c.tenant_id = t.id;

-- ============================================
-- 9. SAMPLE DATA (Optional - for testing)
-- ============================================
-- Insert sample customers (will only work if RLS is disabled for migration)
-- INSERT INTO customers (tenant_id, name, phone, email) VALUES
--   ('sample-tenant-id', 'John Doe', '6281234567890', 'john@example.com'),
--   ('sample-tenant-id', 'Jane Smith', '6280987654321', 'jane@example.com');

PRINT 'Migration completed successfully!';
PRINT 'Created: customers table, extended tenant_settings, extended transactions';
PRINT 'Created: indexes, functions, triggers, RLS policies';
