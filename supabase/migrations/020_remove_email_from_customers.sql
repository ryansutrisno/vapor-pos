-- Remove email field from customers table
-- This migration removes the email field since it's not needed for the simplified customer form

-- Drop the email index first
DROP INDEX IF EXISTS idx_customers_email;

-- Remove the email column
ALTER TABLE customers DROP COLUMN IF EXISTS email;

-- Verify the final structure has proper relations:
-- - tenant_id: for tenant isolation and cross-tenant customer usage
-- - store_id: for store-specific customer tracking (nullable for cross-store usage)
-- - customer_id in transactions: for linking purchases to customers

-- Add comment to clarify the table purpose
COMMENT ON TABLE customers IS 'Customer data with tenant and store relations for cross-branch usage';
COMMENT ON COLUMN customers.tenant_id IS 'Required: Links customer to tenant for data isolation';
COMMENT ON COLUMN customers.store_id IS 'Optional: Primary store association, null allows cross-store usage';
COMMENT ON COLUMN customers.name IS 'Required: Customer full name';
COMMENT ON COLUMN customers.phone IS 'Optional: WhatsApp phone number for contact';
COMMENT ON COLUMN customers.address IS 'Optional: Customer address';
COMMENT ON COLUMN customers.loyalty_points IS 'Accumulated loyalty points across all stores in tenant';
COMMENT ON COLUMN customers.total_spent IS 'Total amount spent across all stores in tenant';
COMMENT ON COLUMN customers.last_visit IS 'Last transaction date across any store in tenant';