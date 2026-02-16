import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LikeButton from "./LikeButton";
import Comments from "./Comments";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUi } from "../context/UiContext";

export default function PostCard({ post, onDelete, author }) {
  const { user } = useAuth();
  const { t } = useUi();
  const isOwner = user?.id === post.user_id;

  const [likedByMe, setLikedByMe] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  const avatarUrl = author?.avatar_path
    ? supabase.storage.from("avatars").getPublicUrl(author.avatar_path).data.publicUrl
    : null;

  const authorName = author?.full_name || author?.username || "User";

  async function loadLikes() {
    const { count, error: countErr } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id);

    if (!countErr) setLikesCount(count || 0);

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

  // ✅ Новая система вложений (post_attachments)
  const { images, files, links } = useMemo(() => {
    const atts = post.attachments || [];
    return {
      images: atts.filter((a) => a.kind === "image"),
      files: atts.filter((a) => a.kind === "file"),
      links: atts.filter((a) => a.kind === "link"),
    };
  }, [post.attachments]);

  // ✅ Фоллбек: если где-то ещё остались старые поля posts.image_url/file_url/link_url
  const legacyImages = useMemo(() => {
    const out = [];
    if (post.image_url) out.push({ id: "legacy-image", url: post.image_url });
    return out;
  }, [post.image_url]);

  const legacyFiles = useMemo(() => {
    const out = [];
    if (post.file_url) out.push({ id: "legacy-file", url: post.file_url, name: post.file_name });
    return out;
  }, [post.file_url, post.file_name]);

  const legacyLinks = useMemo(() => {
    const out = [];
    if (post.link_url) out.push({ id: "legacy-link", url: post.link_url });
    return out;
  }, [post.link_url]);

  const showImages = images.length ? images : legacyImages;
  const showFiles = files.length ? files : legacyFiles;
  const showLinks = links.length ? links : legacyLinks;

  return (
    <article className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 rounded-3xl p-5 shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <Link
          to={author?.username ? `/u/${author.username}` : "#"}
          className="flex items-start gap-3 hover:opacity-90"
          onClick={(e) => {
            if (!author?.username) e.preventDefault();
          }}
        >
          <div className="w-10 h-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950/40 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-zinc-500">🙂</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm truncate">{authorName}</span>
              {author?.username ? (
                <span className="text-xs text-zinc-500 truncate">@{author.username}</span>
              ) : null}
            </div>

            <p className="text-xs text-zinc-500 mt-0.5">
              {new Date(post.created_at).toLocaleString()}
            </p>

            <h2 className="text-lg font-semibold mt-2">{post.title}</h2>
          </div>
        </Link>

        {isOwner && (
          <div className="flex gap-2">
            <Link
              to={`/edit/${post.id}`}
              className="px-3 py-2 text-sm rounded-2xl bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {t("edit")}
            </Link>
            <button
              onClick={() => onDelete?.(post.id)}
              className="px-3 py-2 text-sm rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 hover:bg-zinc-200 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              {t("delete")}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-zinc-800 dark:text-zinc-100 mt-3 whitespace-pre-wrap">{post.content}</p>

      {/* ✅ Attachments (multi) */}
      {(showImages.length > 0 || showFiles.length > 0 || showLinks.length > 0) && (
        <div className="mt-3 space-y-3">
          {/* Images grid */}
          {showImages.length > 0 && (
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
              {showImages.slice(0, 6).map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => window.open(img.url, "_blank")}
                  className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black/10 hover:opacity-95"
                  title="Open"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-[160px] object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Links */}
          {showLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {showLinks.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/30 hover:bg-white/80 dark:hover:bg-zinc-950/50"
                >
                  🔗 <span className="max-w-[240px] truncate">{l.url}</span>
                </a>
              ))}
            </div>
          )}

          {/* Files */}
          {showFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {showFiles.map((f) => (
                <a
                  key={f.id}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/30 hover:bg-white/80 dark:hover:bg-zinc-950/50"
                >
                  📎 <span className="max-w-[240px] truncate">{f.name || "Файл"}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
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
          className="px-3 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          💬 {post.comments?.[0]?.count || 0}
        </button>
      </div>

      {showComments && <Comments postId={post.id} />}
    </article>
  );
}
