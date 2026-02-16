import { useState } from "react";
import { useUi } from "../context/UiContext";

export default function PostForm({ initialTitle = "", initialContent = "", onSubmit, loading }) {
  const { t } = useUi();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const [imageFile, setImageFile] = useState(null);
  const [anyFile, setAnyFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    await onSubmit?.({
      title: title.trim(),
      content: content.trim(),
      imageFile,
      anyFile,
      linkUrl: linkUrl.trim() || null,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 rounded-3xl p-5 shadow-sm space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {t("postTitleLabel")}
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
          placeholder={t("postTitlePlaceholder")}
          required
          maxLength={120}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {t("postContentLabel")}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 w-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white min-h-[180px]"
          placeholder={t("postContentPlaceholder")}
          required
        />
      </div>

      {/* ✅ ВЛОЖЕНИЯ */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Фото
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm"
          />
          {imageFile && (
            <div className="mt-1 text-xs text-zinc-500">
              Выбрано: {imageFile.name}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Файл
          </label>
          <input
            type="file"
            onChange={(e) => setAnyFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm"
          />
          {anyFile && (
            <div className="mt-1 text-xs text-zinc-500">
              Выбрано: {anyFile.name}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Ссылка
          </label>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
          />
        </div>
      </div>

      <button
        disabled={loading}
        className="px-4 py-2 rounded-2xl bg-zinc-900 text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        {loading ? t("saving") : t("save")}
      </button>
    </form>
  );
}
