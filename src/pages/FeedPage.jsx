import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import PostCard from "../components/PostCard";
import { useToast } from "../context/ToastContext";
import { useUi } from "../context/UiContext";
import Hero from "../components/Hero";
import { fetchPublicProfiles } from "../lib/publicProfiles";
import { useConfirm } from "../context/ConfirmContext";

export default function FeedPage() {
  const { showToast } = useToast();
  const { t } = useUi();
  const { confirm } = useConfirm();

  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const reloadTimer = useRef(null);

  async function loadPosts() {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("posts")
      .select(`*, comments(count)`,)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMsg(error.message);
    } else {
      const authorIds = (data || []).map((p) => p.user_id);

      try {
        const map = await fetchPublicProfiles(authorIds); // Map(id -> profile)
        setProfiles(map);

        // ✅ приклеиваем автора к каждому посту
        const dataWithAuthors = (data || []).map((p) => {
          const a = map.get(p.user_id);
          return {
            ...p,
            author_username: a?.username || "user",
            author_full_name: a?.full_name || a?.username || "User",
            author_avatar_path: a?.avatar_path || null,
          };
        });

        setPosts(dataWithAuthors);
      } catch {
        // если профили не загрузились — просто показываем посты как раньше
        setPosts(data || []);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPosts();

    const channel = supabase
      .channel("realtime-mini-blog")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => debounceReload(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => debounceReload(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_likes" },
        () => debounceReload(),
      )
      .subscribe();

    function debounceReload() {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(() => {
        loadPosts().catch((e) =>
          showToast(e.message || t("errorUpdate"), "error"),
        );
      }, 400);
    }

    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id) {
    const ok = await confirm({
      title: t("delete"),
      message: t("deletePostConfirm"),
      confirmText: t("delete"),
      cancelText: "Cancel",
      danger: true,
    });
    if (!ok) return;

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return showToast(error.message, "error");

    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <Hero />

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {t("allPosts")}
        </h1>

        <button
          onClick={loadPosts}
          className="px-3 py-2 rounded-2xl text-sm btn-soft"
        >
          {t("refresh")}
        </button>
      </div>

      {loading && <p className="mt-6 muted">{t("loading")}</p>}

      {errorMsg && (
        <p
          className="mt-6 card rounded-2xl p-3"
          style={{ borderColor: "color-mix(in srgb, red 25%, var(--border))" }}
        >
          {errorMsg}
        </p>
      )}

      {!loading && !errorMsg && posts.length === 0 && (
        <p className="mt-6 muted">{t("noPosts")}</p>
      )}

      <div className="mt-6 space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={handleDelete}
            author={profiles.get(post.user_id)}
          />
        ))}
      </div>
    </div>
  );
}
