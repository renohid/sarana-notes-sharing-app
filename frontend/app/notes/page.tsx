"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Note = { id: number; title: string; image_url?: string | null };

export default function NotesPage() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const [notes, setNotes] = useState<Note[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(${api}/notes);
        const data = r.ok ? await r.json() : [];
        if (!cancelled) setNotes(data);
      } catch {
        if (!cancelled) setNotes([]);
      }
    })();
    return () => { cancelled = true; };
  }, [api]);

  const logout = () => {
    localStorage.removeItem("token");
    location.href = "/login";
  };

  if (notes === null) return <p>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <button style={{ float: "right" }} onClick={logout}>Logout</button>
      <h1>Notes Sharing App</h1>

      {notes.length === 0 ? (
        <p>Belum ada catatan.</p>
      ) : (
        <ul>
          {notes.map((n) => (
            <li key={n.id} style={{ marginBottom: 12 }}>
              <Link href={/notes/${n.id}}>{n.title}</Link>
              {n.image_url && (
                <img
                  src={${api}${n.image_url}}
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