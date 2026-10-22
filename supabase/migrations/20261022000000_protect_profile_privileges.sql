-- ==============================================================================
-- Profil yetkilerini koru
-- "Users can update own profile" politikası kullanıcının kendi satırındaki TÜM sütunları
-- değiştirmesine izin veriyordu: tarayıcıdan anon anahtarla role = 'admin',
-- subscription_tier = 'enterprise' ya da sınırsız quota_bytes yazılabiliyordu.
-- Bu tetikleyiciyle son kullanıcılar (anon / authenticated) yalnızca aşağıdaki
-- izinli alanları değiştirebilir; rol, plan, kota, durum ve izleme alanları yalnızca
-- sunucu (service_role) ve SECURITY DEFINER fonksiyonları tarafından yazılır.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    -- Kullanıcının kendi profilinde değiştirebileceği alanlar
    user_editable CONSTANT TEXT[] := ARRAY['display_name', 'avatar_url', 'notify_on_download', 'updated_at'];
BEGIN
    IF current_user NOT IN ('anon', 'authenticated') THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        -- İstemciden açılan profil her zaman varsayılan yetkilerle başlar
        NEW.role := 'member';
        NEW.subscription_tier := 'free';
        NEW.subscription_status := 'active';
        NEW.subscription_renews_at := NULL;
        NEW.quota_bytes := 2147483648;
        NEW.used_bytes := 0;
        NEW.status := 'active';
        NEW.notes := NULL;
        RETURN NEW;
    END IF;

    IF (to_jsonb(NEW) - user_editable) IS DISTINCT FROM (to_jsonb(OLD) - user_editable) THEN
        RAISE EXCEPTION 'Bu profil alanları yalnızca sunucu tarafından değiştirilebilir'
            USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_privileges ON public.profiles;
CREATE TRIGGER protect_profile_privileges
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileges();
