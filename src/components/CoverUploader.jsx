import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";
import { useUi } from "../context/UiContext";

export default function CoverUploader({ userId, coverUrl, onUploaded }) {
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

    if (file.size > 4 * 1024 * 1024) {
      showToast("Файл слишком большой (макс 4MB).", "error");
      return;
    }

    setLoading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      onUploaded?.(filePath);
      showToast("Обложка обновлена.", "success");
    } catch (err) {
      showToast(err.message || t("uploadError"), "error");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="relative group">
      <div className="h-28 md:h-32 rounded-t-3xl overflow-hidden bg-gradient-to-r from-zinc-200 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
        {coverUrl ? <img src={coverUrl} alt="cover" className="w-full h-full object-cover" /> : null}
      </div>

      {/* hover on desktop, always visible on mobile */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <span className="px-4 py-2 rounded-2xl text-sm bg-black/70 text-white backdrop-blur border border-white/20">
              {loading ? t("loading") : "Сменить обложку"}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
