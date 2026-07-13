import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, Landmark, Scale, ShieldCheck, TrendingUp } from "lucide-react";
import PublicShell from "@/components/public-shell";

const values = [
  { icon: ShieldCheck, title: "Reviewed opportunities", text: "Every investment is screened for transparency, ethical fit, risk, and reporting quality." },
  { icon: Eye, title: "Plain-language visibility", text: "Investors see what their money supports, how returns are projected, and what changes over time." },
  { icon: Scale, title: "Values with discipline", text: "Our approach pairs ethical principles with careful portfolio thinking and practical controls." },
];

const vehicles = [
  { icon: TrendingUp, name: "Neat Ethical", rate: "24% p.a.", monthly: "2% monthly flat profit", text: "Designed as the steadier NEAT placement for investors who want ethical exposure with clear return modelling." },
  { icon: Landmark, name: "Neat Funding", rate: "60% p.a.", monthly: "5% monthly flat profit", text: "Routes capital through Neat Microfinance SME lending pools, so the higher return comes with lending-pool repayment risk." },
];

export default function AboutPage() {
  return (
    <PublicShell
      eyebrow="About NEAT"
      title="Built for people who expect their money to mean something."
      description="NEAT helps investors align capital with values without sacrificing clarity, control, or a polished digital experience."
    >
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="landing-panel p-7 sm:p-10">
          <p className="text-sm font-black uppercase text-[var(--brand)]">Our mission</p>
          <h2 className="mt-4 text-4xl leading-none sm:text-5xl">Make ethical investing easier to understand and easier to act on.</h2>
          <p className="mt-6 text-lg font-semibold leading-8 text-[var(--muted-ink)]">
            We combine guided onboarding, portfolio planning, and impact reporting so investors can move from interest to action with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/investment-request" className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1">
              Start investing <ArrowRight className="size-4" />
            </Link>
            <Link href="/contact" className="rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-black text-[var(--ink)] transition hover:border-[var(--brand)]">
              Talk to the team
            </Link>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-lg bg-[var(--brand)] p-7 text-white shadow-[0_30px_80px_rgb(44_22_182_/_0.22)] sm:p-10">
          <div className="absolute right-[-38px] top-[-42px] h-40 w-40 rounded-full bg-[var(--brand-2)]" />
          <div className="absolute bottom-[-48px] left-8 h-28 w-28 rounded-full border-[18px] border-white/18" />
          <p className="relative text-sm font-black uppercase text-white/70">Why it matters</p>
          <h3 className="relative mt-4 text-4xl leading-none">Confidence grows when the details are visible.</h3>
          <div className="relative mt-10 space-y-4">
            {["Impact scoring", "Ethical screening", "Clear reporting"].map((item) => (
              <p key={item} className="flex items-center gap-3 text-sm font-bold text-white/85">
                <CheckCircle2 className="size-5 text-[var(--brand-2)]" /> {item}
              </p>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="landing-panel p-7 sm:p-10">
          <p className="text-sm font-black uppercase text-[var(--brand)]">How NEAT works</p>
          <h2 className="mt-4 text-4xl leading-none sm:text-5xl">A clearer path from interest to placement.</h2>
          <p className="mt-6 text-sm font-semibold leading-7 text-[var(--muted-ink)]">
            NEAT helps investors compare the real products, submit the details needed to process a request, and understand projected profit before any capital is committed.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {vehicles.map(({ icon: Icon, name, rate, monthly, text }) => (
            <article key={name} className="landing-card p-6">
              <Icon className="size-11 rounded-full bg-[var(--soft)] p-2.5 text-[var(--brand)]" />
              <h3 className="mt-8 text-3xl leading-tight">{name}</h3>
              <p className="mt-4 text-5xl font-black text-[var(--brand)]">{rate}</p>
              <p className="mt-2 text-sm font-black text-[var(--ink)]">{monthly}</p>
              <p className="mt-4 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {values.map(({ icon: Icon, title, text }) => (
          <article key={title} className="landing-card p-6">
            <Icon className="size-11 rounded-full bg-[var(--soft)] p-2.5 text-[var(--brand)]" />
            <h3 className="mt-8 text-2xl leading-tight">{title}</h3>
            <p className="mt-4 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{text}</p>
          </article>
        ))}
      </div>
    </PublicShell>
  );
}

