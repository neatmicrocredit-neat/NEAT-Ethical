'use client'

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Calculator } from "lucide-react";
import { Reveal, RevealGroup, useAmbientAnimation } from "@/components/reveal";

const paths = [
  {
    title: "Take profit monthly",
    route: "Neat Ethical",
    rate: "2%",
    rateNote: "monthly flat profit",
    detail: "Draw your profit as it accrues and leave the capital placed. Suited to investors who want the return in hand each cycle.",
    points: ["24% p.a. equivalent", "Profit paid on a fixed cycle", "Capital stays in the placement"],
    Art: StepsArt,
  },
  {
    title: "Reinvest and compound",
    route: "Neat Ethical or Neat Funding",
    rate: "Roll over",
    rateNote: "profit back into capital",
    detail: "Leave each payout in place so the next cycle is calculated on a larger base. The calculator shows what that looks like over time.",
    points: ["Compounding modelled upfront", "Switch back to payouts anytime", "Best for longer horizons"],
    Art: CompoundArt,
  },
  {
    title: "Fund SMEs directly",
    route: "Neat Funding",
    rate: "5%",
    rateNote: "monthly flat profit",
    detail: "Capital goes into Neat Microfinance SME lending pools. Higher return, with the lending exposure explained before you commit.",
    points: ["60% p.a. equivalent", "SME lending pools", "Risk notes shared upfront"],
    Art: NetworkArt,
  },
];

export default function GrowthPathsSection() {
  return (
    <section className="border-y border-[color:var(--line)] bg-white px-5 py-24 sm:px-8">
      <RevealGroup className="mx-auto max-w-7xl" amount={0.15}>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <Reveal as="p" className="text-sm font-black uppercase tracking-wide text-[var(--brand)]">
              Choose your pace
            </Reveal>
            <Reveal as="h2" className="mt-3 text-4xl leading-none sm:text-5xl">
              How would you like to grow?
            </Reveal>
          </div>
          <Reveal as="p" className="max-w-xl text-base font-semibold leading-7 text-[var(--muted-ink)]">
            The same two NEAT routes can be shaped around what you need &mdash; income now, compounding later, or direct SME exposure. Pick the shape first, then place your investment.
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {paths.map(({ title, route, rate, rateNote, detail, points, Art }) => (
            <Reveal
              key={title}
              as="article"
              className="landing-card no-rise group flex flex-col overflow-hidden p-0"
            >
              <div className="relative bg-[color-mix(in_oklab,var(--brand)_6%,white)] px-6 pb-2 pt-6">
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[var(--brand)] ring-1 ring-[color:var(--line)]">
                  {route}
                </span>
                <Art />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl leading-tight">{title}</h3>
                <p className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-4xl font-black text-[var(--brand)]">{rate}</span>
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted-ink)]">{rateNote}</span>
                </p>
                <p className="mt-4 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{detail}</p>

                <ul className="mt-6 space-y-2.5 border-t border-dashed border-[color:var(--line)] pt-5">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm font-semibold text-[var(--ink)]">
                      <CheckDot />
                      {point}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/investment-request"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[var(--brand)]"
                >
                  Place this investment
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[color-mix(in_oklab,var(--brand)_5%,white)] px-6 py-5 ring-1 ring-[color:var(--line)]">
          <p className="text-sm font-black text-[var(--ink)]">
            Not sure which shape fits? Model both routes side by side first.
          </p>
          <Link
            href="/returns-calculator"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5"
          >
            <Calculator className="size-4" />
            Open the calculator
          </Link>
        </Reveal>
      </RevealGroup>
    </section>
  );
}

function CheckDot() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="mt-0.5 size-4 shrink-0">
      <circle cx="10" cy="10" r="9" fill="color-mix(in oklab, var(--brand) 12%, white)" />
      <path d="M6 10.5 l2.6 2.6 L14.2 7" fill="none" stroke="var(--brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StepsArt() {
  const steps = [
    { x: 12, h: 26 },
    { x: 52, h: 42 },
    { x: 92, h: 58 },
    { x: 132, h: 74 },
    { x: 172, h: 90 },
  ];

  return (
    <svg viewBox="0 0 208 116" role="img" aria-label="Level monthly payouts" className="mt-4 w-full">
      <line x1="6" y1="104" x2="202" y2="104" stroke="var(--line)" strokeWidth="1.5" />
      {steps.map((step, index) => (
        <motion.g
          key={step.x}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: index * 0.09, ease: "easeOut" }}
        >
          <rect
            x={step.x}
            y={104 - step.h}
            width="26"
            height={step.h}
            rx="5"
            fill={index === steps.length - 1 ? "var(--brand)" : "color-mix(in oklab, var(--brand) 26%, white)"}
          />
          <rect x={step.x} y={104 - step.h} width="26" height="7" rx="3.5" fill="var(--brand-2)" opacity="0.85" />
        </motion.g>
      ))}
    </svg>
  );
}

function CompoundArt() {
  const curve = "M8 100 C58 98 84 88 116 70 S170 32 200 10";

  return (
    <svg viewBox="0 0 208 116" role="img" aria-label="Compounding curve" className="mt-4 w-full">
      <defs>
        <linearGradient id="compound-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="6" y1="104" x2="202" y2="104" stroke="var(--line)" strokeWidth="1.5" />
      <path d={`${curve} L200 104 L8 104 Z`} fill="url(#compound-fill)" />
      <motion.path
        d={curve}
        fill="none"
        stroke="var(--brand)"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      {[
        { cx: 64, cy: 95, r: 5 },
        { cx: 116, cy: 70, r: 6.5 },
        { cx: 200, cy: 10, r: 8 },
      ].map((dot, index) => (
        <motion.circle
          key={dot.cx}
          {...dot}
          fill="var(--brand-2)"
          stroke="#ffffff"
          strokeWidth="2.5"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.5 + index * 0.18, ease: "backOut" }}
          style={{ originX: `${dot.cx}px`, originY: `${dot.cy}px` }}
        />
      ))}
    </svg>
  );
}

function NetworkArt() {
  const nodes = [
    { cx: 40, cy: 30 },
    { cx: 36, cy: 88 },
    { cx: 172, cy: 26 },
    { cx: 176, cy: 84 },
    { cx: 104, cy: 104 },
  ];
  const pulse = useAmbientAnimation({ scale: [1, 1.06, 1] });

  return (
    <svg viewBox="0 0 208 116" role="img" aria-label="Capital distributed across SME pools" className="mt-4 w-full">
      <g stroke="var(--line)" strokeWidth="1.5">
        {nodes.map((node) => (
          <line key={`${node.cx}-${node.cy}`} x1="104" y1="58" x2={node.cx} y2={node.cy} />
        ))}
      </g>
      {nodes.map((node, index) => (
        <motion.circle
          key={`${node.cx}-${node.cy}`}
          cx={node.cx}
          cy={node.cy}
          r="11"
          fill="color-mix(in oklab, var(--brand) 22%, white)"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.25 + index * 0.1, ease: "backOut" }}
          style={{ originX: `${node.cx}px`, originY: `${node.cy}px` }}
        />
      ))}
      <motion.g
        animate={pulse}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "104px", originY: "58px" }}
      >
        <circle cx="104" cy="58" r="26" fill="var(--brand)" />
        <circle cx="104" cy="58" r="26" fill="none" stroke="var(--brand-2)" strokeWidth="2.5" opacity="0.6" />
        <text
          x="104"
          y="63"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="15"
          fontWeight="900"
          fontFamily="inherit"
        >
          SME
        </text>
      </motion.g>
    </svg>
  );
}
