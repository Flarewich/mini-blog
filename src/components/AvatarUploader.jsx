import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";
import { useUi } from "../context/UiContext";

export default function AvatarUploader({ userId, currentAvatarUrl, onUploaded }) {
  const { showToast } = useToast();
  const { t } = useUi();
  const [loading, setLoading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(t("selectImage"), "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast(t("fileTooBig"), "error");
      return;
    }

    setLoading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      onUploaded?.(filePath);
      showToast(t("avatarUploaded"), "success");
    } catch (err) {
      showToast(err.message || t("uploadError"), "error");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-950/40 overflow-hidden flex items-center justify-center">
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-gray-500">{t("noAvatar")}</span>
        )}
      </div>

      <label className="inline-block">
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <span className="px-3 py-2 rounded-2xl bg-gray-900 text-white text-sm hover:bg-black cursor-pointer inline-block dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
          {loading ? t("loading") : t("uploadAvatar")}
        </span>
      </label>
    </div>
  );
}
