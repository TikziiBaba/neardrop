-- ==============================================================================
-- Herkese açık kalan "service role" politikalarını kaldır
-- Bu politikalar "TO service_role" belirtilmeden yazıldığı için tüm rollere (anon dahil)
-- uygulanıyordu: sitedeki herkese açık anon anahtarla ödemeler, iletişim formu mesajları
-- ve denetim kayıtları okunup değiştirilebiliyordu. service_role RLS'yi zaten atladığından
-- sunucu tarafındaki API'ler (getServiceClient) bu politikalara ihtiyaç duymaz.
-- Kalanlar: kullanıcının kendi ödemesini / indirme olaylarını görmesi, adminlerin
-- denetim kayıtlarını görmesi ve iletişim formuna herkese açık ekleme.
-- ==============================================================================

DO $$
BEGIN
    IF to_regclass('public.audit_logs') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Service role full access to audit_logs" ON public.audit_logs;
    END IF;

    IF to_regclass('public.payments') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Service role full access on payments" ON public.payments;
    END IF;

    IF to_regclass('public.contact_submissions') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Service role full access on contact_submissions" ON public.contact_submissions;
    END IF;

    -- Herkesin sahte indirme olayı ekleyip analitiği bozmasını engeller
    IF to_regclass('public.download_events') IS NOT NULL THEN
        DROP POLICY IF EXISTS "Service role can insert download events" ON public.download_events;
    END IF;
END $$;
