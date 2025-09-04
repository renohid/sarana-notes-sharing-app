"use client";
import { useState, FormEvent } from "react";

export default function NewNote() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return (location.href = "/login");

    const fd = new FormData();
    fd.append("title", title);
    if (content) fd.append("content", content);
    if (image) fd.append("image", image);

    setSubmitting(true);
    const r = await fetch(`${api}/notes`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    setSubmitting(false);

    if (r.ok) {
      const { id } = await r.json();
      location.href = `/notes/${id}`;
    } else {
      alert(`Create failed: ${r.status} ${await r.text()}`);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <button style={{ float: "right" }} onClick={() => { localStorage.removeItem("token"); location.href = "/login"; }}>
        Logout
      </button>

      <h1>New Note</h1>
      <form onSubmit={onSubmit}>
        <p>
          <input
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </p>
        <p>
          <textarea
            placeholder="Content (optional)"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            cols={40}
          />
        </p>
        <p>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] ?? null)} />
        </p>
        <button type="submit" disabled={submitting}>
          {submitting ? "Uploading..." : "Create"}
        </button>
      </form>
    </div>
  );
}
