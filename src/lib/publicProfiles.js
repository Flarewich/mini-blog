import { supabase } from "./supabase";

// Загружаем профили для списка userId
export async function fetchPublicProfiles(userIds) {
  const uniq = Array.from(new Set(userIds)).filter(Boolean);
  if (uniq.length === 0) return new Map();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_path")
    .in("id", uniq);

  if (error) throw error;

  const map = new Map();
  (data || []).forEach((p) => map.set(p.id, p));
  return map;
}
