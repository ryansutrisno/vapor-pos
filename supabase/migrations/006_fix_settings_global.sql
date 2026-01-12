-- Migration: Fix settings global access for superadmin
-- This migration fixes the error in migration 005 and ensures global settings are available

-- First, let's fix the function that had the wrong column reference
DROP FUNCTION IF EXISTS create_tenant_default_settings(UUID);

-- Recreate the function with correct column reference
CREATE OR REPLACE FUNCTION create_tenant_default_settings(new_tenant_id UUID)
RETURNS void AS $$
BEGIN
    -- Copy global settings to new tenant
    INSERT INTO settings (key, value, category, description, data_type, is_public, tenant_id)
    SELECT key, value, category, description, data_type, is_public, new_tenant_id
    FROM settings 
    WHERE tenant_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_tenant_default_settings(UUID) TO authenticated;

-- Ensure we have global settings (tenant_id = NULL) for superadmin
-- Check if global settings exist, if not, create them
DO $$
BEGIN
    -- Check if any global settings exist
    IF NOT EXISTS (SELECT 1 FROM settings WHERE tenant_id IS NULL LIMIT 1) THEN
        -- Insert default global settings for superadmin
        INSERT INTO settings (key, value, category, description, data_type, is_public, tenant_id) VALUES 
          -- Application settings
          ('app_name', 'VaporPOS', 'application', 'Application name displayed in UI', 'string', true, NULL),
          ('app_logo', '/logo.png', 'application', 'Application logo URL', 'string', true, NULL),
          ('app_theme', 'system', 'application', 'Default application theme (light/dark/system)', 'string', true, NULL),
          ('app_version', '1.0.0', 'application', 'Current application version', 'string', true, NULL),
          ('maintenance_mode', 'false', 'application', 'Enable maintenance mode', 'boolean', false, NULL),
          
          -- Email settings
          ('smtp_host', '', 'email', 'SMTP server hostname', 'string', false, NULL),
          ('smtp_port', '587', 'email', 'SMTP server port', 'number', false, NULL),
          ('smtp_username', '', 'email', 'SMTP username', 'string', false, NULL),
          ('smtp_password', '', 'email', 'SMTP password (encrypted)', 'string', false, NULL),
          ('smtp_from_email', 'noreply@vaporpos.com', 'email', 'Default from email address', 'string', false, NULL),
          ('smtp_from_name', 'VaporPOS', 'email', 'Default from name', 'string', false, NULL),
          ('email_notifications', 'true', 'email', 'Enable email notifications', 'boolean', false, NULL),
          
          -- Security settings
          ('password_min_length', '6', 'security', 'Minimum password length', 'number', false, NULL),
          ('password_require_uppercase', 'false', 'security', 'Require uppercase letters in password', 'boolean', false, NULL),
          ('password_require_numbers', 'false', 'security', 'Require numbers in password', 'boolean', false, NULL),
          ('password_require_symbols', 'false', 'security', 'Require symbols in password', 'boolean', false, NULL),
          ('session_timeout', '24', 'security', 'Session timeout in hours', 'number', false, NULL),
          ('max_login_attempts', '5', 'security', 'Maximum login attempts before lockout', 'number', false, NULL),
          ('lockout_duration', '15', 'security', 'Account lockout duration in minutes', 'number', false, NULL),
          
          -- Backup settings
          ('backup_enabled', 'true', 'backup', 'Enable automatic backups', 'boolean', false, NULL),
          ('backup_frequency', 'daily', 'backup', 'Backup frequency (daily/weekly/monthly)', 'string', false, NULL),
          ('backup_retention', '30', 'backup', 'Backup retention period in days', 'number', false, NULL),
          ('backup_location', 'local', 'backup', 'Backup storage location', 'string', false, NULL),
          
          -- System settings
          ('timezone', 'Asia/Jakarta', 'system', 'Default system timezone', 'string', true, NULL),
          ('currency', 'IDR', 'system', 'Default currency', 'string', true, NULL),
          ('date_format', 'DD/MM/YYYY', 'system', 'Default date format', 'string', true, NULL),
          ('time_format', '24h', 'system', 'Time format (12h/24h)', 'string', true, NULL),
          ('language', 'id', 'system', 'Default language (id/en)', 'string', true, NULL);
    END IF;
END $$;

-- Verify RLS policies are correct for superadmin access to global settings
-- Drop and recreate the superadmin policy to ensure it works correctly
DROP POLICY IF EXISTS "settings_superadmin_all_access" ON settings;

CREATE POLICY "settings_superadmin_all_access" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- Add a comment to document this fix
COMMENT ON TABLE settings IS 'Application settings table with multi-tenant support. Global settings (tenant_id = NULL) are managed by superadmin, tenant-specific settings are managed by respective admins.';