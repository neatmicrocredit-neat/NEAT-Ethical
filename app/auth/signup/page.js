import Link from "next/link";
import { CustomerAuthForm } from "@/components/customer-auth-form";

export default function CustomerSignupPage() {
  return <main className="landing-theme min-h-screen bg-[var(--page)] px-5 py-16"><div className="mx-auto max-w-lg rounded-3xl bg-white p-7 shadow-xl sm:p-10"><Link href="/" className="font-black text-[var(--brand)]">NEAT Ethical</Link><h1 className="mt-10 text-4xl font-black tracking-tight">Create your investment account</h1><p className="mt-3 mb-8 text-slate-600">Your personal portal lets you request investments, funding, and loans and track every response.</p><CustomerAuthForm mode="signup" /></div></main>;
}
