-- Add store transfer columns to stock_movements table
-- This migration adds support for inter-branch stock transfers

-- Add source and destination store columns
ALTER TABLE stock_movements 
ADD COLUMN IF NOT EXISTS source_store_id UUID REFERENCES stores(id),
ADD COLUMN IF NOT EXISTS destination_store_id UUID REFERENCES stores(id);

-- Create indexes for better performance on store transfers
CREATE INDEX IF NOT EXISTS idx_stock_movements_source_store ON stock_movements(source_store_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_destination_store ON stock_movements(destination_store_id);

-- Update the trigger function to handle store transfers
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- For regular stock movements (in/out/adjustment)
  IF NEW.type IN ('in', 'out', 'adjustment') THEN
    IF NEW.type = 'in' OR NEW.type = 'adjustment' THEN
      UPDATE products 
      SET stock = stock + NEW.quantity 
      WHERE id = NEW.product_id AND tenant_id = NEW.tenant_id;
    ELSIF NEW.type = 'out' THEN
      UPDATE products 
      SET stock = GREATEST(0, stock - NEW.quantity) 
      WHERE id = NEW.product_id AND tenant_id = NEW.tenant_id;
    END IF;
  
  -- For transfer movements, handle both source and destination
  ELSIF NEW.type = 'transfer' THEN
    -- Decrease stock from source store (if specified)
    IF NEW.source_store_id IS NOT NULL THEN
      UPDATE products 
      SET stock = GREATEST(0, stock - NEW.quantity) 
      WHERE id = NEW.product_id 
      AND tenant_id = (SELECT tenant_id FROM stores WHERE id = NEW.source_store_id);
    END IF;
    
    -- Increase stock at destination store (if specified)
    IF NEW.destination_store_id IS NOT NULL THEN
      -- Check if product exists at destination store
      IF NOT EXISTS (
        SELECT 1 FROM products 
        WHERE id = NEW.product_id 
        AND tenant_id = (SELECT tenant_id FROM stores WHERE id = NEW.destination_store_id)
      ) THEN
        -- Create product record at destination store if it doesn't exist
        INSERT INTO products (id, name, description, category, price, stock, sku, minimum_stock, tenant_id)
        SELECT 
          NEW.product_id,
          name,
          description,
          category,
          price,
          NEW.quantity,
          sku,
          minimum_stock,
          (SELECT tenant_id FROM stores WHERE id = NEW.destination_store_id)
        FROM products 
        WHERE id = NEW.product_id
        LIMIT 1
        ON CONFLICT (id, tenant_id) DO UPDATE SET
          stock = products.stock + NEW.quantity;
      ELSE
        -- Update existing product stock at destination
        UPDATE products 
        SET stock = stock + NEW.quantity 
        WHERE id = NEW.product_id 
        AND tenant_id = (SELECT tenant_id FROM stores WHERE id = NEW.destination_store_id);
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add constraint to ensure transfer movements have proper store information
ALTER TABLE stock_movements 
ADD CONSTRAINT check_transfer_stores 
CHECK (
  (type != 'transfer') OR 
  (type = 'transfer' AND (source_store_id IS NOT NULL OR destination_store_id IS NOT NULL))
);

-- Create function to get store stock levels
CREATE OR REPLACE FUNCTION get_store_stock_levels(store_id_param UUID)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  category TEXT,
  current_stock INTEGER,
  minimum_stock INTEGER,
  is_low_stock BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.category,
    p.stock,
    p.minimum_stock,
    (p.stock <= p.minimum_stock) as is_low_stock
  FROM products p
  JOIN stores s ON s.tenant_id = p.tenant_id
  WHERE s.id = store_id_param
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- Create function to get inter-store transfer history
CREATE OR REPLACE FUNCTION get_transfer_history(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  movement_id UUID,
  product_name TEXT,
  quantity INTEGER,
  source_store_name TEXT,
  destination_store_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.id,
    p.name,
    sm.quantity,
    ss.name as source_store,
    ds.name as destination_store,
    sm.notes,
    sm.created_at,
    u.name as created_by_name
  FROM stock_movements sm
  JOIN products p ON p.id = sm.product_id
  LEFT JOIN stores ss ON ss.id = sm.source_store_id
  LEFT JOIN stores ds ON ds.id = sm.destination_store_id
  LEFT JOIN users u ON u.id = sm.created_by
  WHERE sm.type = 'transfer'
  AND sm.created_at >= NOW() - INTERVAL '1 day' * days_back
  ORDER BY sm.created_at DESC;
END;
$$ LANGUAGE plpgsql;