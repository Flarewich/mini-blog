import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ProfileHeader from "../components/ProfileHeader";
import PostCard from "../components/PostCard";
import { useUi } from "../context/UiContext";

export default function UserProfilePage() {
  const { username } = useParams();
  const { t } = useUi();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const userId = profile?.id;

  const avatarUrl = useMemo(() => {
    if (!profile?.avatar_path) return null;
    // если ты уже делаешь publicUrl в другом месте — можешь оставить как есть
    const { data } = supabase.storage.from("avatars").getPublicUrl(profile.avatar_path);
    return data?.publicUrl ?? null;
  }, [profile?.avatar_path]);

  const coverUrl = useMemo(() => {
    if (!profile?.cover_path) return null;
    const { data } = supabase.storage.from("covers").getPublicUrl(profile.cover_path);
    return data?.publicUrl ?? null;
  }, [profile?.cover_path]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setErr("");

      // 1) профиль по username
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_path, cover_path")
        .eq("username", username)
        .maybeSingle();

      if (ignore) return;

      if (profErr) {
        setErr(profErr.message);
        setLoading(false);
        return;
      }

      if (!prof) {
        setErr("Пользователь не найден");
        setLoading(false);
        return;
      }

      setProfile(prof);

      // 2) посты пользователя
      const { data: userPosts, error: postsErr } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", prof.id)
        .order("created_at", { ascending: false });

      if (ignore) return;

      if (postsErr) {
        setErr(postsErr.message);
        setLoading(false);
        return;
      }

      setPosts(userPosts || []);

      // 3) статистика (лайки/комменты) — если у тебя такие таблицы есть
      // если таблиц нет — просто оставь 0, ничего не сломается
      try {
        const [{ count: likeC }, { count: commC }] = await Promise.all([
          supabase.from("likes").select("*", { count: "exact", head: true }).eq("user_id", prof.id),
          supabase.from("comments").select("*", { count: "exact", head: true }).eq("user_id", prof.id),
        ]);

        if (!ignore) {
          setLikesCount(likeC || 0);
          setCommentsCount(commC || 0);
        }
      } catch {
        // если таблиц нет или RLS — просто молча пропускаем
      }

      setLoading(false);
    }

    load();
    return () => {
      ignore = true;
    };
  }, [username]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {loading && (
        <div className="text-sm text-gray-500 dark:text-gray-400">{t("loading")}</div>
      )}

      {!loading && err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {err}
        </div>
      )}

      {!loading && !err && profile && (
        <>
          <ProfileHeader
            profile={profile}
            avatarUrl={avatarUrl}
            coverUrl={coverUrl}
            userId={userId}
            // onCoverUploaded не нужен на публичном профиле
            stats={{
              posts: posts.length,
              likes: likesCount,
              comments: commentsCount,
            }}
            t={t}
            readonly
          />

          <div className="mt-8 space-y-4">
            {posts.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t("noPosts")}
              </div>
            ) : (
              posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
