'use client'

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BadgeCheck, FileCheck2, ScanSearch, ShieldCheck } from "lucide-react";
import { Reveal, RevealGroup, useAmbientAnimation } from "@/components/reveal";

const pillars = [
  {
    icon: ScanSearch,
    title: "Screened for ethics",
    detail: "Interest-bearing, speculative, and harm-linked activity is filtered out before review.",
  },
  {
    icon: FileCheck2,
    title: "Documented before funding",
    detail: "Contracts, payout dates, and risk notes are agreed in writing, not verbally.",
  },
  {
    icon: BadgeCheck,
    title: "Reported every month",
    detail: "Placement status, profit accrued, and next steps land in one investor view.",
  },
];

const proofStats = [
  { value: "4", label: "Diligence checks per deal" },
  { value: "100%", label: "Placements with signed terms" },
  { value: "30d", label: "Reporting cycle" },
];

export default function TrustSection() {
  return (
    <section className="relative overflow-hidden px-5 py-24 sm:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 size-72 rounded-full bg-[color-mix(in_oklab,var(--brand)_14%,transparent)] blur-3xl" />
        <div className="absolute -right-16 bottom-0 size-80 rounded-full bg-[color-mix(in_oklab,var(--brand-2)_12%,transparent)] blur-3xl" />
      </div>

      <RevealGroup className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <Reveal as="p" className="text-sm font-black uppercase tracking-wide text-[var(--brand)]">
            Why investors stay
          </Reveal>
          <Reveal as="h2" className="mt-3 text-4xl leading-[1.02] sm:text-6xl">
            Built on trust. Backed by results.
          </Reveal>
          <Reveal as="p" className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted-ink)]">
            Every opportunity is reviewed for transparency, ethical fit, risk, and reporting quality before it reaches your dashboard.
          </Reveal>

          <Reveal as="ul" className="mt-10 space-y-5">
            {pillars.map(({ icon: Icon, title, detail }) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklab,var(--brand)_10%,white)] text-[var(--brand)] ring-1 ring-[color:var(--line)]">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-base font-black text-[var(--ink)]">{title}</span>
                  <span className="mt-1 block max-w-md text-sm font-semibold leading-6 text-[var(--muted-ink)]">{detail}</span>
                </span>
              </li>
            ))}
          </Reveal>

          <Reveal className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-black text-white shadow-[0_18px_44px_color-mix(in_oklab,var(--brand)_30%,transparent)] transition hover:-translate-y-1"
            >
              See our approach
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
            <Link href="/returns-calculator" className="text-sm font-black text-[var(--brand)] underline-offset-4 hover:underline">
              Model your returns
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Reveal as="article" className="landing-panel no-rise relative overflow-hidden p-6 sm:row-span-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[var(--brand)] ring-1 ring-[color:var(--line)]">
              <ShieldCheck className="size-4" />
              Verified placement
            </div>
            <p className="mt-6 text-2xl font-black leading-tight text-[var(--ink)]">
              Nothing reaches your dashboard unchecked.
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-[var(--muted-ink)]">
              Four independent checks &mdash; ethical screen, counterparty review, documentation, and payout modelling.
            </p>
            <TrustSealArt />
          </Reveal>

          <Reveal as="article" className="landing-panel no-rise overflow-hidden p-6">
            <p className="text-xl font-black leading-tight text-[var(--ink)]">Grow with clarity, not confusion.</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-[var(--muted-ink)]">
              Track returns, strategy, impact, and next steps from one clean investment view.
            </p>
            <GrowthCurveArt />
          </Reveal>

          <Reveal as="article" className="landing-panel no-rise p-6">
            <p className="text-xl font-black leading-tight text-[var(--ink)]">Proof, not promises.</p>
            <dl className="mt-6 space-y-4">
              {proofStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-baseline justify-between gap-3 border-b border-dashed border-[color:var(--line)] pb-3 last:border-0 last:pb-0"
                >
                  <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted-ink)]">{stat.label}</dt>
                  <dd className="text-2xl font-black text-[var(--brand)]">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </RevealGroup>
    </section>
  );
}

function TrustSealArt() {
  const orbit = useAmbientAnimation({ rotate: 360 });

  return (
    <svg viewBox="0 0 320 260" role="img" aria-label="Verified ethical placement seal" className="mt-8 w-full">
      <defs>
        <linearGradient id="seal-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--brand-2)" />
        </linearGradient>
        <linearGradient id="seal-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g fill="none" stroke="var(--line)" strokeWidth="1.5">
        <circle cx="160" cy="126" r="112" />
        <circle cx="160" cy="126" r="88" strokeDasharray="4 8" />
      </g>

      <motion.g
        animate={orbit}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        style={{ originX: "160px", originY: "126px" }}
      >
        <circle cx="160" cy="14" r="6" fill="var(--brand)" />
        <circle cx="272" cy="126" r="4.5" fill="var(--brand-2)" opacity="0.75" />
        <circle cx="160" cy="238" r="5" fill="var(--brand)" opacity="0.45" />
        <circle cx="48" cy="126" r="4.5" fill="var(--brand-2)" opacity="0.6" />
      </motion.g>

      <motion.g
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ originX: "160px", originY: "126px" }}
      >
        <path d="M160 42 L236 74 V132 c0 44-32 72-76 90-44-18-76-46-76-90V74Z" fill="url(#seal-shield)" />
        <path d="M160 42 L236 74 V132 c0 44-32 72-76 90-44-18-76-46-76-90V74Z" fill="url(#seal-sheen)" />
        <motion.path
          d="M124 130 l26 26 l50 -56"
          fill="none"
          stroke="#ffffff"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
        />
      </motion.g>
    </svg>
  );
}

function GrowthCurveArt() {
  const line = "M8 96 C48 92 64 72 96 66 S150 58 182 34 218 14 236 10";

  return (
    <svg viewBox="0 0 244 112" role="img" aria-label="Projected growth curve" className="mt-8 w-full">
      <defs>
        <linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g stroke="var(--line)" strokeWidth="1">
        {[26, 54, 82].map((y) => (
          <line key={y} x1="8" y1={y} x2="236" y2={y} />
        ))}
      </g>

      <path d={`${line} L236 104 L8 104 Z`} fill="url(#growth-fill)" />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--brand)"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
      <motion.circle
        cx="236"
        cy="10"
        r="7"
        fill="var(--brand-2)"
        stroke="#ffffff"
        strokeWidth="3"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 1, ease: "backOut" }}
        style={{ originX: "236px", originY: "10px" }}
      />
    </svg>
  );
}
