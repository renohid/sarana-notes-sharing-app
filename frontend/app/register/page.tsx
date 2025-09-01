"use client";
import { useState } from "react";

export default function Register() {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const api = process.env.NEXT_PUBLIC_API_URL!;
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const res = await fetch(`${api}/register`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ email, password })
      });
      alert(res.ok ? "Registered! Please login" : "Register failed");
    }}>
      <h3>Register</h3>
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button type="submit">Create account</button>
    </form>
  );
}
