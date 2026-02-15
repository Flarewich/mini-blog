import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate("/auth");
  }

  const linkClass = ({ isActive }) =>
    "px-3 py-2 rounded-lg text-sm " +
    (isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100");

  return (
    <header className="border-b bg-white">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          MiniBlog
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkClass} end>
            Посты
          </NavLink>

          {user ? (
            <>
              <NavLink to="/new" className={linkClass}>
                Новый пост
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                Профиль
              </NavLink>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
              >
                Выйти
              </button>
            </>
          ) : (
            <NavLink to="/auth" className={linkClass}>
              Вход
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
