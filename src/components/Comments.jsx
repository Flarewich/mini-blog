import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Comments({ postId }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("id, content, user_id, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (error) showToast(error.message, "error");
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function addComment(e) {
    e.preventDefault();
    if (!user) return showToast("Войди, чтобы комментировать.", "error");

    const content = text.trim();
    if (!content) return;

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      content,
    });

    if (error) return showToast(error.message, "error");

    setText("");
    await load();
  }

  async function deleteComment(id) {
    const ok = confirm("Удалить комментарий?");
    if (!ok) return;

    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return showToast(error.message, "error");

    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-semibold">Комментарии</h3>

      <form onSubmit={addComment} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
          placeholder={user ? "Написать комментарий..." : "Войди, чтобы комментировать"}
          disabled={!user}
        />
        <button
          disabled={!user}
          className="px-3 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-black disabled:opacity-50"
        >
          Отправить
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-600 mt-3">Загрузка...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-600 mt-3">Комментариев пока нет.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((c) => (
            <div key={c.id} className="bg-gray-50 border rounded-2xl p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="text-xs text-gray-500">
                  {new Date(c.created_at).toLocaleString()}
                </div>
                {user?.id === c.user_id && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="text-xs underline text-gray-700"
                  >
                    удалить
                  </button>
                )}
              </div>
              <div className="mt-1 text-sm whitespace-pre-wrap">{c.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
