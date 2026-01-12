-- Migration: Add WhatsApp notifications using Fonnte API and update SMS to WhatsApp
-- Created: 2024-01-20
-- Purpose: Replace SMS notifications with WhatsApp notifications using Fonnte API

-- Update existing SMS setting to WhatsApp
UPDATE settings SET 
  key = 'whatsapp_notifications_enabled',
  description = 'Aktifkan notifikasi via WhatsApp menggunakan Fonnte API'
WHERE key = 'sms_notifications_enabled' AND category = 'notification_settings';

-- Add new WhatsApp settings for Fonnte integration
INSERT INTO settings (key, value, data_type, category, description, tenant_id) VALUES
('fonnte_api_token', '', 'string', 'notification_settings', 'API Token dari Fonnte untuk mengirim WhatsApp (dapatkan dari https://fonnte.com)', NULL),
('whatsapp_admin_number', '', 'string', 'notification_settings', 'Nomor WhatsApp admin untuk menerima notifikasi (format: 628123456789)', NULL),
('whatsapp_country_code', '62', 'string', 'notification_settings', 'Kode negara untuk WhatsApp (62=Indonesia, 1=US, 44=UK)', NULL),
('whatsapp_test_mode', 'false', 'boolean', 'notification_settings', 'Mode test untuk WhatsApp notifications (tidak mengirim pesan sebenarnya)', NULL);

-- Grant permissions for the new settings
GRANT SELECT, INSERT, UPDATE ON settings TO authenticated;
GRANT SELECT ON settings TO anon;

-- Add comment for documentation
COMMENT ON TABLE settings IS 'Settings table with WhatsApp notifications support via Fonnte API';