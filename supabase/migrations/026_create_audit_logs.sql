-- Migration: Create audit_logs table with triggers
-- Generatedcode

 by open-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    user_email TEXT,
    user_role TEXT,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'OTHER')),
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);

-- 3. Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Superadmin can view all audit logs
CREATE POLICY "Superadmin can view all audit logs" ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'superadmin'
        )
    );

-- Admin can view their tenant's audit logs
CREATE POLICY "Admin can view tenant audit logs" ON audit_logs
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users WHERE id = auth.uid()
        )
    );

-- System can insert (triggers will handle this)
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT
    WITH CHECK (true);

-- 5. Create trigger functions

-- Function to get user info from auth.uid()
CREATE OR REPLACE FUNCTION audit_get_user_info()
RETURNS TABLE (user_id UUID, user_email TEXT, user_role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.role
    FROM users u
    WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic audit trigger function for INSERT
CREATE OR REPLACE FUNCTION audit_log_insert_function()
RETURNS TRIGGER AS $$
DECLARE
    user_info RECORD;
    audit_meta JSONB;
BEGIN
    -- Get user info
    SELECT * INTO user_info FROM audit_get_user_info();

    -- Parse metadata from request context if available
    audit_meta := COALESCE(
        current_setting('app.request_metadata', true),
        '{}'::jsonb
    )::jsonb;

    INSERT INTO audit_logs (
        tenant_id,
        user_id,
        user_email,
        user_role,
        action,
        entity_type,
        entity_id,
        new_values,
        old_values,
        metadata
    ) VALUES (
        COALESCE(NEW.tenant_id, (SELECT tenant_id FROM users WHERE id = auth.uid())),
        COALESCE(user_info.user_id, NEW.created_by, NEW.user_id, auth.uid()),
        COALESCE(user_info.user_email, (SELECT email FROM users WHERE id = COALESCE(NEW.created_by, NEW.user_id))),
        COALESCE(user_info.user_role, (SELECT role FROM users WHERE id = COALESCE(NEW.created_by, NEW.user_id))),
        'CREATE',
        TG_TABLE_NAME,
        NEW.id,
        to_jsonb(NEW),
        NULL,
        audit_meta || jsonb_build_object(
            'table', TG_TABLE_NAME,
            'triggered_at', NOW()::text
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic audit trigger function for UPDATE
CREATE OR REPLACE FUNCTION audit_log_update_function()
RETURNS TRIGGER AS $$
DECLARE
    user_info RECORD;
    audit_meta JSONB;
BEGIN
    -- Get user info
    SELECT * INTO user_info FROM audit_get_user_info();

    -- Parse metadata from request context if available
    audit_meta := COALESCE(
        current_setting('app.request_metadata', true),
        '{}'::jsonb
    )::jsonb;

    INSERT INTO audit_logs (
        tenant_id,
        user_id,
        user_email,
        user_role,
        action,
        entity_type,
        entity_id,
        new_values,
        old_values,
        metadata
    ) VALUES (
        COALESCE(NEW.tenant_id, (SELECT tenant_id FROM users WHERE id = auth.uid())),
        COALESCE(user_info.user_id, NEW.updated_by, NEW.user_id, auth.uid()),
        COALESCE(user_info.user_email, (SELECT email FROM users WHERE id = COALESCE(NEW.updated_by, NEW.user_id))),
        COALESCE(user_info.user_role, (SELECT role FROM users WHERE id = COALESCE(NEW.updated_by, NEW.user_id))),
        'UPDATE',
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        to_jsonb(NEW),
        to_jsonb(OLD),
        audit_meta || jsonb_build_object(
            'table', TG_TABLE_NAME,
            'triggered_at', NOW()::text
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic audit trigger function for DELETE
CREATE OR REPLACE FUNCTION audit_log_delete_function()
RETURNS TRIGGER AS $$
DECLARE
    user_info RECORD;
    audit_meta JSONB;
BEGIN
    -- Get user info
    SELECT * INTO user_info FROM audit_get_user_info();

    -- Parse metadata from request context if available
    audit_meta := COALESCE(
        current_setting('app.request_metadata', true),
        '{}'::jsonb
    )::jsonb;

    INSERT INTO audit_logs (
        tenant_id,
        user_id,
        user_email,
        user_role,
        action,
        entity_type,
        entity_id,
        new_values,
        old_values,
        metadata
    ) VALUES (
        COALESCE(OLD.tenant_id, (SELECT tenant_id FROM users WHERE id = auth.uid())),
        COALESCE(user_info.user_id, OLD.updated_by, OLD.user_id, auth.uid()),
        COALESCE(user_info.user_email, (SELECT email FROM users WHERE id = COALESCE(OLD.updated_by, OLD.user_id))),
        COALESCE(user_info.user_role, (SELECT role FROM users WHERE id = COALESCE(OLD.updated_by, OLD.user_id))),
        'DELETE',
        TG_TABLE_NAME,
        OLD.id,
        NULL,
        to_jsonb(OLD),
        audit_meta || jsonb_build_object(
            'table', TG_TABLE_NAME,
            'triggered_at', NOW()::text
        )
    );

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create triggers for each audited table

-- Users table
CREATE TRIGGER audit_users_insert
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION audit_log_insert_function();

CREATE TRIGGER audit_users_update
    AFTER UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_log_update_function();

CREATE TRIGGER audit_users_delete
    AFTER DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_log_delete_function();

-- Stores table
CREATE TRIGGER audit_stores_insert
    AFTER INSERT ON stores
    FOR EACH ROW EXECUTE FUNCTION audit_log_insert_function();

CREATE TRIGGER audit_stores_update
    AFTER UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION audit_log_update_function();

CREATE TRIGGER audit_stores_delete
    AFTER DELETE ON stores
    FOR EACH ROW EXECUTE FUNCTION audit_log_delete_function();

-- Products table
CREATE TRIGGER audit_products_insert
    AFTER INSERT ON products
    FOR EACH ROW EXECUTE FUNCTION audit_log_insert_function();

CREATE TRIGGER audit_products_update
    AFTER UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_log_update_function();

CREATE TRIGGER audit_products_delete
    AFTER DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_log_delete_function();

-- Categories table
CREATE TRIGGER audit_categories_insert
    AFTER INSERT ON categories
    FOR EACH ROW EXECUTE FUNCTION audit_log_insert_function();

CREATE TRIGGER audit_categories_update
    AFTER UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION audit_log_update_function();

CREATE TRIGGER audit_categories_delete
    AFTER DELETE ON categories
    FOR EACH ROW EXECUTE FUNCTION audit_log_delete_function();

-- Customers table
CREATE TRIGGER audit_customers_insert
    AFTER INSERT ON customers
    FOR EACH ROW EXECUTE FUNCTION audit_log_insert_function();

CREATE TRIGGER audit_customers_update
    AFTER UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION audit_log_update_function();

CREATE TRIGGER audit_customers_delete
    AFTER DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION audit_log_delete_function();

-- Settings table
CREATE TRIGGER audit_settings_insert
    AFTER INSERT ON settings
    FOR EACH ROW EXECUTE FUNCTION audit_log_insert_function();

CREATE TRIGGER audit_settings_update
    AFTER UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION audit_log_update_function();

CREATE TRIGGER audit_settings_delete
    AFTER DELETE ON settings
    FOR EACH ROW EXECUTE FUNCTION audit_log_delete_function();

-- Cash sessions table
CREATE TRIGGER audit_cash_sessions_insert
    AFTER INSERT ON cash_sessions
    FOR EACH ROW EXECUTE FUNCTION audit_log_insert_function();

CREATE TRIGGER audit_cash_sessions_update
    AFTER UPDATE ON cash_sessions
    FOR EACH ROW EXECUTE FUNCTION audit_log_update_function();

CREATE TRIGGER audit_cash_sessions_delete
    AFTER DELETE ON cash_sessions
    FOR EACH ROW EXECUTE FUNCTION audit_log_delete_function();

-- 7. Create function for manual audit logging (for actions without table triggers)
CREATE OR REPLACE FUNCTION create_audit_log(
    p_tenant_id UUID,
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_user_email TEXT;
    v_user_role TEXT;
BEGIN
    -- Get user info
    SELECT email, role INTO v_user_email, v_user_role
    FROM users
    WHERE id = p_user_id;

    INSERT INTO audit_logs (
        tenant_id,
        user_id,
        user_email,
        user_role,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        metadata
    ) VALUES (
        p_tenant_id,
        p_user_id,
        v_user_email,
        v_user_role,
        p_action,
        p_entity_type,
        p_entity_id,
        p_old_values,
        p_new_values,
        p_metadata
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create retention policy function (90 days default)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(p_retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs
    WHERE created_at < NOW() - (p_retention_days || ' days')::interval
    AND is_deleted = FALSE
    RETURNING COUNT(*) INTO v_deleted_count;

    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create view for audit logs summary
CREATE OR REPLACE VIEW audit_logs_summary AS
SELECT
    entity_type,
    action,
    COUNT(*) as count,
    MIN(created_at) as first_occurrence,
    MAX(created_at) as last_occurrence
FROM audit_logs
WHERE is_deleted = FALSE
GROUP BY entity_type, action
ORDER BY last_occurrence DESC;

-- 10. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON audit_logs_summary TO authenticated;
GRANT EXECUTE ON FUNCTION create_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs TO authenticated;

-- 11. Add settings for retention configuration
-- Insert default retention setting if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM settings
        WHERE key = 'audit_log_retention_days'
        AND tenant_id IS NULL
    ) THEN
        INSERT INTO settings (key, value, description, tenant_id, is_system)
        VALUES (
            'audit_log_retention_days',
            '90',
            'Number of days to retain audit logs before automatic cleanup',
            NULL,
            TRUE
        );
    END IF;
END $$;
