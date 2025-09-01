"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Note = {
  id: number;
  title: string;
  content?: string | null;
  image_url?: string | null;
};

export default function NoteDetailPage() {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${api}/notes/${id}`);
        if (!res.ok) throw new Error("not found");
        setNote(await res.json());
      } catch {
        setNote(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [api, id]);

  async function onDelete() {
    const token = localStorage.getItem("token");
    if (!token) return (location.href = "/login");
    if (!confirm("Delete this note?")) return;

    const res = await fetch(`${api}/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      // kembali ke list dan hilangkan item
      router.push("/notes");
      router.refresh();
    } else {
      alert("Delete failed");
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!note) return <p>Not found.</p>;

  return (
    <div style={{ padding: 24 }}>
      <button style={{ float: "right" }} onClick={() => { localStorage.removeItem("token"); location.href="/login"; }}>Logout</button>
      <h1>Notes Sharing App</h1>

      <h2>{note.title}</h2>
      {note.image_url && <img src={`${api}${note.image_url}`} width={240} alt="" />}
      {note.content && <p>{note.content}</p>}

      <br />
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}
