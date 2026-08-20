import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Eye,
  FileSignature,
  Landmark,
  Scale,
  ScanSearch,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import PublicShell from "@/components/public-shell";
import { Reveal, RevealGroup } from "@/components/reveal";

const values = [
  { icon: ShieldCheck, title: "Reviewed opportunities", text: "Every investment is screened for transparency, ethical fit, risk, and reporting quality." },
  { icon: Eye, title: "Plain-language visibility", text: "Investors see what their money supports, how returns are projected, and what changes over time." },
  { icon: Scale, title: "Values with discipline", text: "Our approach pairs ethical principles with careful portfolio thinking and practical controls." },
];

const vehicles = [
  {
    icon: TrendingUp,
    name: "Neat Ethical",
    rate: "24% p.a.",
    monthly: "2% monthly flat profit",
    text: "Designed as the steadier NEAT placement for investors who want ethical exposure with clear return modelling.",
  },
  {
    icon: Landmark,
    name: "Neat Funding",
    rate: "60% p.a.",
    monthly: "5% monthly flat profit",
    text: "Routes capital through Neat Microfinance SME lending pools, so the higher return comes with lending-pool repayment risk.",
  },
];

const journey = [
  {
    icon: TrendingUp,
    title: "Model the return",
    text: "Set your capital, term, and profit handling in the calculator to see monthly profit, total profit, and maturity value before you talk to anyone.",
  },
  {
    icon: FileSignature,
    title: "Place your investment",
    text: "Four steps: your details, ID documents and next of kin, then the vehicle, amount, dates, payout schedule, and bank account.",
  },
  {
    icon: ScanSearch,
    title: "We confirm the details",
    text: "The team reviews what you submitted and comes back to you, so nothing is funded on details that have not been confirmed.",
  },
  {
    icon: BadgeCheck,
    title: "Documentation, then funding",
    text: "Dates, payout details, and the risk notes for your placement are agreed in writing before any capital is committed.",
  },
  {
    icon: Wallet,
    title: "Payouts and reporting",
    text: "Profit is paid on the schedule you chose — monthly or at maturity — or rolled over, with placement status visible as it progresses.",
  },
];

const screenedOut = [
  "Interest-bearing lending arrangements",
  "Speculative positions and gambling",
  "Activity linked to demonstrable harm",
];

