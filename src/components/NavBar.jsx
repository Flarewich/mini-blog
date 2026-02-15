import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useUi } from "../context/UiContext";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, theme, setTheme, t } = useUi();
  const [open, setOpen] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    navigate("/auth");
  }

  const linkClass = ({ isActive }) =>
    "px-3 py-2 rounded-xl text-sm font-medium " +
    (isActive
      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900");

  const pill =
    "px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-950/60 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-lg tracking-tight">
          Mini<span className="text-gray-500 dark:text-gray-400">Blog</span>
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
              <NavLink to="/profile" className={linkClass}>
                {t("profile")}
              </NavLink>

              {/* Lang */}
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

              {/* Theme */}
              <button
                className={pill + " hover:bg-gray-50 dark:hover:bg-gray-900"}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? t("dark") : t("light")}
              </button>

              <button
                onClick={logout}
                className="px-3 py-2 rounded-xl text-sm bg-red-600 text-white hover:bg-red-700"
              >
                {t("logout")}
              </button>
            </>
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
                className={pill + " hover:bg-gray-50 dark:hover:bg-gray-900"}
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

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60"
            onClick={() => setOpen((v) => !v)}
            aria-label="menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-200/70 dark:border-gray-800/70">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-2">
            <NavLink to="/" className={linkClass} end onClick={() => setOpen(false)}>
              {t("posts")}
            </NavLink>

            {user && (
              <NavLink to="/new" className={linkClass} onClick={() => setOpen(false)}>
                {t("newPost")}
              </NavLink>
            )}

            {user ? (
              <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>
                {t("profile")}
              </NavLink>
            ) : (
              <NavLink to="/auth" className={linkClass} onClick={() => setOpen(false)}>
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
                className={pill + " flex-1 hover:bg-gray-50 dark:hover:bg-gray-900"}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {t("theme")}: {theme === "dark" ? t("dark") : t("light")}
              </button>
            </div>

            {user && (
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
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
