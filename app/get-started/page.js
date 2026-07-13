import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, SlidersHorizontal, UserRound } from "lucide-react";
import PublicShell from "@/components/public-shell";

const steps = [
  { icon: UserRound, title: "Create your profile", text: "Tell us about your goals, horizon, and investing experience." },
  { icon: SlidersHorizontal, title: "Set preferences", text: "Choose the ethical themes and risk posture that fit you." },
  { icon: ClipboardCheck, title: "Review options", text: "See curated opportunities with clear notes before you commit." },
];

export default function GetStartedPage() {
  return (
    <PublicShell
      eyebrow="Get started"
      title="Start with your values. Build with clarity."
      description="Begin your ethical investment journey with a guided onboarding flow designed to make every next step obvious."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_0.88fr]">
        <section className="rounded-lg bg-[var(--brand)] p-7 text-white shadow-[0_30px_80px_rgb(44_22_182_/_0.22)] sm:p-10">
          <p className="text-sm font-black uppercase text-white/70">Onboarding</p>
          <h2 className="mt-4 text-4xl leading-none sm:text-5xl">Launch a portfolio plan in minutes.</h2>
          <p className="mt-6 max-w-xl text-sm font-semibold leading-7 text-white/75">
            NEAT turns your goals into a practical investment path, then gives you the dashboard to monitor returns, impact, and milestones.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-2)] px-5 py-3 text-sm font-black text-[var(--ink)] transition hover:-translate-y-1">
              Open dashboard <ArrowRight className="size-4" />
            </Link>
            <Link href="/calculator" className="rounded-full border border-white/25 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">
              Try calculator
            </Link>
          </div>
        </section>

        <section className="landing-panel p-7 sm:p-10">
          <h3 className="text-3xl leading-tight">What happens next</h3>
          <div className="mt-8 space-y-5">
            {steps.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <Icon className="size-11 shrink-0 rounded-full bg-[var(--soft)] p-2.5 text-[var(--brand)]" />
                <div>
                  <p className="font-black text-[var(--ink)]">{title}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 flex items-center gap-3 rounded-lg bg-[var(--soft)] p-4 text-sm font-bold text-[var(--ink)]">
            <CheckCircle2 className="size-5 text-[var(--brand)]" /> No pressure, just a clearer first decision.
          </p>
        </section>
      </div>
    </PublicShell>
  );
}

