import { useUi } from "../context/UiContext";

export default function Hero() {
  const { t } = useUi();

  return (
    <div className="mb-6 rounded-3xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/50 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            MiniBlog — {t("allPosts")}
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">
            {t("profile")} • {t("commentsTitle")} • {t("theme")} • {t("language")}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50">
            ⚡ Realtime
          </span>
          <span className="px-3 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50">
            🔒 RLS
          </span>
          <span className="px-3 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50">
            🌙 {t("theme")}
          </span>
        </div>
      </div>
    </div>
  );
}
