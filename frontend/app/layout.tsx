"use client";
import { useEffect, useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  useEffect(() => setAuthed(!!localStorage.getItem("token")), []);
  function logout() { localStorage.removeItem("token"); location.href = "/login"; }

  return (
    <html lang="en">
      <body style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "ui-sans-serif" }}>
        <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2>Notes Sharing App</h2>
          {authed && <button onClick={logout}>Logout</button>}
        </header>
        {children}
      </body>
    </html>
  );
}
