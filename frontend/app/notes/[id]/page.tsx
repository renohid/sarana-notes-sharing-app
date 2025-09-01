"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Detail() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080";
  const { id } = useParams<{id:string}>();
  const router = useRouter();
  const [note, setNote] = useState<any>(null);

  useEffect(() => { fetch(`${api}/notes/${id}`).then(r=>r.json()).then(setNote); }, [api, id]);

  async function remove() {
    const token = localStorage.getItem("token")!;
    const res = await fetch(`${api}/notes/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
    if (res.ok) router.replace("/notes"); else alert("Delete failed (owner only).");
  }

  if (!note) return <p>Loading...</p>;
  return (
    <>
      <a href="/notes">← Back</a>
      <h3>{note.title}</h3>
      {note.image_url && <img src={`${api}${note.image_url}`} alt="" width={240}/>}
      <pre>{note.content ?? ""}</pre>
      <button onClick={remove}>Delete</button>
    </>
  );
}
