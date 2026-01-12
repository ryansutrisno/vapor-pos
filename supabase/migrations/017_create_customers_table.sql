-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    total_spent DECIMAL(10,2) DEFAULT 0,
    last_visit TIMESTAMP WITH TIME ZONE,
    store_id UUID REFERENCES stores(id),
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add customer_id to transactions table
ALTER TABLE transactions ADD COLUMN customer_id UUID REFERENCES customers(id);

-- Create indexes
CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL PRIVILEGES ON customers TO authenticated;

-- Create RLS policies
CREATE POLICY "Users can view customers from their tenant" ON customers
    FOR SELECT USING (
        tenant_id = (SELECT tenant_id FROM users WHERE auth.uid() = auth_id)
    );

CREATE POLICY "Users can insert customers to their tenant" ON customers
    FOR INSERT WITH CHECK (
        tenant_id = (SELECT tenant_id FROM users WHERE auth.uid() = auth_id)
    );

CREATE POLICY "Users can update customers from their tenant" ON customers
    FOR UPDATE USING (
        tenant_id = (SELECT tenant_id FROM users WHERE auth.uid() = auth_id)
    );

CREATE POLICY "Users can delete customers from their tenant" ON customers
    FOR DELETE USING (
        tenant_id = (SELECT tenant_id FROM users WHERE auth.uid() = auth_id)
    );

-- Create function to update loyalty tier based on total spent
CREATE OR REPLACE FUNCTION update_customer_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
    -- Update loyalty tier based on total spent
    IF NEW.total_spent >= 10000000 THEN -- 10 million
        NEW.loyalty_tier = 'platinum';
    ELSIF NEW.total_spent >= 5000000 THEN -- 5 million
        NEW.loyalty_tier = 'gold';
    ELSIF NEW.total_spent >= 1000000 THEN -- 1 million
        NEW.loyalty_tier = 'silver';
    ELSE
        NEW.loyalty_tier = 'bronze';
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update loyalty tier
CREATE TRIGGER trigger_update_customer_loyalty_tier
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_loyalty_tier();

-- Create function to update customer stats when transaction is created
CREATE OR REPLACE FUNCTION update_customer_stats_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer total spent and last visit
    IF NEW.customer_id IS NOT NULL THEN
        UPDATE customers 
        SET 
            total_spent = total_spent + NEW.total_amount,
            last_visit = NEW.created_at,
            loyalty_points = loyalty_points + FLOOR(NEW.total_amount / 10000) -- 1 point per 10k spent
        WHERE id = NEW.customer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update customer stats on new transaction
CREATE TRIGGER trigger_update_customer_stats
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats_on_transaction();