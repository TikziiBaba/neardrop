import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteR2Object, isR2Configured } from "@/lib/r2/s3-client";

/** Çöp kutusunda dosyaların tutulduğu süre */
export const TRASH_RETENTION_DAYS = 30;

type PurgeRow = { id: string; r2_object_key?: string | null; thumbnail_key?: string | null };

/**
 * Dosyaları kalıcı olarak siler: depodaki nesne + küçük resim + veritabanı kaydı.
 * Depodan silme başarısız olsa bile kayıt silinir (yetim nesneler bulut temizliğinde toplanır).
 */
export async function purgeFiles(serviceClient: SupabaseClient, userId: string, rows: PurgeRow[]) {
  if (rows.length === 0) return 0;

  if (isR2Configured()) {
    await Promise.all(
      rows.flatMap((r) => [r.r2_object_key, r.thumbnail_key].filter(Boolean) as string[]).map((key) =>
        deleteR2Object(key).catch((err) => console.error("R2 purge error:", key, err))
      )
    );
  }

  const { error } = await serviceClient
    .from("cloud_files")
    .delete()
    .eq("user_id", userId)
    .in(
      "id",
      rows.map((r) => r.id)
    );
  if (error) throw error;
  return rows.length;
}
