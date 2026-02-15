import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { useUi } from "../context/UiContext";

export default function AuthPage() {
  const { user } = useAuth();
  const { t } = useUi();

  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (user) return <Navigate to="/" replace />;

  async function handleAuth(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg(t("signupSuccess"));
        setCooldown(15);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMsg(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight">
        {mode === "login" ? t("authLoginTitle") : t("authSignupTitle")}
      </h1>
      <p className="text-zinc-600 dark:text-zinc-300 mt-1">{t("authSubtitle")}</p>

      <div className="mt-6 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 rounded-3xl p-5 shadow-sm">
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t("emailLabel")}
            </label>
            <input
              type="email"
              className="mt-1 w-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t("passwordLabel")}
            </label>
            <input
              type="password"
              className="mt-1 w-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/40 rounded-2xl px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            disabled={loading || cooldown > 0}
            className="w-full px-4 py-2 rounded-2xl bg-zinc-900 text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            {loading
              ? t("waitBtn")
              : cooldown > 0
                ? t("repeatIn", { s: cooldown })
                : mode === "login"
                  ? t("loginBtn")
                  : t("signupBtn")}
          </button>

          {msg && (
            <p className="text-sm text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3">
              {msg}
            </p>
          )}
        </form>

        <div className="mt-4 text-sm">
          {mode === "login" ? (
            <button onClick={() => setMode("signup")} className="underline">
              {t("noAccount")}
            </button>
          ) : (
            <button onClick={() => setMode("login")} className="underline">
              {t("haveAccount")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
