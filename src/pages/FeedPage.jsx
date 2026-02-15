import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import PostCard from "../components/PostCard";
import { useToast } from "../context/ToastContext";
import { useUi } from "../context/UiContext";
import Hero from "../components/Hero";

export default function FeedPage() {
  const { showToast } = useToast();
  const { t } = useUi();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const reloadTimer = useRef(null);

  async function loadPosts() {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();

    const channel = supabase
      .channel("realtime-mini-blog")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => debounceReload())
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () =>
        debounceReload()
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () =>
        debounceReload()
      )
      .subscribe();

    function debounceReload() {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(() => {
        loadPosts().catch((e) => showToast(e.message || t("errorUpdate"), "error"));
      }, 400);
    }

    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id) {
    const ok = confirm(t("deletePostConfirm"));
    if (!ok) return;

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }

    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <Hero />

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">{t("allPosts")}</h1>
        <button
          onClick={loadPosts}
          className="px-3 py-2 rounded-2xl bg-gray-100 dark:bg-gray-900/50 hover:bg-gray-200 dark:hover:bg-gray-900 text-sm border border-gray-200 dark:border-gray-800"
        >
          {t("refresh")}
        </button>
      </div>

      {loading && <p className="mt-6 text-gray-600 dark:text-gray-300">{t("loading")}</p>}
      {errorMsg && (
        <p className="mt-6 text-red-700 bg-red-50 border border-red-200 rounded-2xl p-3">
          {errorMsg}
        </p>
      )}

      {!loading && !errorMsg && posts.length === 0 && (
        <p className="mt-6 text-gray-600 dark:text-gray-300">{t("noPosts")}</p>
      )}

      <div className="mt-6 space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
