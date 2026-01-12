-- Enhance orders table for payment gateway integration and order management

-- Add new columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS customer_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_notes TEXT,
ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50) DEFAULT 'midtrans',
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_url TEXT,
ADD COLUMN IF NOT EXISTS payment_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_gateway_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_gateway_response JSONB,
ADD COLUMN IF NOT EXISTS order_items JSONB,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS tenant_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tenant_user_id UUID REFERENCES users(id);

-- Update payment_status to use enum-like constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'expired', 'cancelled', 'refunded'));

-- Create order_status_history table for tracking status changes
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_gateway_transaction_id ON orders(payment_gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON orders(expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON orders(tenant_created);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_orders_updated_at ON orders;
CREATE TRIGGER trigger_update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- Create function to log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if payment_status actually changed
    IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
        INSERT INTO order_status_history (order_id, old_status, new_status, metadata)
        VALUES (
            NEW.id,
            OLD.payment_status,
            NEW.payment_status,
            jsonb_build_object(
                'payment_gateway_transaction_id', NEW.payment_gateway_transaction_id,
                'payment_method', NEW.payment_method,
                'updated_at', NOW()
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status change logging
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;
CREATE TRIGGER trigger_log_order_status_change
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- Enable RLS on order_status_history
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for order_status_history
CREATE POLICY "Superadmin can view all order status history" ON order_status_history
    FOR SELECT USING (auth.jwt() ->> 'role' = 'superadmin');

CREATE POLICY "Admin can view order status history for their orders" ON order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = order_status_history.order_id 
            AND o.email = auth.jwt() ->> 'email'
        )
    );

-- Update existing RLS policies for orders table to include new columns
DROP POLICY IF EXISTS "Superadmin can manage all orders" ON orders;
CREATE POLICY "Superadmin can manage all orders" ON orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'superadmin');

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL PRIVILEGES ON order_status_history TO authenticated;
GRANT ALL PRIVILEGES ON order_status_history TO anon;
GRANT SELECT ON order_status_history TO anon;
GRANT ALL PRIVILEGES ON orders TO authenticated;
GRANT ALL PRIVILEGES ON orders TO anon;