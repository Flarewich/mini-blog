import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AuthPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  if (user) return <Navigate to="/" replace />;

  async function handleAuth(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Аккаунт создан. Проверь почту (если включено подтверждение) или войди.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMsg(err.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">{mode === "login" ? "Вход" : "Регистрация"}</h1>
      <p className="text-gray-600 mt-1">Supabase Auth (email + пароль)</p>

      <div className="mt-6 bg-white border rounded-2xl p-5 shadow-sm">
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Пароль</label>
            <input
              type="password"
              className="mt-1 w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            disabled={loading}
            className="w-full px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black disabled:opacity-60"
          >
            {loading ? "Подожди..." : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>

          {msg && <p className="text-sm text-gray-700 bg-gray-50 border rounded-xl p-3">{msg}</p>}
        </form>

        <div className="mt-4 text-sm">
          {mode === "login" ? (
            <button onClick={() => setMode("signup")} className="text-gray-900 underline">
              Нет аккаунта? Зарегистрироваться
            </button>
          ) : (
            <button onClick={() => setMode("login")} className="text-gray-900 underline">
              Уже есть аккаунт? Войти
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
