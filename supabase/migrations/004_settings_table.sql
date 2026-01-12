-- Create settings table for storing application configuration
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    data_type VARCHAR(20) NOT NULL CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_is_public ON settings(is_public);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Superadmins can manage all settings
CREATE POLICY "Superadmins can manage all settings" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.email() 
      AND role = 'superadmin'
    )
  );

-- Other users can only read public settings
CREATE POLICY "Users can read public settings" ON settings
  FOR SELECT USING (
    is_public = true
  );

-- Grant permissions
GRANT ALL PRIVILEGES ON settings TO authenticated;
GRANT SELECT ON settings TO anon;

-- Insert default settings
INSERT INTO settings (key, value, category, description, data_type, is_public) VALUES 
  -- Application settings
  ('app_name', 'VaporPOS', 'application', 'Application name displayed in UI', 'string', true),
  ('app_logo', '/logo.png', 'application', 'Application logo URL', 'string', true),
  ('app_theme', 'system', 'application', 'Default application theme (light/dark/system)', 'string', true),
  ('app_version', '1.0.0', 'application', 'Current application version', 'string', true),
  ('maintenance_mode', 'false', 'application', 'Enable maintenance mode', 'boolean', false),
  
  -- Email settings
  ('smtp_host', '', 'email', 'SMTP server hostname', 'string', false),
  ('smtp_port', '587', 'email', 'SMTP server port', 'number', false),
  ('smtp_username', '', 'email', 'SMTP username', 'string', false),
  ('smtp_password', '', 'email', 'SMTP password (encrypted)', 'string', false),
  ('smtp_from_email', 'noreply@vaporpos.com', 'email', 'Default from email address', 'string', false),
  ('smtp_from_name', 'VaporPOS', 'email', 'Default from name', 'string', false),
  ('email_notifications', 'true', 'email', 'Enable email notifications', 'boolean', false),
  
  -- Security settings
  ('password_min_length', '6', 'security', 'Minimum password length', 'number', false),
  ('password_require_uppercase', 'false', 'security', 'Require uppercase letters in password', 'boolean', false),
  ('password_require_numbers', 'false', 'security', 'Require numbers in password', 'boolean', false),
  ('password_require_symbols', 'false', 'security', 'Require symbols in password', 'boolean', false),
  ('session_timeout', '24', 'security', 'Session timeout in hours', 'number', false),
  ('max_login_attempts', '5', 'security', 'Maximum login attempts before lockout', 'number', false),
  ('lockout_duration', '15', 'security', 'Account lockout duration in minutes', 'number', false),
  
  -- Backup settings
  ('backup_enabled', 'true', 'backup', 'Enable automatic backups', 'boolean', false),
  ('backup_frequency', 'daily', 'backup', 'Backup frequency (daily/weekly/monthly)', 'string', false),
  ('backup_retention', '30', 'backup', 'Backup retention period in days', 'number', false),
  ('backup_location', 'local', 'backup', 'Backup storage location', 'string', false),
  
  -- System settings
  ('timezone', 'Asia/Jakarta', 'system', 'Default system timezone', 'string', true),
  ('currency', 'IDR', 'system', 'Default currency', 'string', true),
  ('date_format', 'DD/MM/YYYY', 'system', 'Default date format', 'string', true),
  ('time_format', '24h', 'system', 'Time format (12h/24h)', 'string', true),
  ('language', 'id', 'system', 'Default language (id/en)', 'string', true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();