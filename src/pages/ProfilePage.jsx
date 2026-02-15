import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getAvatarPublicUrl, getMyProfile, updateMyProfile } from "../lib/profile";
import AvatarUploader from "../components/AvatarUploader";
import { useUi } from "../context/UiContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useUi();

  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const p = await getMyProfile(user.id);
      setProfile(p);
      setAvatarUrl(getAvatarPublicUrl(p.avatar_path));
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

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight">{t("profile")}</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight">{t("profile")}</h1>

      <div className="mt-6 bg-white/80 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-800/70 rounded-3xl p-5 shadow-sm space-y-6">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t("avatar")}</p>
          <AvatarUploader
            userId={user.id}
            currentAvatarUrl={avatarUrl}
            onUploaded={onAvatarUploaded}
          />
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t("username")}
            </label>
            <input
              value={profile.username ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
              className="mt-1 w-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
              placeholder="e.g. flarewich"
              maxLength={32}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t("fullName")}
            </label>
            <input
              value={profile.full_name ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
              className="mt-1 w-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
              placeholder="John Doe"
              maxLength={80}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t("website")}
            </label>
            <input
              value={profile.website ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
              className="mt-1 w-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
              placeholder="https://..."
              maxLength={120}
            />
          </div>

          <button
            disabled={saving}
            className="px-4 py-2 rounded-2xl bg-gray-900 text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            {saving ? t("saving") : t("save")}
          </button>

          <div className="text-xs text-gray-500">
            <div>Email: {user.email}</div>
            <div className="break-all">ID: {user.id}</div>
          </div>
        </form>
      </div>
    </div>
  );
}
