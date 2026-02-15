import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const THEMES = [
  { id: "light", label: "Светлая" },
  { id: "dark", label: "Тёмная" },
  { id: "rose", label: "Rose" },
];

function applyTheme(themeId) {
  const root = document.documentElement;

  // очистка
  root.classList.remove("theme-light", "theme-dark", "theme-rose", "dark");

  // включение темы
  if (themeId === "light") {
    root.classList.add("theme-light");
  }

  if (themeId === "dark") {
    root.classList.add("theme-dark", "dark"); // включаем tailwind dark:
  }

  if (themeId === "rose") {
    root.classList.add("theme-rose", "dark"); // тоже dark, но другой оттенок
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
