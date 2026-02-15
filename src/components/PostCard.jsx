import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LikeButton from "./LikeButton";
import Comments from "./Comments";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const isOwner = user?.id === post.user_id;

  const [likedByMe, setLikedByMe] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  async function loadLikes() {
    // count лайков
    const { count, error: countErr } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id);

    if (!countErr) setLikesCount(count || 0);

    // likedByMe
    if (user) {
      const { data, error } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("post_id", post.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error) setLikedByMe(Boolean(data));
    } else {
      setLikedByMe(false);
    }
  }

  useEffect(() => {
    loadLikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id, user?.id]);

  return (
    <article className="bg-white border rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{post.title}</h2>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Link
              to={`/edit/${post.id}`}
              className="px-3 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-black"
            >
              Редактировать
            </Link>
            <button
              onClick={() => onDelete?.(post.id)}
              className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              Удалить
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-800 mt-3 whitespace-pre-wrap">{post.content}</p>

      <div className="mt-4 flex items-center gap-2">
        <LikeButton
          postId={post.id}
          likedByMe={likedByMe}
          likesCount={likesCount}
          onChanged={({ liked }) => {
            setLikedByMe(liked);
            setLikesCount((c) => (liked ? c + 1 : Math.max(0, c - 1)));
          }}
        />

        <button
          onClick={() => setShowComments((v) => !v)}
          className="px-3 py-2 rounded-xl text-sm border bg-white hover:bg-gray-50"
        >
          💬 Комментарии
        </button>
      </div>

      {showComments && <Comments postId={post.id} />}
    </article>
  );
}
