-- Migration: Create invoices table for billing system
-- Migration: 028_create_invoices.sql
-- Date: 2024-01-16

-- Create enum types for multi-currency support
CREATE TYPE invoice_currency AS ENUM ('IDR', 'USD', 'EUR', 'SGD', 'MYR');

-- Create enum for invoice status
CREATE TYPE invoice_status AS ENUM (
    'draft',
    'sent',
    'paid',
    'overdue',
    'cancelled',
    'refunded'
);

-- Create enum for reminder status tracking
CREATE TYPE reminder_sent_status AS ENUM (
    'none',
    'sent_14d',
    'sent_7d',
    'sent_3d',
    'sent_1d'
);

-- Create the main invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Invoice identification
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Financial details
    amount DECIMAL(12, 2) NOT NULL,
    currency invoice_currency DEFAULT 'IDR' NOT NULL,
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0000 NOT NULL,
    amount_idr DECIMAL(12, 2),
    
    -- Plan details
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    
    -- Billing period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    next_billing_date DATE NOT NULL,
    
    -- Payment details
    payment_method VARCHAR(50),
    payment_reference VARCHAR(200),
    payment_gateway_transaction_id VARCHAR(200),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Status tracking
    status invoice_status DEFAULT 'draft' NOT NULL,
    reminder_status reminder_sent_status DEFAULT 'none' NOT NULL,
    last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Admin notes
    admin_notes TEXT,
    created_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Due date for payment
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Constraint untuk memastikan amount_idr dihitung
    CONSTRAINT amount_idr_calculation CHECK (
        (currency = 'IDR' AND amount_idr IS NULL) OR 
        (currency != 'IDR' AND amount_idr IS NOT NULL)
    )
);

-- Create indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status_due_date ON invoices(status, due_date);

-- Create trigger function untuk updated_at
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS set_invoices_updated_at ON invoices;
CREATE TRIGGER set_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoices_updated_at();

-- Function untuk generate invoice number format: INV-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    v_date TEXT;
    v_sequence INTEGER;
    v_invoice_number VARCHAR(50);
    v_max_attempts INTEGER := 100;
    v_attempt INTEGER := 0;
BEGIN
    v_date := TO_CHAR(NOW(), 'YYYYMMDD');
    
    LOOP
        v_attempt := v_attempt + 1;
        
        SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 13) AS INTEGER)), 0) + 1
        INTO v_sequence
        FROM invoices
        WHERE SUBSTRING(invoice_number FROM 5 FOR 8) = v_date;
        
        v_invoice_number := 'INV-' || v_date || '-' || LPAD(v_sequence::TEXT, 4, '0');
        
        -- Check if invoice number already exists
        IF NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = v_invoice_number) THEN
            RETURN v_invoice_number;
        END IF;
        
        -- Safety check untuk menghindari infinite loop
        IF v_attempt >= v_max_attempts THEN
            -- Fallback: use timestamp-based unique identifier
            RETURN 'INV-' || v_date || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 12, '0');
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function untuk auto-calculate amount_idr when currency is not IDR
CREATE OR REPLACE FUNCTION calculate_amount_idr()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.currency != 'IDR' AND NEW.exchange_rate IS NOT NULL THEN
        NEW.amount_idr := NEW.amount * NEW.exchange_rate;
    ELSE
        NEW.amount_idr := NEW.amount;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-calculate amount_idr
DROP TRIGGER IF EXISTS calculate_invoices_amount_idr ON invoices;
CREATE TRIGGER calculate_invoices_amount_idr
    BEFORE INSERT OR UPDATE OF amount, currency, exchange_rate ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION calculate_amount_idr();

-- Function untuk get exchange rate (placeholder - dapat diintegrasikan dengan API rate)
CREATE OR REPLACE FUNCTION get_exchange_rate(p_currency TEXT)
RETURNS DECIMAL AS $$
DECLARE
    v_rate DECIMAL := 1;
BEGIN
    -- Default rates - dapat diganti dengan API call ke exchangerate service
    CASE p_currency
        WHEN 'USD' THEN v_rate := 15500.00;
        WHEN 'EUR' THEN v_rate := 16800.00;
        WHEN 'SGD' THEN v_rate := 11600.00;
        WHEN 'MYR' THEN v_rate := 3300.00;
        ELSE v_rate := 1;
    END CASE;
    
    RETURN v_rate;
END;
$$ LANGUAGE plpgsql;

-- Function untuk create invoice dari order
CREATE OR REPLACE FUNCTION create_invoice_from_order(
    p_order_id UUID,
    p_user_id UUID,
    p_created_by UUID
) RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
    v_invoice_number VARCHAR(50);
    v_order RECORD;
