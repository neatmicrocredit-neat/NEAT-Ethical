"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    const response = await fetch("/api/customer-auth/password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "first-password", password }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Could not update password."); setBusy(false); return; }
    router.push("/portal");
  }
  return <main className="landing-theme min-h-screen bg-[var(--page)] px-5 py-16"><form onSubmit={submit} className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-xl"><p className="text-xs font-black uppercase tracking-widest text-[var(--brand)]">First sign in</p><h1 className="mt-3 text-4xl font-black">Set your password</h1><p className="mt-3 text-slate-600">Choose a private password to replace your one-time password.</p>{message ? <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{message}</p> : null}<input required minLength={8} type="password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-6 w-full rounded-xl border px-4 py-3" /><button disabled={busy} className="mt-5 w-full rounded-full bg-[var(--brand)] px-5 py-3 font-bold text-white">{busy ? "Saving..." : "Save password"}</button></form></main>;
}
