-- ==============================================================================
-- NearDrop Audit Logs Table & Indexes
-- Version: 1.0.0
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'file', 'share', 'transfer', 'download', 'user', 'system', 'billing', 'auth'
    resource_id TEXT,
    file_name TEXT,
    file_size BIGINT,
    ip_address TEXT,
    device_info TEXT,
    platform TEXT,
    browser TEXT,
    details TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'warning', 'danger')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast log querying & filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip ON public.audit_logs(ip_address);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Service Role full access
CREATE POLICY "Service role full access to audit_logs"
    ON public.audit_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Allow admins to read audit_logs
CREATE POLICY "Admins can view audit_logs"
    ON public.audit_logs
    FOR SELECT
    USING (
        auth.jwt() ->> 'email' IN (
            SELECT email FROM public.profiles WHERE role IN ('admin', 'moderator')
        )
    );
