-- Create categories table for product categorization
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) NOT NULL DEFAULT 'device',
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for tenant_id for better performance
CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON categories(tenant_id);

-- Create index for name for search performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view categories from their tenant" ON categories
  FOR SELECT USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert categories for their tenant" ON categories
  FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update categories from their tenant" ON categories
  FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete categories from their tenant" ON categories
  FOR DELETE USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Grant permissions to authenticated users
GRANT ALL PRIVILEGES ON categories TO authenticated;
GRANT ALL PRIVILEGES ON categories TO anon;

-- Insert default categories for vapor products
INSERT INTO categories (name, description, icon, tenant_id) VALUES
  ('Device', 'Perangkat vapor seperti mod, pod, dan atomizer', 'device', '22222222-2222-2222-2222-222222222222'),
  ('Liquid', 'E-juice dan salt nicotine dalam berbagai rasa', 'liquid', '22222222-2222-2222-2222-222222222222'),
  ('Peripheral', 'Aksesoris dan spare part seperti coil, cotton, wire', 'peripheral', '22222222-2222-2222-2222-222222222222'),
  ('Service', 'Jasa recoil, maintenance, dan perbaikan', 'service', '22222222-2222-2222-2222-222222222222');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();