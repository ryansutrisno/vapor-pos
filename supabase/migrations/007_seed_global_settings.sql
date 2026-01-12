-- Seed default global settings if they don't exist
-- This ensures that global settings are available for superadmin users

-- Insert default global settings only if they don't exist
INSERT INTO settings (key, value, category, description, data_type, is_public, tenant_id)
SELECT key, value, category, description, data_type, is_public, NULL::uuid as tenant_id FROM (
  VALUES 
    ('app_name', 'VaporPOS', 'application', 'Application name displayed in UI', 'string', true),
    ('app_logo', '/logo.png', 'application', 'Application logo URL', 'string', true),
    ('app_theme', 'system', 'application', 'Default application theme (light/dark/system)', 'string', true),
    ('app_version', '1.0.0', 'application', 'Current application version', 'string', true),
    ('maintenance_mode', 'false', 'application', 'Enable maintenance mode', 'boolean', false),
    ('timezone', 'Asia/Jakarta', 'system', 'Default system timezone', 'string', true),
    ('currency', 'IDR', 'system', 'Default currency', 'string', true),
    ('date_format', 'DD/MM/YYYY', 'system', 'Default date format', 'string', true),
    ('language', 'id', 'system', 'Default language (id/en)', 'string', true),
    ('max_login_attempts', '5', 'security', 'Maximum login attempts before lockout', 'number', false),
    ('session_timeout', '3600', 'security', 'Session timeout in seconds', 'number', false),
    ('password_min_length', '8', 'security', 'Minimum password length', 'number', false),
    ('backup_enabled', 'true', 'system', 'Enable automatic backups', 'boolean', false),
    ('backup_frequency', 'daily', 'system', 'Backup frequency (daily/weekly/monthly)', 'string', false),
    ('email_notifications', 'true', 'notifications', 'Enable email notifications', 'boolean', false),
    ('sms_notifications', 'false', 'notifications', 'Enable SMS notifications', 'boolean', false)
) AS new_settings(key, value, category, description, data_type, is_public)
WHERE NOT EXISTS (
  SELECT 1 FROM settings 
  WHERE settings.key = new_settings.key 
  AND settings.tenant_id IS NULL
);

-- Update the updated_at timestamp for any existing settings
UPDATE settings 
SET updated_at = NOW() 
WHERE tenant_id IS NULL;

-- Verify the seeding was successful
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM settings WHERE tenant_id IS NULL) > 0 THEN
    RAISE NOTICE 'Global settings seeded successfully. Total global settings: %', 
      (SELECT COUNT(*) FROM settings WHERE tenant_id IS NULL);
  ELSE
    RAISE WARNING 'No global settings found after seeding!';
  END IF;
END $$;