export default function AboutPage() {
  return (
    <PublicShell
      eyebrow="About NEAT"
      title="Built for people who expect their money to mean something."
      description="NEAT helps investors align capital with values without sacrificing clarity, control, or a polished digital experience."
    >
      <RevealGroup className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" amount={0.1}>
        <Reveal as="section" className="landing-panel no-rise p-7 sm:p-10">
          <p className="text-sm font-black uppercase tracking-wide text-[var(--brand)]">Our mission</p>
          <h2 className="mt-4 text-3xl leading-none sm:text-4xl lg:text-5xl">
            Make ethical investing easier to understand and easier to act on.
          </h2>
          <p className="mt-6 text-base font-semibold leading-8 text-[var(--muted-ink)] sm:text-lg">
            We combine guided onboarding, portfolio planning, and impact reporting so investors can move from interest to action with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/investment-request"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1"
            >
              Start investing
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-black text-[var(--ink)] transition hover:border-[var(--brand)]"
            >
              Talk to the team
            </Link>
          </div>
        </Reveal>

        <Reveal as="section" className="relative overflow-hidden rounded-lg bg-[var(--brand)] p-7 text-white shadow-[0_30px_80px_color-mix(in_oklab,var(--brand)_26%,transparent)] sm:p-10">
          <div aria-hidden="true" className="absolute right-[-38px] top-[-42px] size-40 rounded-full bg-[var(--brand-2)]" />
          <div aria-hidden="true" className="absolute bottom-[-48px] left-8 size-28 rounded-full border-[18px] border-white/18" />
          <p className="relative text-sm font-black uppercase tracking-wide text-white/70">Why it matters</p>
          <h3 className="relative mt-4 text-3xl leading-none sm:text-4xl">Confidence grows when the details are visible.</h3>
          <div className="relative mt-10 space-y-4">
            {["Impact scoring", "Ethical screening", "Clear reporting"].map((item) => (
              <p key={item} className="flex items-center gap-3 text-sm font-bold text-white/85">
                <CheckCircle2 className="size-5 shrink-0 text-[var(--brand-2)]" /> {item}
              </p>
            ))}
          </div>
        </Reveal>
      </RevealGroup>

      {/* ------------------------------------------------------------- journey */}
      <RevealGroup className="mt-6" amount={0.1}>
        <div className="landing-panel no-rise p-7 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <Reveal as="p" className="text-sm font-black uppercase tracking-wide text-[var(--brand)]">
                How NEAT works
              </Reveal>
              <Reveal as="h2" className="mt-4 text-3xl leading-none sm:text-4xl lg:text-5xl">
                A clearer path from interest to placement.
              </Reveal>
            </div>
            <Reveal as="p" className="text-sm font-semibold leading-7 text-[var(--muted-ink)]">
              NEAT helps investors compare the real products, submit the details needed to place an investment, and understand projected profit before any capital is committed.
            </Reveal>
          </div>

          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {journey.map(({ icon: Icon, title, text }, index) => (
              <Reveal as="li" key={title} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute left-5 top-11 hidden h-[calc(100%-1rem)] w-px bg-[color:var(--line)] sm:block lg:left-11 lg:top-5 lg:h-px lg:w-[calc(100%-1rem)]"
                />
                <span className="relative grid size-10 place-items-center rounded-full bg-[var(--brand)] text-sm font-black text-white">
                  {index + 1}
                </span>
                <Icon className="mt-5 size-6 text-[var(--brand)]" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-black leading-tight text-[var(--ink)]">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </RevealGroup>

      {/* ------------------------------------------------------------ vehicles */}
      <RevealGroup className="mt-6 grid gap-5 lg:grid-cols-[0.82fr_1.18fr]" amount={0.1}>
        <Reveal className="landing-panel no-rise p-7 sm:p-10">
          <p className="text-sm font-black uppercase tracking-wide text-[var(--brand)]">The two routes</p>
          <h2 className="mt-4 text-3xl leading-none sm:text-4xl lg:text-5xl">Same placement flow, two return profiles.</h2>
          <p className="mt-6 text-sm font-semibold leading-7 text-[var(--muted-ink)]">
            Both routes are documented before funding and reported on afterwards. What differs is where the capital sits and how much risk sits with it.
          </p>
          <Link
            href="/returns-calculator"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-black text-[var(--brand)]"
          >
            Compare them in the calculator
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {vehicles.map(({ icon: Icon, name, rate, monthly, text }) => (
            <Reveal as="article" key={name} className="landing-card no-rise p-6">
              <Icon className="size-11 rounded-full bg-[var(--soft)] p-2.5 text-[var(--brand)]" />
              <h3 className="mt-8 text-2xl leading-tight sm:text-3xl">{name}</h3>
              <p className="mt-4 text-4xl font-black text-[var(--brand)] sm:text-5xl">{rate}</p>
              <p className="mt-2 text-sm font-black text-[var(--ink)]">{monthly}</p>
              <p className="mt-4 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{text}</p>
            </Reveal>
          ))}
        </div>
      </RevealGroup>

      {/* -------------------------------------------------------------- values */}
      <RevealGroup className="mt-6 grid gap-5 md:grid-cols-3" amount={0.1}>
        {values.map(({ icon: Icon, title, text }) => (
          <Reveal as="article" key={title} className="landing-card no-rise p-6">
            <Icon className="size-11 rounded-full bg-[var(--soft)] p-2.5 text-[var(--brand)]" />
            <h3 className="mt-8 text-2xl leading-tight">{title}</h3>
            <p className="mt-4 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{text}</p>
          </Reveal>
        ))}
      </RevealGroup>

      {/* --------------------------------------------------------- screened out */}
      <RevealGroup className="mt-6" amount={0.2}>
        <Reveal className="grid gap-8 rounded-lg bg-[color-mix(in_oklab,var(--brand)_6%,white)] p-7 ring-1 ring-[color:var(--line)] sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Ban className="size-11 rounded-full bg-white p-2.5 text-[var(--brand)] ring-1 ring-[color:var(--line)]" aria-hidden="true" />
            <h2 className="mt-6 text-3xl leading-none sm:text-4xl">What we screen out</h2>
            <p className="mt-5 text-sm font-semibold leading-7 text-[var(--muted-ink)]">
              Ethical fit is a filter applied before an opportunity is considered, not a label added afterwards.
            </p>
          </div>
          <ul className="grid gap-3">
            {screenedOut.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg bg-white p-4 text-sm font-bold text-[var(--ink)] ring-1 ring-[color:var(--line)]"
              >
                <Ban className="mt-0.5 size-4 shrink-0 text-[var(--brand)]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </RevealGroup>
    </PublicShell>
  );
}
