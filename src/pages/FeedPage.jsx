import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import PostCard from "../components/PostCard";
import { useToast } from "../context/ToastContext";

export default function FeedPage() {
  const { showToast } = useToast();

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

    // Realtime: при любом изменении в posts/comments/post_likes — “подтянуть” ленту (с debounce)
    const channel = supabase
      .channel("realtime-mini-blog")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => debounceReload())
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => debounceReload()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_likes" },
        () => debounceReload()
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // showToast("Realtime включён.", "success"); // можно включить если хочешь
        }
      });

    function debounceReload() {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(() => {
        loadPosts().catch((e) => showToast(e.message || "Ошибка обновления", "error"));
      }, 400);
    }

    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id) {
    const ok = confirm("Удалить пост?");
    if (!ok) return;

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }

    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Все посты</h1>
        <button
          onClick={loadPosts}
          className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Обновить
        </button>
      </div>

      {loading && <p className="mt-6 text-gray-600">Загрузка...</p>}
      {errorMsg && (
        <p className="mt-6 text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          {errorMsg}
        </p>
      )}

      {!loading && !errorMsg && posts.length === 0 && (
        <p className="mt-6 text-gray-600">Постов пока нет. Создай первый 🙂</p>
      )}

      <div className="mt-6 space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
