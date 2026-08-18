-- ==============================================================================
-- NearDrop PostgreSQL Schema & Row Level Security (RLS)
-- Version: 1.0.0
-- ==============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    quota_bytes BIGINT NOT NULL DEFAULT 10737418240, -- 10 GB default
    used_bytes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Devices Table
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL DEFAULT 'desktop', -- 'desktop', 'laptop', 'mobile'
    platform TEXT NOT NULL DEFAULT 'windows',   -- 'windows', 'macos', 'linux', 'android', 'ios'
    public_key TEXT NOT NULL,
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_device UNIQUE(user_id, device_id)
);

-- 3. Trusted Devices Table
CREATE TABLE IF NOT EXISTS public.trusted_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_name TEXT NOT NULL,
    public_key TEXT NOT NULL,
    trusted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_trusted_device UNIQUE(user_id, device_id)
);

-- 4. Transfers Table (Metadata for LAN & Cloud)
CREATE TABLE IF NOT EXISTS public.transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('send', 'receive')),
    mode TEXT NOT NULL CHECK (mode IN ('lan', 'cloud')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'waiting_for_acceptance', 'accepted', 
        'transferring', 'paused', 'completed', 'cancelled', 'failed', 'rejected'
    )),
    peer_device_id TEXT,
    peer_device_name TEXT,
    total_bytes BIGINT NOT NULL DEFAULT 0,
    transferred_bytes BIGINT NOT NULL DEFAULT 0,
    speed BIGINT NOT NULL DEFAULT 0, -- bytes per second
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 5. Transfer Files Table
CREATE TABLE IF NOT EXISTS public.transfer_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_id UUID NOT NULL REFERENCES public.transfers(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    relative_path TEXT NOT NULL DEFAULT '',
    size BIGINT NOT NULL DEFAULT 0,
    checksum TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'transferring', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Cloud Files Table (Stored in Cloudflare R2)
CREATE TABLE IF NOT EXISTS public.cloud_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    r2_object_key TEXT NOT NULL UNIQUE,
    size BIGINT NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    checksum TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 7. Share Links Table
CREATE TABLE IF NOT EXISTS public.share_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cloud_file_id UUID NOT NULL REFERENCES public.cloud_files(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    expires_at TIMESTAMPTZ,
    download_count INT NOT NULL DEFAULT 0,
    max_downloads INT, -- NULL means unlimited
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    download_path TEXT,
    auto_accept_trusted BOOLEAN NOT NULL DEFAULT FALSE,
    max_concurrent_transfers INT NOT NULL DEFAULT 3,
    preferred_interface TEXT,
    transfer_port INT NOT NULL DEFAULT 45454,
    theme TEXT NOT NULL DEFAULT 'system',
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON public.trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON public.transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_transfer_files_transfer_id ON public.transfer_files(transfer_id);
CREATE INDEX IF NOT EXISTS idx_cloud_files_user_id ON public.cloud_files(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_files_expires_at ON public.cloud_files(expires_at) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_share_links_token ON public.share_links(token) WHERE is_active = TRUE;

-- ==============================================================================
-- TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER update_devices_modtime
    BEFORE UPDATE ON public.devices
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER update_user_settings_modtime
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- Update used_bytes in profiles upon cloud file creation or deletion
CREATE OR REPLACE FUNCTION handle_cloud_file_quota()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.is_deleted = FALSE) THEN
        UPDATE public.profiles
        SET used_bytes = used_bytes + NEW.size
        WHERE id = NEW.user_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE) THEN
            UPDATE public.profiles
            SET used_bytes = GREATEST(0, used_bytes - OLD.size)
            WHERE id = OLD.user_id;
        ELSIF (OLD.size != NEW.size AND NEW.is_deleted = FALSE) THEN
            UPDATE public.profiles
            SET used_bytes = GREATEST(0, used_bytes + (NEW.size - OLD.size))
            WHERE id = NEW.user_id;
        END IF;
    ELSIF (TG_OP = 'DELETE' AND OLD.is_deleted = FALSE) THEN
        UPDATE public.profiles
        SET used_bytes = GREATEST(0, used_bytes - OLD.size)
        WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cloud_file_quota
    AFTER INSERT OR UPDATE OR DELETE ON public.cloud_files
    FOR EACH ROW EXECUTE FUNCTION handle_cloud_file_quota();

-- Auto create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can select/update only their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Devices: Users can manage only their own devices
CREATE POLICY "Users can manage own devices"
    ON public.devices FOR ALL
    USING (auth.uid() = user_id);

-- Trusted Devices: Users can manage their own trusted devices
CREATE POLICY "Users can manage trusted devices"
    ON public.trusted_devices FOR ALL
    USING (auth.uid() = user_id);

-- Transfers: Users can manage their own transfers
CREATE POLICY "Users can manage own transfers"
    ON public.transfers FOR ALL
    USING (auth.uid() = user_id);

-- Transfer Files: Users can manage files associated with their transfers
CREATE POLICY "Users can manage own transfer files"
    ON public.transfer_files FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.transfers
            WHERE public.transfers.id = public.transfer_files.transfer_id
            AND public.transfers.user_id = auth.uid()
        )
    );

-- Cloud Files: Users can manage only their own cloud files
CREATE POLICY "Users can manage own cloud files"
    ON public.cloud_files FOR ALL
    USING (auth.uid() = user_id);

-- Share Links: 
-- 1. Owners can manage their links
CREATE POLICY "Users can manage own share links"
    ON public.share_links FOR ALL
    USING (auth.uid() = user_id);

-- 2. Public can read active unexpired share links by token
CREATE POLICY "Public can view active share links by token"
    ON public.share_links FOR SELECT
    TO anon, authenticated
    USING (
        is_active = TRUE 
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (max_downloads IS NULL OR download_count < max_downloads)
    );

-- User Settings: Users can manage only their own settings
CREATE POLICY "Users can manage own settings"
    ON public.user_settings FOR ALL
    USING (auth.uid() = user_id);
