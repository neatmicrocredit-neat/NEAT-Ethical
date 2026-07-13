import Link from "next/link";
import { ArrowRight, Calculator, CircleDollarSign, Leaf, TrendingUp } from "lucide-react";
import PublicShell from "@/components/public-shell";

const scenarios = [
  { label: "Starting capital", value: "N100,000" },
  { label: "Projected value", value: "N143,800" },
  { label: "Impact allocation", value: "82%" },
];

export default function CalculatorPage() {
  return (
    <PublicShell
      eyebrow="Calculator"
      title="Model the return before you commit the capital."
      description="Explore how investment amount, time horizon, and ethical themes can shape your projected portfolio outcomes."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-lg bg-[var(--brand)] p-7 text-white shadow-[0_30px_80px_rgb(44_22_182_/_0.22)] sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-white/70">Sample projection</p>
              <h2 className="mt-3 text-4xl leading-none sm:text-5xl">Time really is money.</h2>
            </div>
            <Calculator className="hidden size-16 rounded-full bg-white/14 p-4 sm:block" />
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {scenarios.map((scenario) => (
              <div key={scenario.label} className="rounded-lg bg-white/14 p-5 backdrop-blur">
                <p className="text-xs font-bold text-white/65">{scenario.label}</p>
                <p className="mt-8 text-3xl font-black">{scenario.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs font-semibold text-white/65">Illustrative only. Final opportunities include risk notes, timelines, and documentation.</p>
        </section>

        <section className="landing-panel p-7 sm:p-10">
          <CircleDollarSign className="size-12 rounded-full bg-[var(--brand-2)] p-2.5 text-[var(--ink)]" />
          <h3 className="mt-8 text-3xl leading-tight">Compare allocations without the spreadsheet fog.</h3>
          <p className="mt-5 text-sm font-semibold leading-6 text-[var(--muted-ink)]">
            Use the calculator as a planning surface for different ethical themes, expected return bands, and savings milestones.
          </p>
          <div className="mt-8 space-y-3 text-sm font-bold text-[var(--muted-ink)]">
            <p className="flex items-center gap-3"><TrendingUp className="size-4 text-[var(--brand)]" /> Estimate growth ranges</p>
            <p className="flex items-center gap-3"><Leaf className="size-4 text-[var(--brand)]" /> Preview impact themes</p>
          </div>
          <Link href="/get-started" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1">
            Build my plan <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </PublicShell>
  );
}

