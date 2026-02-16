import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUi } from "../context/UiContext";

export default function LikeButton({
  postId,
  postAuthorId,     // ✅ ДОБАВИЛИ
  likedByMe,
  likesCount,
  onChanged,
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useUi();

  async function toggleLike() {
    if (!user) {
      showToast(t("likeLoginRequired"), "error");
      return;
    }

    try {
      if (likedByMe) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
        onChanged?.({ liked: false });
      } else {
        // ✅ 1) ставим лайк
        const { error: likeError } = await supabase.from("post_likes").insert({
          post_id: postId,
          user_id: user.id,
        });

        if (likeError) throw likeError;
        onChanged?.({ liked: true });

        // ✅ 2) создаём уведомление автору (если лайкаем НЕ себя)
        if (postAuthorId && postAuthorId !== user.id) {
          const { error: notifError } = await supabase
            .from("notifications")
            .insert({
              user_id: postAuthorId,   // кому
              sender_id: user.id,      // кто
              type: "like",
              post_id: postId,
              is_read: false,
            });

          // ⚠️ не ломаем лайк, даже если уведомление не вставилось
          if (notifError) console.error("notif insert error:", notifError);
        }
      }
    } catch (err) {
      showToast(err.message || "Error", "error");
    }
  }

  return (
    <button
      onClick={toggleLike}
      className={
        "px-3 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-800 " +
        (likedByMe
          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          : "bg-white/70 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900")
      }
    >
      ❤️ {likesCount}
    </button>
  );
}
