import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PostForm from "../components/PostForm";
import { useUi } from "../context/UiContext";

export default function EditorPage() {
  const { id } = useParams();
  const isEdit = useMemo(() => Boolean(id), [id]);

  const { user } = useAuth();
  const { t } = useUi();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [initial, setInitial] = useState({
    title: "",
    content: "",
    attachments: [], // [{id, kind, url, name}]
  });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isEdit) {
      setLoaded(true);
      setInitial({ title: "", content: "", attachments: [] });
      return;
    }
    if (!user?.id) return;

    (async () => {
      setLoaded(false);
      setErrorMsg("");

      const { data: post, error: postErr } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (postErr) {
        setErrorMsg(postErr.message);
        setLoaded(true);
        return;
      }

      if (post.user_id !== user.id) {
        setErrorMsg("Access denied");
        setLoaded(true);
        return;
      }

      const { data: atts, error: attErr } = await supabase
        .from("post_attachments")
        .select("id, kind, url, name, position, created_at")
        .eq("post_id", id)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });

      if (attErr) {
        setErrorMsg(attErr.message);
        setLoaded(true);
        return;
      }

      setInitial({
        title: post.title || "",
        content: post.content || "",
        attachments: atts || [],
      });

      setLoaded(true);
    })();
  }, [isEdit, id, user?.id]);

  async function uploadToStorage(file) {
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("post-attachments")
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("post-attachments").getPublicUrl(path);
    return data.publicUrl;
  }

  async function submit({ title, content, imageFiles, files, links, keptAttachments }) {
    if (!title || !content) return;

    setLoading(true);
    setErrorMsg("");

    try {
      if (isEdit) {
        // 1) обновляем текст
        const { error: upErr } = await supabase
          .from("posts")
          .update({ title, content })
          .eq("id", id);
        if (upErr) throw upErr;

        // 2) удаляем вложения, которые пользователь убрал
        const keptIds = new Set((keptAttachments || []).map((a) => a.id));
        const toDelete = (initial.attachments || []).filter((a) => !keptIds.has(a.id));

        // ✅ если убрали всё — удалим все
        if ((keptAttachments || []).length === 0 && (initial.attachments || []).length > 0) {
          const { error: delAllErr } = await supabase
            .from("post_attachments")
            .delete()
            .eq("post_id", id);
          if (delAllErr) throw delAllErr;
        } else if (toDelete.length > 0) {
          const { error: delErr } = await supabase
            .from("post_attachments")
            .delete()
            .in("id", toDelete.map((a) => a.id));
          if (delErr) throw delErr;
        }

        // 3) добавляем новые вложения
        const rows = [];

        for (const f of imageFiles || []) {
          if (f.size > 10 * 1024 * 1024) throw new Error("Фото слишком большое (макс 10MB)");
          const url = await uploadToStorage(f);
          rows.push({ post_id: id, user_id: user.id, kind: "image", url, name: f.name, position: 0 });
        }

        for (const f of files || []) {
          if (f.size > 20 * 1024 * 1024) throw new Error("Файл слишком большой (макс 20MB)");
          const url = await uploadToStorage(f);
          rows.push({ post_id: id, user_id: user.id, kind: "file", url, name: f.name, position: 1 });
        }

        for (const l of links || []) {
          const url = (l || "").trim();
          if (!url) continue;
          rows.push({ post_id: id, user_id: user.id, kind: "link", url, name: null, position: 2 });
        }

        if (rows.length > 0) {
          const { error: insErr } = await supabase.from("post_attachments").insert(rows);
          if (insErr) throw insErr;
        }

        navigate("/");
        return;
      }

      // ✅ create: создаём пост
      const { data: created, error: insPostErr } = await supabase
        .from("posts")
        .insert({ title, content, user_id: user.id })
        .select("id")
        .single();

      if (insPostErr) throw insPostErr;

      const postId = created.id;

      // ✅ вставляем вложения
      const rows = [];

      for (const f of imageFiles || []) {
        if (f.size > 10 * 1024 * 1024) throw new Error("Фото слишком большое (макс 10MB)");
        const url = await uploadToStorage(f);
        rows.push({ post_id: postId, user_id: user.id, kind: "image", url, name: f.name, position: 0 });
      }

      for (const f of files || []) {
        if (f.size > 20 * 1024 * 1024) throw new Error("Файл слишком большой (макс 20MB)");
        const url = await uploadToStorage(f);
        rows.push({ post_id: postId, user_id: user.id, kind: "file", url, name: f.name, position: 1 });
      }

      for (const l of links || []) {
        const url = (l || "").trim();
        if (!url) continue;
        rows.push({ post_id: postId, user_id: user.id, kind: "link", url, name: null, position: 2 });
      }

      if (rows.length > 0) {
        const { error: insAttErr } = await supabase.from("post_attachments").insert(rows);
        if (insAttErr) throw insAttErr;
      }

      navigate("/");
    } catch (err) {
      setErrorMsg(err.message || t("saveError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight">
        {isEdit ? t("editPostTitle") : t("newPostTitle")}
      </h1>

      {errorMsg && (
        <p className="mt-4 text-red-700 bg-red-50 border border-red-200 rounded-2xl p-3">
          {errorMsg}
        </p>
      )}

      <div className="mt-6">
        {!loaded ? (
          <div className="mt-6 text-sm text-zinc-500">Загрузка...</div>
        ) : (
          <PostForm
            key={isEdit ? id : "new"}
            initialTitle={initial.title}
            initialContent={initial.content}
            initialAttachments={initial.attachments || []}
            onSubmit={submit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
