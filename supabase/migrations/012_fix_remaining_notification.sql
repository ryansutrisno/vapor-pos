-- Migration: Fix remaining notification setting
-- Created: 2024-01-20
-- Purpose: Update remaining sms_notifications setting to correct category

-- Update the remaining notification setting
UPDATE settings 
SET category = 'notification_settings' 
WHERE category = 'notifications' 
AND key = 'sms_notifications';

-- Also add the missing sms_notifications_enabled setting if it doesn't exist
INSERT INTO settings (key, value, data_type, category, description, tenant_id) 
SELECT 'sms_notifications_enabled', 'false', 'boolean', 'notification_settings', 'Aktifkan notifikasi via SMS', NULL
WHERE NOT EXISTS (
    SELECT 1 FROM settings WHERE key = 'sms_notifications_enabled'
);

-- Remove the old sms_notifications key if it exists (it should be sms_notifications_enabled)
DELETE FROM settings WHERE key = 'sms_notifications' AND category = 'notifications';