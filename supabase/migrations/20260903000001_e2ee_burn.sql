-- ==============================================================================
-- NearDrop Migration: E2EE Encryption & Burn-After-Read Support
-- ==============================================================================

-- Add encryption fields to cloud_files
ALTER TABLE public.cloud_files
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS encryption_iv TEXT;

-- Add burn-after-read to share_links
ALTER TABLE public.share_links
ADD COLUMN IF NOT EXISTS burn_after_read BOOLEAN NOT NULL DEFAULT FALSE;
