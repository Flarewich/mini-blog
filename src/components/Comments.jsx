import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUi } from "../context/UiContext";

export default function Comments({ postId }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useUi();

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
    if (!user) return showToast(t("commentLoginRequired"), "error");

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
    const ok = confirm(t("deleteCommentConfirm"));
    if (!ok) return;

    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return showToast(error.message, "error");

    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="mt-4 border-t border-gray-200/70 dark:border-gray-800/70 pt-4">
      <h3 className="font-semibold">{t("commentsTitle")}</h3>

      <form onSubmit={addComment} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
          placeholder={user ? t("commentPlaceholder") : t("commentPlaceholderGuest")}
          disabled={!user}
        />
        <button
          disabled={!user}
          className="px-3 py-2 rounded-2xl bg-gray-900 text-white text-sm hover:bg-black disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          {t("send")}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{t("loading")}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{t("noComments")}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((c) => (
            <div
              key={c.id}
              className="bg-gray-50 dark:bg-gray-950/30 border border-gray-200/70 dark:border-gray-800/70 rounded-2xl p-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-xs text-gray-500">
                  {new Date(c.created_at).toLocaleString()}
                </div>
                {user?.id === c.user_id && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="text-xs underline text-gray-700 dark:text-gray-300"
                  >
                    {t("deleteSmall")}
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
