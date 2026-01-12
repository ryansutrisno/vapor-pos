-- Migration: Add tenant_id to settings table for multi-tenant support
-- This migration adds tenant_id column to settings table and updates existing data

-- Add tenant_id column to settings table
ALTER TABLE settings ADD COLUMN tenant_id UUID;

-- Create index for better performance on tenant_id queries
CREATE INDEX idx_settings_tenant_id ON settings(tenant_id);

-- Update existing settings to be global (NULL tenant_id for superadmin settings)
-- These will be the default global settings that can be copied to new tenants
UPDATE settings SET tenant_id = NULL WHERE tenant_id IS NULL;

-- Drop existing RLS policies for settings
DROP POLICY IF EXISTS "settings_select_policy" ON settings;
DROP POLICY IF EXISTS "settings_insert_policy" ON settings;
DROP POLICY IF EXISTS "settings_update_policy" ON settings;
DROP POLICY IF EXISTS "settings_delete_policy" ON settings;

-- Create new RLS policies for multi-tenant settings
-- Superadmin can access all settings (global and tenant-specific)
CREATE POLICY "settings_superadmin_all_access" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- Admin can only access their tenant's settings
CREATE POLICY "settings_admin_tenant_access" ON settings
    FOR ALL USING (
        tenant_id = (
            SELECT tenant_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- All authenticated users can read public settings (both global and their tenant's)
CREATE POLICY "settings_read_public" ON settings
    FOR SELECT USING (
        is_public = true AND (
            tenant_id IS NULL OR -- Global settings
            tenant_id = (
                SELECT tenant_id FROM users 
                WHERE users.id = auth.uid()
            )
        )
    );

-- Function to create default settings for a new tenant
CREATE OR REPLACE FUNCTION create_tenant_default_settings(new_tenant_id UUID)
RETURNS void AS $$
BEGIN
    -- Copy global settings to new tenant
    INSERT INTO settings (key, value, category, description, type, is_public, tenant_id)
    SELECT key, value, category, description, type, is_public, new_tenant_id
    FROM settings 
    WHERE tenant_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_tenant_default_settings(UUID) TO authenticated;

-- Add comment to document the tenant_id column
COMMENT ON COLUMN settings.tenant_id IS 'Tenant ID for multi-tenant isolation. NULL for global settings (superadmin only)';