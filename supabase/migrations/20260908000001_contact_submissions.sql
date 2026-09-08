-- ==============================================================================
-- NearDrop Migration: Contact Submissions Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    ip_address TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for date sorting
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact messages
CREATE POLICY "Public insert on contact_submissions" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Service role full access on contact_submissions" ON public.contact_submissions
    FOR ALL USING (true) WITH CHECK (true);
