-- Migration: 20260731000000_platform_audit_logs.sql
-- Description: Create platform_audit_logs table for tracking superadmin actions and system events.

CREATE TABLE IF NOT EXISTS platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email TEXT,
    action_type TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick sorting & filtering
CREATE INDEX IF NOT EXISTS idx_platform_audit_logs_created_at ON platform_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_audit_logs_action_type ON platform_audit_logs (action_type);

-- RLS Policies
ALTER TABLE platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only superadmin can view and insert audit logs
CREATE POLICY "Superadmin full access on platform_audit_logs"
    ON platform_audit_logs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'superadmin'
        )
    );
