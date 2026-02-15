import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { useUi } from "../context/UiContext";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, theme, setTheme, t } = useUi();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileMenuRef = useRef(null);

  // Закрывать меню при смене страницы (очень важно для mobile)
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Закрывать dropdown при клике вне
  useEffect(() => {
    function onDocClick(e) {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    navigate("/auth");
  }

  const linkClass = ({ isActive }) =>
    "px-3 py-2 rounded-xl text-sm font-medium transition " +
    (isActive
      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
      : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60");

  const pill =
    "px-3 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60";

  // можно заменить на реальный аватар если у тебя он есть в профиле/контексте
  const avatarFallback = useMemo(() => (user ? "🙂" : "👤"), [user]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-black/60 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-lg tracking-tight">
          Mini<span className="text-zinc-500 dark:text-zinc-400">Blog</span>
        </Link>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={linkClass} end>
            {t("posts")}
          </NavLink>

          {user && (
            <NavLink
              to="/new"
              className="px-3 py-2 rounded-xl text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {t("newPost")}
            </NavLink>
          )}

          {/* Profile dropdown */}
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                className={pill + " flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"}
                onClick={() => setProfileOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <span className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                  {avatarFallback}
                </span>
                <span>{t("profile")}</span>
                <span className="text-xs opacity-70">▾</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl p-2">
                  <NavLink to="/profile" className={({ isActive }) =>
                    "block px-3 py-2 rounded-xl text-sm " +
                    (isActive
                      ? "bg-zinc-100 dark:bg-zinc-800/60"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40")
                  }>
                    {t("profile")}
                  </NavLink>

                  <div className="my-2 h-px bg-zinc-200/70 dark:bg-zinc-800/70" />

                  <label className="block px-3 pb-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {t("language")}
                  </label>
                  <select
                    className={"w-full " + pill}
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    aria-label="language"
                  >
                    <option value="ru">RU</option>
                    <option value="ua">UA</option>
                    <option value="en">EN</option>
                  </select>

                  <button
                    className={"mt-2 w-full " + pill + " hover:bg-zinc-50 dark:hover:bg-zinc-900"}
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {t("theme")}: {theme === "dark" ? t("dark") : t("light")}
                  </button>

                  <button
                    onClick={logout}
                    className="mt-2 w-full px-3 py-2 rounded-xl text-sm bg-red-600 text-white hover:bg-red-700"
                  >
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <select
                className={pill}
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                aria-label="language"
              >
                <option value="ru">RU</option>
                <option value="ua">UA</option>
                <option value="en">EN</option>
              </select>

              <button
                className={pill + " hover:bg-zinc-50 dark:hover:bg-zinc-900"}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? t("dark") : t("light")}
              </button>

              <NavLink to="/auth" className={linkClass}>
                {t("login")}
              </NavLink>
            </>
          )}
        </div>

        {/* MOBILE */}
        <div className="md:hidden flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200/70 dark:border-zinc-800/70 bg-white/90 dark:bg-black/80 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-2">
            <NavLink to="/" className={linkClass} end>
              {t("posts")}
            </NavLink>

            {user && (
              <NavLink to="/new" className={linkClass}>
                {t("newPost")}
              </NavLink>
            )}

            {user ? (
              <NavLink to="/profile" className={linkClass}>
                {t("profile")}
              </NavLink>
            ) : (
              <NavLink to="/auth" className={linkClass}>
                {t("login")}
              </NavLink>
            )}

            <div className="flex gap-2 mt-2">
              <select className={pill} value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="ru">RU</option>
                <option value="ua">UA</option>
                <option value="en">EN</option>
              </select>

              <button
                className={pill + " flex-1 hover:bg-zinc-50 dark:hover:bg-zinc-900"}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {t("theme")}: {theme === "dark" ? t("dark") : t("light")}
              </button>
            </div>

            {user && (
              <button
                onClick={logout}
                className="mt-2 px-3 py-2 rounded-xl text-sm bg-red-600 text-white hover:bg-red-700"
              >
                {t("logout")}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
