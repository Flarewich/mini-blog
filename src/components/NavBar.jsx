import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useUi } from "../context/UiContext";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, theme, setTheme, t } = useUi();
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  async function logout() {
    await supabase.auth.signOut();
    navigate("/auth");
  }

  // 🔥 Загружаем аватар для Navbar
  useEffect(() => {
    let cancelled = false;

    async function loadAvatar() {
      if (!user?.id) {
        setAvatarUrl(null);
        return;
      }

      const bucket = "avatars";

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(`${user.id}`, {
          limit: 50,
          sortBy: { column: "name", order: "desc" },
        });

      if (error || !data || data.length === 0) {
        setAvatarUrl(null);
        return;
      }

      const file = data.find((f) => f.name && !f.name.endsWith("/"));
      if (!file) {
        setAvatarUrl(null);
        return;
      }

      const { data: pub } = supabase.storage
        .from(bucket)
        .getPublicUrl(`${user.id}/${file.name}`);

      if (!cancelled) {
        setAvatarUrl(pub?.publicUrl || null);
      }
    }

    loadAvatar();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const linkClass = ({ isActive }) =>
    "px-3 py-2 rounded-xl text-sm font-medium " +
    (isActive
      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
      : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900");

  const pill =
    "px-3 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-950/60 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-lg tracking-tight">
          Mini<span className="text-zinc-500 dark:text-zinc-400">Blog</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={linkClass} end>
            {t("posts")}
          </NavLink>

          {user && (
            <NavLink to="/new" className={linkClass}>
              {t("newPost")}
            </NavLink>
          )}

          {user ? (
            <>
              {/* 🔥 PROFILE DROPDOWN BUTTON */}
              <div className="relative">
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-zinc-500">🙂</span>
                    )}
                  </span>
                  <span>{t("profile")}</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg p-2 flex flex-col gap-2">
                    <NavLink
                      to="/profile"
                      className="px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => setOpen(false)}
                    >
                      {t("profile")}
                    </NavLink>

                    <select
                      className={pill}
                      value={lang}
                      onChange={(e) => setLang(e.target.value)}
                    >
                      <option value="ru">RU</option>
                      <option value="ua">UA</option>
                      <option value="en">EN</option>
                    </select>

                    <button
                      className={pill}
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                    >
                      {t("theme")}:{" "}
                      {theme === "dark" ? t("dark") : t("light")}
                    </button>

                    <button
                      onClick={() => {
                        setOpen(false);
                        logout();
                      }}
                      className="px-3 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <select
                className={pill}
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="ru">RU</option>
                <option value="ua">UA</option>
                <option value="en">EN</option>
              </select>

              <button
                className={pill}
                onClick={() =>
                  setTheme(theme === "dark" ? "light" : "dark")
                }
              >
                {theme === "dark" ? t("dark") : t("light")}
              </button>

              <NavLink to="/auth" className={linkClass}>
                {t("login")}
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
