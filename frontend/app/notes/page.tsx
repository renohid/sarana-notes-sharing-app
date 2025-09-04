"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Note = { id: number; title: string; image_url?: string | null };

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API}/notes`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data: Note[] = await r.json();
        if (!cancelled) setNotes(data);
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || "fetch failed");
          setNotes([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    location.href = "/login";
  };

  if (notes === null) return <p>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <button style={{ float: "right" }} onClick={logout}>Logout</button>
      <h1>Notes Sharing App</h1>
      <p><a href="/notes/new">+ New</a></p>
      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}

      {notes.length === 0 ? (
        <p>Belum ada catatan.</p>
      ) : (
        <ul>
          {notes.map((n) => (
            <li key={n.id} style={{ marginBottom: 12 }}>
              <Link href={`/notes/${n.id}`}>{n.title}</Link>
              {n.image_url && (
                <img
                  src={`${API}${n.image_url}`}
                  width={120}
                  alt=""
                  style={{ display: "block", marginTop: 6 }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
