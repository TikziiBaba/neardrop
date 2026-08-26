-- Migration: Folder Sharing Support in share_links table

-- 1. Make cloud_file_id nullable so folder-level shares don't require a single file
ALTER TABLE public.share_links ALTER COLUMN cloud_file_id DROP NOT NULL;

-- 2. Add folder_path, title, and description columns to share_links
ALTER TABLE public.share_links ADD COLUMN IF NOT EXISTS folder_path TEXT;
ALTER TABLE public.share_links ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.share_links ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Index on folder_path and user_id for fast folder lookups
CREATE INDEX IF NOT EXISTS idx_share_links_folder_path ON public.share_links(user_id, folder_path);
