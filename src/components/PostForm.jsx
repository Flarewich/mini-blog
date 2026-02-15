import { useState } from "react";
import { useUi } from "../context/UiContext";

export default function PostForm({ initialTitle = "", initialContent = "", onSubmit, loading }) {
  const { t } = useUi();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit?.({ title: title.trim(), content: content.trim() });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/80 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-800/70 rounded-3xl p-5 shadow-sm space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t("postTitleLabel")}
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
          placeholder={t("postTitlePlaceholder")}
          required
          maxLength={120}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {t("postContentLabel")}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 w-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white min-h-[180px]"
          placeholder={t("postContentPlaceholder")}
          required
        />
      </div>

      <button
        disabled={loading}
        className="px-4 py-2 rounded-2xl bg-gray-900 text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
      >
        {loading ? t("saving") : t("save")}
      </button>
    </form>
  );
}
