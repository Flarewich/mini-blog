import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";

export default function AvatarUploader({ userId, currentAvatarUrl, onUploaded }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // простая валидация
    if (!file.type.startsWith("image/")) {
      showToast("Выбери картинку (jpg/png/webp).", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Файл слишком большой (макс 2MB).", "error");
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
      showToast("Аватар загружен.", "success");
    } catch (err) {
      showToast(err.message || "Ошибка загрузки", "error");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl border bg-gray-100 overflow-hidden flex items-center justify-center">
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-gray-500">No avatar</span>
        )}
      </div>

      <label className="inline-block">
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <span className="px-3 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-black cursor-pointer inline-block">
          {loading ? "Загрузка..." : "Загрузить аватар"}
        </span>
      </label>
    </div>
  );
}
