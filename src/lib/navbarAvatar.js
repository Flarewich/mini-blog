import { supabase } from "./supabase";

// Ищем аватар в bucket "avatars" в папке {userId}/
// Берём последний файл по имени (обычно уникальные имена с timestamp)
export async function getNavbarAvatarUrl(userId) {
  if (!userId) return null;

  const bucket = "avatars";

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(`${userId}`, { limit: 50, offset: 0, sortBy: { column: "name", order: "desc" } });

  if (error) return null;
  if (!data || data.length === 0) return null;

  // берём первый файл (самый "новый" по имени)
  const file = data.find((f) => f.name && !f.name.endsWith("/"));
  if (!file) return null;

  const { data: pub } = supabase.storage
    .from(bucket)
    .getPublicUrl(`${userId}/${file.name}`);

  return pub?.publicUrl || null;
}
