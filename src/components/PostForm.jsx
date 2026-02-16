import { useMemo, useState } from "react";
import { useUi } from "../context/UiContext";

export default function PostForm({
  initialTitle = "",
  initialContent = "",
  initialAttachments = [], // [{ id, kind: 'image'|'file'|'link', url, name }]
  onSubmit,
  loading,
}) {
  const { t } = useUi();

  // ✅ Инициализация один раз, без useEffect (иначе цикл рендера)
  const [title, setTitle] = useState(() => initialTitle);
  const [content, setContent] = useState(() => initialContent);

  // ✅ новые вложения
  const [imageFiles, setImageFiles] = useState([]); // File[]
  const [files, setFiles] = useState([]); // File[]
  const [links, setLinks] = useState([]); // string[]
  const [linkInput, setLinkInput] = useState("");

  // ✅ существующие вложения (при редактировании)
  const [keptAttachments, setKeptAttachments] = useState(
    () => initialAttachments || [],
  );

  const allNewChips = useMemo(() => {
    const img = imageFiles.map((f) => ({
      key: `img:${f.name}:${f.size}`,
      icon: "🖼",
      label: f.name,
      type: "new_image",
    }));

    const fl = files.map((f) => ({
      key: `file:${f.name}:${f.size}`,
      icon: "📎",
      label: f.name,
      type: "new_file",
    }));

    const lk = links.map((l, i) => ({
      key: `link:${i}:${l}`,
      icon: "🔗",
      label: l,
      type: "new_link",
      idx: i,
    }));

    return [...img, ...fl, ...lk];
  }, [imageFiles, files, links]);

  function removeKept(id) {
    setKeptAttachments((arr) => arr.filter((a) => a.id !== id));
  }

  function removeNewChip(chip) {
    if (chip.type === "new_image") {
      // удаляем по имени (норм для UI; если хочешь идеально — по key)
      setImageFiles((arr) => arr.filter((f) => f.name !== chip.label));
    } else if (chip.type === "new_file") {
      setFiles((arr) => arr.filter((f) => f.name !== chip.label));
    } else if (chip.type === "new_link") {
      setLinks((arr) => arr.filter((_, i) => i !== chip.idx));
    }
  }

  function addLink() {
    const v = linkInput.trim();
    if (!v) return;

    setLinks((arr) => (arr.includes(v) ? arr : [...arr, v]));
    setLinkInput("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await onSubmit?.({
      title: title.trim(),
      content: content.trim(),
      imageFiles,
      files,
      links,
      keptAttachments,
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

      {/* ✅ Existing attachments (edit mode) */}
      {keptAttachments.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Текущие вложения
          </div>

          <div className="flex flex-wrap gap-2">
            {keptAttachments.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/30"
                title={a.url}
              >
                <span>
                  {a.kind === "image" ? "🖼" : a.kind === "file" ? "📎" : "🔗"}
                </span>

                <span className="max-w-[220px] truncate">
                  {a.name || a.url}
                </span>

                <button
                  type="button"
                  onClick={() => removeKept(a.id)}
                  className="opacity-70 hover:opacity-100"
                  aria-label="Remove"
                  title="Remove"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ✅ New attachments */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {allNewChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/30"
              title={chip.label}
            >
              <span>{chip.icon}</span>
              <span className="max-w-[220px] truncate">{chip.label}</span>
              <button
                type="button"
                onClick={() => removeNewChip(chip)}
                className="opacity-70 hover:opacity-100"
                aria-label="Remove"
                title="Remove"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* 📷 Фото */}
          <label className="cursor-pointer inline-flex items-center justify-center w-11 h-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <span className="text-lg">🖼</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
              className="hidden"
            />
          </label>

          {/* 📎 Файлы */}
          <label className="cursor-pointer inline-flex items-center justify-center w-11 h-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <span className="text-lg">📎</span>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="hidden"
            />
          </label>

          <span className="text-xs text-zinc-500">Можно выбрать несколько</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Ссылки (можно несколько)
          </label>

          <div className="mt-1 flex gap-2">
            <input
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="https://..."
              className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            />
            <button
              type="button"
              onClick={addLink}
              className="px-4 py-2 rounded-2xl bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              title="Добавить ссылку"
            >
              +
            </button>
          </div>
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
