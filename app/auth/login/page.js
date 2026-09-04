"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, Leaf, LockKeyhole } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell><LoginFallback /></LoginShell>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const redirectTo = useSearchParams().get("redirectTo") || "/dashboard";
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data?.user) {
      setErrorMessage(error?.message || "Invalid credentials. Please try again.");
      setIsSubmitting(false);
      setEmail("");
      setPassword("");
      return;
    }

    document.cookie = "auth=true; path=/; max-age=86400; SameSite=Lax";
    // The dashboard shell shows who is signed in and stamps it on messages.
    document.cookie = `admin_email=${encodeURIComponent(data.user.email || "")}; path=/; max-age=86400; SameSite=Lax`;
    router.push(redirectTo);
  }

  return (
    <LoginShell>
      <div className="rounded-lg bg-white p-7 shadow-[0_30px_90px_rgb(33_21_95_/_0.14)] ring-1 ring-[var(--line)] sm:p-9">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-[var(--brand)]">Secure access</p>
            <h1 className="mt-2 text-4xl leading-none">Sign in to continue</h1>
          </div>
          <LockKeyhole className="size-12 rounded-full bg-[var(--brand-2)] p-3 text-[var(--ink)]" />
        </div>
        <p className="mt-4 text-sm font-semibold leading-6 text-[var(--muted-ink)]">
          Use your credentials to access the protected NEAT dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {errorMessage ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <label className="block text-sm font-black text-[var(--ink)]">
            Email
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-lg border border-[color:var(--line)] bg-[var(--soft)] px-4 py-3 font-semibold outline-none transition focus:border-[var(--brand)] focus:bg-white"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="block text-sm font-black text-[var(--ink)]">
            Password
            <input
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-lg border border-[color:var(--line)] bg-[var(--soft)] px-4 py-3 font-semibold outline-none transition focus:border-[var(--brand)] focus:bg-white"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[var(--brand)] px-4 py-3 text-sm font-black text-white shadow-[0_16px_36px_rgb(44_22_182_/_0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[var(--brand)]">
          <ArrowLeft className="size-4" /> Return home
        </Link>
      </div>
    </LoginShell>
  );
}

function LoginShell({ children }) {
  return (
    <main className="landing-theme grid min-h-screen bg-[var(--page)] px-5 py-10 text-[var(--ink)] sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
      <section className="mx-auto hidden max-w-xl lg:block">
        <Link href="/" className="flex items-center gap-2 text-sm font-black text-[var(--brand)]">
          <span className="grid size-7 place-items-center rounded-full bg-[var(--brand)] text-white"><Leaf className="size-4" /></span>
          NEAT Ethical
        </Link>
        <h2 className="mt-10 text-6xl leading-none">Welcome back to clearer investing.</h2>
        <p className="mt-6 text-lg font-semibold leading-8 text-[var(--muted-ink)]">
          Review customers, portfolios, onboarding progress, and investment records from the protected workspace.
        </p>
        <div className="mt-10 h-56 rounded-lg bg-[var(--brand)] p-6 text-white shadow-[0_30px_80px_rgb(44_22_182_/_0.22)]">
          <div className="h-full rounded-lg bg-white/14 p-5">
            <p className="text-sm font-bold text-white/70">Portfolio health</p>
            <p className="mt-16 text-4xl font-black">97%</p>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-md">{children}</section>
    </main>
  );
}

function LoginFallback() {
  return <div className="rounded-lg bg-white p-9 text-sm font-black text-[var(--muted-ink)] ring-1 ring-[var(--line)]">Loading secure access...</div>;
}

