"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Note = { id:number; title:string; content?:string|null; image_url?:string|null };

export default function NoteDetail() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const router = useRouter();
  const params = useParams();
  const id = (Array.isArray((params as any).id) ? (params as any).id[0] : (params as any).id) as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(${api}/notes/${id});
        if (!r.ok) throw new Error("not found");
        const data = await r.json();
        if (!cancelled) setNote(data);
      } catch {
        if (!cancelled) setNote(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [api, id]);

  const onDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) return (location.href = "/login");
    if (!confirm("Delete this note?")) return;
    const r = await fetch(${api}/notes/${id}, {
      method: "DELETE",
      headers: { Authorization: Bearer ${token} },
    });
    if (r.ok) {
      router.push("/notes");
      router.refresh();
    } else {
      alert("Delete failed (owner only).");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!note) return <p>Not found.</p>;

  return (
    <div style={{ padding: 24 }}>
      <button
        style={{ float: "right" }}
        onClick={() => {
          localStorage.removeItem("token");
          location.href = "/login";
        }}
      >
        Logout
      </button>

      <h1>Notes Sharing App</h1>
      <h2>{note.title}</h2>
      {note.image_url && <img src={${api}${note.image_url}} width={240} alt="" />}
      {note.content && <p>{note.content}</p>}
      <br />
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}