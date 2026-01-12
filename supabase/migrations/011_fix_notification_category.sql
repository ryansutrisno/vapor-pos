-- Migration: Fix notification category name from 'notifications' to 'notification_settings'
-- Created: 2024-01-20
-- Purpose: Update existing notification settings to use correct category name

-- Update notification settings category from 'notifications' to 'notification_settings'
UPDATE settings 
SET category = 'notification_settings' 
WHERE category = 'notifications' 
AND key IN (
  'low_stock_notifications',
  'daily_sales_report', 
  'email_notifications_enabled',
  'sms_notifications_enabled'
);

-- Verify the update
-- SELECT key, category FROM settings WHERE category = 'notification_settings';