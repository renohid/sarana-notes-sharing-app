"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("user1@example.com");
  const [password, setPassword] = useState("secret123");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080"; // fallback

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const res = await fetch(`${api}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        setErr(`Login failed (${res.status}): ${text}`);
        return;
      }
      const { token } = await res.json();
      localStorage.setItem("token", token);
      router.replace("/notes");
    } catch (e: any) {
      setErr(`Network error: ${e?.message ?? e}`);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h3>Login</h3>
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button type="submit">Login</button>
      {err && <p style={{color:"crimson"}}>{err}</p>}
    </form>
  );
}
