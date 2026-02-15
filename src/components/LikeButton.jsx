import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LikeButton({ postId, likedByMe, likesCount, onChanged }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  async function toggleLike() {
    if (!user) {
      showToast("Войди, чтобы ставить лайки.", "error");
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
      showToast(err.message || "Ошибка лайка", "error");
    }
  }

  return (
    <button
      onClick={toggleLike}
      className={
        "px-3 py-2 rounded-xl text-sm border " +
        (likedByMe ? "bg-gray-900 text-white border-gray-900" : "bg-white hover:bg-gray-50")
      }
    >
      ❤️ {likesCount}
    </button>
  );
}
