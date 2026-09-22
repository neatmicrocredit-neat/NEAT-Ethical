"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CustomerAuthForm({ mode = "login" }) {
  const router = useRouter();
  const [form, setForm] = useState({ first_name: "", last_name: "", phone_number: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    const response = await fetch(`/api/customer-auth/${signup ? "signup" : "login"}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Could not continue."); setBusy(false); return; }
    if (signup) { router.push("/auth/customer-login?created=1"); return; }
    router.push("/portal");
  }
  return <form onSubmit={submit} className="space-y-4">
    {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
    {signup ? <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">First name<input required className="mt-2 w-full rounded-xl border px-4 py-3" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></label><label className="text-sm font-semibold">Last name<input required className="mt-2 w-full rounded-xl border px-4 py-3" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></label></div> : null}
    {signup ? <label className="block text-sm font-semibold">Phone number<input className="mt-2 w-full rounded-xl border px-4 py-3" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} /></label> : null}
    <label className="block text-sm font-semibold">Email<input required type="email" className="mt-2 w-full rounded-xl border px-4 py-3" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
    <label className="block text-sm font-semibold">Password<input required minLength={8} type="password" className="mt-2 w-full rounded-xl border px-4 py-3" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
    <button disabled={busy} className="w-full rounded-full bg-[var(--brand)] px-5 py-3 font-bold text-white disabled:opacity-60">{busy ? "Please wait..." : signup ? "Create customer account" : "Sign in"}</button>
    <p className="text-center text-sm text-slate-600">{signup ? <>Already registered? <Link className="font-bold text-[var(--brand)]" href="/auth/customer-login">Sign in</Link></> : <>New to NEAT? <Link className="font-bold text-[var(--brand)]" href="/auth/signup">Create an account</Link></>}</p>
  </form>;
}
