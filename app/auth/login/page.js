"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, Leaf, LockKeyhole } from "lucide-react";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export default function LoginPage() {
  return <Suspense fallback={<LoginShell><div className="rounded-lg bg-white p-9 text-sm font-black text-[var(--muted-ink)] ring-1 ring-[var(--line)]">Loading secure access...</div></LoginShell>}><LoginForm /></Suspense>;
}

function LoginForm() {
  const router = useRouter();
  const redirectTo = useSearchParams().get("redirectTo") || "/dashboard";
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [errorMessage, setErrorMessage] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault(); setIsSubmitting(true); setErrorMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.session) { setErrorMessage(error?.message || "Invalid credentials. Please try again."); setIsSubmitting(false); return; }
    const resolve = await fetch("/api/auth/resolve", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ access_token: data.session.access_token, redirectTo }) });
    const result = await resolve.json();
    if (!resolve.ok) { await supabase.auth.signOut(); setErrorMessage(result.error || "This account is not authorised."); setIsSubmitting(false); return; }
    router.push(result.destination);
  }
  return <LoginShell><div className="rounded-lg bg-white p-7 shadow-[0_30px_90px_rgb(33_21_95_/_0.14)] ring-1 ring-[var(--line)] sm:p-9"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-black uppercase text-[var(--brand)]">Secure access</p><h1 className="mt-2 text-4xl leading-none">Sign in to continue</h1></div><LockKeyhole className="size-12 rounded-full bg-[var(--brand-2)] p-3 text-[var(--ink)]" /></div><p className="mt-4 text-sm font-semibold leading-6 text-[var(--muted-ink)]">Sign in to your NEAT customer account or staff workspace.</p><form onSubmit={handleSubmit} className="mt-8 space-y-4">{errorMessage ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">{errorMessage}</div> : null}<label className="block text-sm font-black text-[var(--ink)]">Email<input name="email" type="email" required className="mt-2 w-full rounded-lg border border-[color:var(--line)] bg-[var(--soft)] px-4 py-3 font-semibold outline-none focus:border-[var(--brand)] focus:bg-white" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="block text-sm font-black text-[var(--ink)]">Password<input name="password" type="password" required className="mt-2 w-full rounded-lg border border-[color:var(--line)] bg-[var(--soft)] px-4 py-3 font-semibold outline-none focus:border-[var(--brand)] focus:bg-white" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[var(--brand)] px-4 py-3 text-sm font-black text-white disabled:opacity-70">{isSubmitting ? "Signing in..." : "Sign in"}</button></form><p className="mt-5 text-center text-sm font-semibold text-[var(--muted-ink)]">New customer? <Link href="/auth/signup" className="font-black text-[var(--brand)]">Create an account</Link></p><Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[var(--brand)]"><ArrowLeft className="size-4" /> Return home</Link></div></LoginShell>;
}

function LoginShell({ children }) {
  return <main className="landing-theme grid min-h-screen bg-[var(--page)] px-5 py-10 text-[var(--ink)] sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center"><section className="mx-auto hidden max-w-xl lg:block"><Link href="/" className="flex items-center gap-2 text-sm font-black text-[var(--brand)]"><span className="grid size-7 place-items-center rounded-full bg-[var(--brand)] text-white"><Leaf className="size-4" /></span>NEAT Ethical</Link><h2 className="mt-10 text-6xl leading-none">Welcome back to clearer investing.</h2><p className="mt-6 text-lg font-semibold leading-8 text-[var(--muted-ink)]">Access your customer portal or the protected NEAT staff workspace.</p></section><section className="mx-auto w-full max-w-md">{children}</section></main>;
}
