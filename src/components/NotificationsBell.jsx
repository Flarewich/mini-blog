import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function NotificationsBell() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const unread = useMemo(() => items.filter((n) => !n.is_read).length, [items]);

  async function load() {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("id,type,is_read,created_at,post_id,actor_id")
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error) setItems(data || []);
  }

  async function markAllRead() {
    if (!user?.id) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
  }

  useEffect(() => {
    load();
    if (!user?.id) return;

    const ch = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new;
          // добавляем сверху
          setItems((prev) => [n, ...prev].slice(0, 30));
        },
      )
      .subscribe();

    return () => supabase.removeChannel(ch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center justify-center"
        title="Notifications"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] max-w-[90vw] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="font-semibold">Уведомления</div>
            <button
              onClick={markAllRead}
              className="text-xs px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Прочитать все
            </button>
          </div>

          <div className="max-h-[380px] overflow-auto">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-zinc-500">
                Пока нет уведомлений
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={
                    "px-4 py-3 text-sm border-b border-zinc-200/60 dark:border-zinc-800/60 " +
                    (n.is_read
                      ? "opacity-70"
                      : "bg-zinc-50 dark:bg-zinc-900/40")
                  }
                >
                  <div className="font-medium">
                    {n.type === "like"
                      ? "❤️ Лайк на твой пост"
                      : "💬 Комментарий к твоему посту"}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
