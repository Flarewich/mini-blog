import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PostForm from "../components/PostForm";

export default function EditorPage() {
  const { id } = useParams(); // если есть id -> edit, если нет -> new
  const isEdit = useMemo(() => Boolean(id), [id]);

  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState({ title: "", content: "" });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setErrorMsg("");
      const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Доп. защита на фронте (RLS всё равно главный)
      if (data.user_id !== user.id) {
        setErrorMsg("Это не твой пост.");
        return;
      }

      setInitial({ title: data.title, content: data.content });
    })();
  }, [isEdit, id, user?.id]);

  async function submit({ title, content }) {
    if (!title || !content) return;

    setLoading(true);
    setErrorMsg("");

    try {
      if (isEdit) {
        const { error } = await supabase
          .from("posts")
          .update({ title, content })
          .eq("id", id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert({
          title,
          content,
          user_id: user.id,
        });

        if (error) throw error;
      }

      navigate("/");
    } catch (err) {
      setErrorMsg(err.message || "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{isEdit ? "Редактирование" : "Новый пост"}</h1>

      {errorMsg && (
        <p className="mt-4 text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          {errorMsg}
        </p>
      )}

      <div className="mt-6">
        <PostForm
          initialTitle={initial.title}
          initialContent={initial.content}
          onSubmit={submit}
          loading={loading}
        />
      </div>
    </div>
  );
}
