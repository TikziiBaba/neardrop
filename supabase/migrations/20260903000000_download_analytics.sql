-- ==============================================================================
-- NearDrop Migration: Download Analytics & Access Statistics
-- Tracks every download event with geo, browser, OS, and device info
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.download_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    share_link_id UUID REFERENCES public.share_links(id) ON DELETE SET NULL,
    cloud_file_id UUID REFERENCES public.cloud_files(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- file owner
    downloader_ip TEXT,
    country TEXT,
    city TEXT,
    browser TEXT,
    os TEXT,
    device_type TEXT DEFAULT 'desktop', -- 'desktop', 'mobile', 'tablet'
    referrer TEXT,
    user_agent TEXT,
    bytes_downloaded BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_download_events_file ON public.download_events(cloud_file_id);
CREATE INDEX IF NOT EXISTS idx_download_events_share ON public.download_events(share_link_id);
CREATE INDEX IF NOT EXISTS idx_download_events_user ON public.download_events(user_id);
CREATE INDEX IF NOT EXISTS idx_download_events_created ON public.download_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_download_events_country ON public.download_events(country);

-- Enable RLS
ALTER TABLE public.download_events ENABLE ROW LEVEL SECURITY;

-- File owners can view their own download events
CREATE POLICY "File owners can view download events"
    ON public.download_events
    FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert (API routes run server-side)
CREATE POLICY "Service role can insert download events"
    ON public.download_events
    FOR INSERT
    WITH CHECK (true);

-- Admins can view all download events
CREATE POLICY "Admins can view all download events"
    ON public.download_events
    FOR SELECT
    USING (
        auth.jwt() ->> 'email' IN (
            SELECT email FROM public.profiles WHERE role IN ('admin', 'moderator')
        )
    );
