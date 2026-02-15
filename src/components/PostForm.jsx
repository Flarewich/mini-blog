import { useState } from "react";

export default function PostForm({ initialTitle = "", initialContent = "", onSubmit, loading }) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit?.({ title: title.trim(), content: content.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-4 shadow-sm space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Заголовок</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Например: Мой первый пост"
          required
          maxLength={120}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Текст</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 min-h-[180px]"
          placeholder="Пиши что угодно 🙂"
          required
        />
      </div>

      <button
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black disabled:opacity-60"
      >
        {loading ? "Сохранение..." : "Сохранить"}
      </button>
    </form>
  );
}
