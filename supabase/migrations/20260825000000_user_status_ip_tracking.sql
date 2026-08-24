-- ==============================================================================
-- NearDrop Migration: Extended User Status, Notes & Detailed IP Tracking
-- ==============================================================================

-- 1. Extend profiles table with status, detailed IP tracking and admin notes
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended')),
ADD COLUMN IF NOT EXISTS last_ip TEXT,
ADD COLUMN IF NOT EXISTS last_device TEXT,
ADD COLUMN IF NOT EXISTS last_browser TEXT,
ADD COLUMN IF NOT EXISTS last_platform TEXT,
ADD COLUMN IF NOT EXISTS last_country TEXT,
ADD COLUMN IF NOT EXISTS last_city TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Extend devices table with ip_address, browser and user_agent
ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- 3. Create index for fast user and IP lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_ip ON public.profiles(last_ip);
CREATE INDEX IF NOT EXISTS idx_devices_ip_address ON public.devices(ip_address);
