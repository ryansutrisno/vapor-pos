-- RPC functions to handle settings queries without UUID parsing issues

-- Function to get all global settings (for superadmin)
CREATE OR REPLACE FUNCTION get_global_settings()
RETURNS TABLE (
  id uuid,
  key text,
  value text,
  category text,
  description text,
  data_type text,
  is_public boolean,
  tenant_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    s.id,
    s.key,
    s.value,
    s.category,
    s.description,
    s.data_type,
    s.is_public,
    s.tenant_id,
    s.created_at,
    s.updated_at
  FROM settings s
  WHERE s.tenant_id IS NULL
  ORDER BY s.category ASC, s.key ASC;
$$;

-- Function to get global settings by category (for superadmin)
CREATE OR REPLACE FUNCTION get_global_settings_by_category(category_name text)
RETURNS TABLE (
  id uuid,
  key text,
  value text,
  category text,
  description text,
  data_type text,
  is_public boolean,
  tenant_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    s.id,
    s.key,
    s.value,
    s.category,
    s.description,
    s.data_type,
    s.is_public,
    s.tenant_id,
    s.created_at,
    s.updated_at
  FROM settings s
  WHERE s.tenant_id IS NULL AND s.category = category_name
  ORDER BY s.key ASC;
$$;

-- Function to get single global setting (for superadmin)
CREATE OR REPLACE FUNCTION get_global_setting(setting_key text)
RETURNS TABLE (
  value text,
  data_type text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT s.value, s.data_type
  FROM settings s
  WHERE s.tenant_id IS NULL AND s.key = setting_key
  LIMIT 1;
$$;

-- Function to update global setting (for superadmin)
CREATE OR REPLACE FUNCTION update_global_setting(setting_key text, setting_value text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE settings 
  SET value = setting_value, updated_at = NOW()
  WHERE tenant_id IS NULL AND key = setting_key;
$$;

-- Function to get public global settings
CREATE OR REPLACE FUNCTION get_public_global_settings()
RETURNS TABLE (
  key text,
  value text,
  data_type text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT s.key, s.value, s.data_type
  FROM settings s
  WHERE s.tenant_id IS NULL AND s.is_public = true;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_global_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION get_global_settings_by_category(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_global_setting(text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_global_setting(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_global_settings() TO authenticated;

-- Grant execute permissions to anon users for public settings
GRANT EXECUTE ON FUNCTION get_public_global_settings() TO anon;