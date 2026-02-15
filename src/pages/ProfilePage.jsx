import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUi } from "../context/UiContext";
import { supabase } from "../lib/supabase";
import { getAvatarPublicUrl, getMyProfile, updateMyProfile } from "../lib/profile";
import AvatarUploader from "../components/AvatarUploader";
import ProfileHeader from "../components/ProfileHeader";

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useUi();

  const [profile, setProfile] = useState(null);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);

  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ posts: 0, likes: 0, comments: 0 });

  async function load() {
    try {
      const p = await getMyProfile(user.id);
      setProfile(p);

      // avatar url
      setAvatarUrl(getAvatarPublicUrl(p.avatar_path));

      // cover url (bucket covers)
      const cover = p.cover_path
        ? supabase.storage.from("covers").getPublicUrl(p.cover_path).data.publicUrl
        : null;
      setCoverUrl(cover);

      // posts count
      const { count: postsCount, error: postsErr } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (postsErr) throw postsErr;

      // likes count (сколько лайков поставил пользователь)
      const { count: likesCount, error: likesErr } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (likesErr) throw likesErr;

      // comments count
      const { count: commentsCount, error: commentsErr } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (commentsErr) throw commentsErr;

      setStats({
        posts: postsCount || 0,
        likes: likesCount || 0,
        comments: commentsCount || 0,
      });
    } catch (err) {
      showToast(err.message || t("profileLoadError"), "error");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function saveProfile(e) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const updated = await updateMyProfile(user.id, {
        username: profile.username?.trim() || null,
        full_name: profile.full_name?.trim() || null,
        website: profile.website?.trim() || null,
      });

      setProfile(updated);
      showToast(t("profileSaved"), "success");
    } catch (err) {
      showToast(err.message || t("profileSaveError"), "error");
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarUploaded(filePath) {
    try {
      const updated = await updateMyProfile(user.id, { avatar_path: filePath });
      setProfile(updated);
      setAvatarUrl(getAvatarPublicUrl(updated.avatar_path));
    } catch (err) {
      showToast(err.message || t("avatarLinkedError"), "error");
    }
  }

  async function onCoverUploaded(filePath) {
    try {
      const updated = await updateMyProfile(user.id, { cover_path: filePath });
      setProfile(updated);

      const url = updated.cover_path
        ? supabase.storage.from("covers").getPublicUrl(updated.cover_path).data.publicUrl
        : null;

      setCoverUrl(url);
      showToast("Обложка обновлена.", "success");
    } catch (err) {
      showToast(err.message || "Не удалось привязать обложку", "error");
    }
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight">{t("profile")}</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-300">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{t("profile")}</h1>

      {/* Social header with editable cover */}
      <ProfileHeader
        profile={profile}
        avatarUrl={avatarUrl}
        coverUrl={coverUrl}
        userId={user.id}
        onCoverUploaded={onCoverUploaded}
        stats={stats}
        t={t}
      />

      {/* Edit profile card */}
      <div className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 rounded-3xl p-5 shadow-sm space-y-6">
        <div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-2">{t("avatar")}</p>
          <AvatarUploader
            userId={user.id}
            currentAvatarUrl={avatarUrl}
            onUploaded={onAvatarUploaded}
          />
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t("username")}
            </label>
            <input
              value={profile.username ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
              className="mt-1 w-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              placeholder="e.g. flarewich"
              maxLength={32}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t("fullName")}
            </label>
            <input
              value={profile.full_name ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
              className="mt-1 w-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              placeholder="John Doe"
              maxLength={80}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t("website")}
            </label>
            <input
              value={profile.website ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
              className="mt-1 w-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              placeholder="https://..."
              maxLength={120}
            />
          </div>

          <button
            disabled={saving}
            className="px-4 py-2 rounded-2xl bg-zinc-900 text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            {saving ? t("saving") : t("save")}
          </button>

         
        </form>
      </div>
    </div>
  );
}