BEGIN
    -- Get order details
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;
    
    -- Generate invoice number
    v_invoice_number := generate_invoice_number();
    
    -- Calculate billing period
    IF v_order.billing_cycle = 'monthly' THEN
        INSERT INTO invoices (
            invoice_number,
            order_id,
            user_id,
            amount,
            currency,
            plan_name,
            plan_type,
            billing_cycle,
            period_start,
            period_end,
            next_billing_date,
            due_date,
            status,
            sent_at,
            created_by
        ) VALUES (
            v_invoice_number,
            p_order_id,
            p_user_id,
            v_order.amount,
            COALESCE(v_order.currency, 'IDR'),
            'VaporPOS ' || INITCAP(REPLACE(v_order.plan_type, '_', ' ')),
            v_order.plan_type,
            v_order.billing_cycle,
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '1 month',
            CURRENT_DATE + INTERVAL '1 month',
            CURRENT_DATE + INTERVAL '14 days',
            'sent',
            NOW(),
            p_created_by
        ) RETURNING id INTO v_invoice_id;
    ELSE
        -- Yearly billing
        INSERT INTO invoices (
            invoice_number,
            order_id,
            user_id,
            amount,
            currency,
            plan_name,
            plan_type,
            billing_cycle,
            period_start,
            period_end,
            next_billing_date,
            due_date,
            status,
            sent_at,
            created_by
        ) VALUES (
            v_invoice_number,
            p_order_id,
            p_user_id,
            v_order.amount,
            COALESCE(v_order.currency, 'IDR'),
            'VaporPOS ' || INITCAP(REPLACE(v_order.plan_type, '_', ' ')),
            v_order.plan_type,
            v_order.billing_cycle,
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '1 year',
            CURRENT_DATE + INTERVAL '1 year',
            CURRENT_DATE + INTERVAL '14 days',
            'sent',
            NOW(),
            p_created_by
        ) RETURNING id INTO v_invoice_id;
    END IF;
    
    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Function untuk get invoice statistics
CREATE OR REPLACE FUNCTION get_invoice_stats()
RETURNS TABLE (
    total_invoices BIGINT,
    paid_invoices BIGINT,
    pending_invoices BIGINT,
    overdue_invoices BIGINT,
    total_revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_invoices,
        COUNT(*) FILTER (WHERE status = 'paid')::BIGINT AS paid_invoices,
        COUNT(*) FILTER (WHERE status = 'sent')::BIGINT AS pending_invoices,
        COUNT(*) FILTER (WHERE status = 'overdue')::BIGINT AS overdue_invoices,
        COALESCE(SUM(amount_idr), 0)::DECIMAL AS total_revenue
    FROM invoices
    WHERE status = 'paid';
END;
$$ LANGUAGE plpgsql;

-- Function untuk get invoices by user
CREATE OR REPLACE FUNCTION get_user_invoices(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    invoice_number VARCHAR(50),
    amount DECIMAL(12, 2),
    currency TEXT,
    status TEXT,
    plan_name VARCHAR(100),
    period_start DATE,
    period_end DATE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.invoice_number,
        i.amount,
        i.currency::TEXT,
        i.status::TEXT,
        i.plan_name,
        i.period_start,
        i.period_end,
        i.due_date,
        i.created_at
    FROM invoices i
    WHERE i.user_id = p_user_id
    ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create view untuk SuperAdmin invoice report
CREATE OR REPLACE VIEW v_invoice_report AS
SELECT
    i.invoice_number,
    i.status,
    i.currency,
    i.amount,
    i.amount_idr,
    i.plan_name,
    i.billing_cycle,
    u.name AS user_name,
    u.email AS user_email,
    i.due_date,
    i.paid_at,
    i.created_at,
    i.reminder_status
FROM invoices i
JOIN users u ON i.user_id = u.id
ORDER BY i.created_at DESC;

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION generate_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION get_exchange_rate(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_invoice_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_invoices(UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON TYPE invoice_currency IS 'Supported currencies for invoices';
COMMENT ON TYPE invoice_status IS 'Invoice lifecycle status';
COMMENT ON TYPE reminder_sent_status IS 'Tracks which reminder emails have been sent';
COMMENT ON TABLE invoices IS 'Stores invoice records for subscription billing';
COMMENT ON COLUMN invoices.invoice_number IS 'Unique invoice number in format INV-YYYYMMDD-XXXX';
COMMENT ON COLUMN invoices.amount_idr IS 'Amount converted to IDR for reporting purposes';
COMMENT ON COLUMN invoices.reminder_status IS 'Tracks email reminders: none, sent_14d, sent_7d, sent_3d, sent_1d';
