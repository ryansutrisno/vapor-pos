-- Migration: Add SendGrid configuration settings
-- Created: 2024-01-25
-- Purpose: Add SendGrid API key and email configuration for trial system

-- Insert SendGrid settings for global configuration
INSERT INTO settings (key, value, category, description, data_type, is_public, tenant_id)
SELECT key, value, category, description, data_type, is_public, NULL::uuid as tenant_id FROM (
  VALUES 
    ('sendgrid_api_key', '', 'email', 'SendGrid API key for sending emails', 'string', false),
    ('sendgrid_from_email', 'noreply@vaporpos.com', 'email', 'Default from email for SendGrid', 'string', false),
    ('sendgrid_from_name', 'VaporPOS', 'email', 'Default from name for SendGrid', 'string', false),
    ('email_verification_enabled', 'true', 'email', 'Enable email verification for new users', 'boolean', false),
    ('trial_duration_days', '14', 'trial', 'Trial duration in days', 'number', false),
    ('trial_enabled', 'true', 'trial', 'Enable trial registration', 'boolean', false),
    ('trial_auto_suspend', 'true', 'trial', 'Automatically suspend users after trial expires', 'boolean', false)
) AS new_settings(key, value, category, description, data_type, is_public)
WHERE NOT EXISTS (
  SELECT 1 FROM settings 
  WHERE settings.key = new_settings.key 
  AND settings.tenant_id IS NULL
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON settings TO authenticated;
GRANT SELECT ON settings TO anon;