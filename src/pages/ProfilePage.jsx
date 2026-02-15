import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getAvatarPublicUrl, getMyProfile, updateMyProfile } from "../lib/profile";
import AvatarUploader from "../components/AvatarUploader";

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const p = await getMyProfile(user.id);
      setProfile(p);
      setAvatarUrl(getAvatarPublicUrl(p.avatar_path));
    } catch (err) {
      showToast(err.message || "Не удалось загрузить профиль", "error");
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
      showToast("Профиль сохранён.", "success");
    } catch (err) {
      showToast(err.message || "Ошибка сохранения профиля", "error");
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
      showToast(err.message || "Не удалось привязать аватар", "error");
    }
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Профиль</h1>
        <p className="mt-4 text-gray-600">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Профиль</h1>

      <div className="mt-6 bg-white border rounded-2xl p-4 shadow-sm space-y-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Аватар</p>
          <AvatarUploader
            userId={user.id}
            currentAvatarUrl={avatarUrl}
            onUploaded={onAvatarUploaded}
          />
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              value={profile.username ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
              className="mt-1 w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="например: ivan_77"
              maxLength={32}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input
              value={profile.full_name ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
              className="mt-1 w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Иван Иванов"
              maxLength={80}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              value={profile.website ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
              className="mt-1 w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="https://..."
              maxLength={120}
            />
          </div>

          <button
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black disabled:opacity-60"
          >
            {saving ? "Сохранение..." : "Сохранить"}
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
