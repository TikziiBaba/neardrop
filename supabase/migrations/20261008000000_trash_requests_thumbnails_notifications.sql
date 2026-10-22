-- ═══════════════════════════════════════════════════════════════
-- Çöp kutusu · Dosya isteme bağlantıları · Küçük resimler · İndirme bildirimleri
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Çöp kutusu: silinme zamanı ──
ALTER TABLE public.cloud_files ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_cloud_files_trash
    ON public.cloud_files(user_id, deleted_at)
    WHERE is_deleted = TRUE;

-- Kota tetikleyicisi: çöpten geri yüklenen dosya kotaya tekrar eklenir
-- (eski sürüm sadece silmeyi düşüyordu, geri yüklemeyi hiç saymıyordu).
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
            WHERE id = NEW.user_id;
        ELSIF (OLD.is_deleted = TRUE AND NEW.is_deleted = FALSE) THEN
            UPDATE public.profiles
            SET used_bytes = used_bytes + NEW.size
            WHERE id = NEW.user_id;
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

-- ── 2. Küçük resimler ──
ALTER TABLE public.cloud_files ADD COLUMN IF NOT EXISTS thumbnail_key TEXT;

-- ── 3. Dosya isteme bağlantıları ──
CREATE TABLE IF NOT EXISTS public.file_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    message TEXT,
    expires_at TIMESTAMPTZ,
    max_files INTEGER,                -- NULL = sınırsız
    upload_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_file_requests_user ON public.file_requests(user_id, created_at DESC);

ALTER TABLE public.file_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own file requests" ON public.file_requests
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Bir isteğe yüklenen dosyalar: hangi istekten ve kimden geldiği
ALTER TABLE public.cloud_files ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES public.file_requests(id) ON DELETE SET NULL;
ALTER TABLE public.cloud_files ADD COLUMN IF NOT EXISTS uploaded_by_name TEXT;

-- İstek sayacını yarış koşulu olmadan artır (eşzamanlı yüklemeler için)
CREATE OR REPLACE FUNCTION public.increment_file_request_uploads(p_request_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE public.file_requests
    SET upload_count = upload_count + 1
    WHERE id = p_request_id
      AND is_active = TRUE
      AND (max_files IS NULL OR upload_count < max_files)
      AND (expires_at IS NULL OR expires_at > NOW())
    RETURNING upload_count INTO new_count;
    RETURN new_count; -- NULL: istek kapalı, süresi dolmuş ya da dolu
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 4. Bildirimler ──
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,               -- 'download' | 'request_upload'
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- E-posta ile indirme bildirimi tercihi (varsayılan açık)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notify_on_download BOOLEAN NOT NULL DEFAULT TRUE;
