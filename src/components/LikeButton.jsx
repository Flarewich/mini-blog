import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUi } from "../context/UiContext";

export default function LikeButton({ postId, likedByMe, likesCount, onChanged }) {
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
        const { error } = await supabase.from("post_likes").insert({
          post_id: postId,
          user_id: user.id,
        });
        if (error) throw error;
        onChanged?.({ liked: true });
      }
    } catch (err) {
      showToast(err.message || "Error", "error");
    }
  }

  return (
    <button
      onClick={toggleLike}
      className={
        "px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-800 " +
        (likedByMe
          ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
          : "bg-white/70 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900")
      }
    >
      ❤️ {likesCount}
    </button>
  );
}
