'use client'

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealGroup } from "@/components/reveal";

const testimonials = [
  {
    quote: "It helped me understand where my money goes.",
    author: "NEAT investor",
    context: "Neat Ethical placement",
    featured: true,
  },
  {
    quote: "The projections finally made long-term investing feel practical.",
    author: "NEAT investor",
    context: "Returns calculator user",
  },
  {
    quote: "I can grow my portfolio without compromising my values.",
    author: "NEAT investor",
    context: "Neat Funding placement",
  },
];

export default function TestimonialsSection() {
  const [featured, ...rest] = testimonials;

  return (
    <section className="relative overflow-hidden px-5 py-24 sm:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-8 size-96 -translate-x-1/2 rounded-full bg-[color-mix(in_oklab,var(--brand)_9%,transparent)] blur-3xl" />
      </div>

      <RevealGroup className="mx-auto max-w-7xl" amount={0.15}>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <div>
            <Reveal as="p" className="text-sm font-black uppercase tracking-wide text-[var(--brand)]">
              In their words
            </Reveal>
            <Reveal as="h2" className="mt-3 text-4xl leading-[1.02] sm:text-6xl">
              What investors tell us
            </Reveal>
          </div>
          <Reveal as="p" className="max-w-xl text-lg leading-8 text-[var(--muted-ink)]">
            Your goals are personal. NEAT helps you build a plan that keeps your values, timeline, and risk appetite in view.
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          <Reveal
            as="figure"
            className="relative flex flex-col justify-between overflow-hidden rounded-lg bg-[var(--brand)] p-8 text-white lg:col-span-7 lg:p-10"
          >
            <QuoteMark className="absolute -right-4 -top-6 w-40 text-white/10" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_75%_120%,color-mix(in_oklab,var(--brand-2)_55%,transparent),transparent_65%)]" />

            <blockquote className="relative text-3xl font-black leading-tight sm:text-4xl">
              &ldquo;{featured.quote}&rdquo;
            </blockquote>

            <figcaption className="relative mt-12 flex items-center gap-4">
              <Monogram label={featured.author} tone="light" />
              <span>
                <span className="block text-sm font-black">{featured.author}</span>
                <span className="block text-xs font-semibold text-white/70">{featured.context}</span>
              </span>
            </figcaption>
          </Reveal>

          <div className="grid gap-5 lg:col-span-5">
            {rest.map((item) => (
              <Reveal
                as="figure"
                key={item.quote}
                className="landing-card no-rise relative flex flex-col justify-between overflow-hidden p-7"
              >
                <QuoteMark className="absolute -right-2 -top-4 w-24 text-[color-mix(in_oklab,var(--brand)_10%,transparent)]" />
                <blockquote className="relative text-lg font-black leading-snug text-[var(--ink)]">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="relative mt-8 flex items-center gap-3">
                  <Monogram label={item.author} />
                  <span>
                    <span className="block text-sm font-black text-[var(--ink)]">{item.author}</span>
                    <span className="block text-xs font-semibold text-[var(--muted-ink)]">{item.context}</span>
                  </span>
                </figcaption>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/investment-request"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-black text-white shadow-[0_18px_44px_color-mix(in_oklab,var(--brand)_28%,transparent)] transition hover:-translate-y-1"
          >
            Start your placement
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
          <Link href="/contact" className="text-sm font-black text-[var(--brand)] underline-offset-4 hover:underline">
            Talk to the team first
          </Link>
        </Reveal>
      </RevealGroup>
    </section>
  );
}

function Monogram({ label, tone = "dark" }) {
  const initials = label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const light = tone === "light";

  return (
    <span
      aria-hidden="true"
      className={
        light
          ? "grid size-12 shrink-0 place-items-center rounded-full bg-white/15 text-sm font-black text-white ring-1 ring-white/30"
          : "grid size-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklab,var(--brand)_12%,white)] text-sm font-black text-[var(--brand)] ring-1 ring-[color:var(--line)]"
      }
    >
      {initials}
    </span>
  );
}

function QuoteMark({ className }) {
  return (
    <svg viewBox="0 0 120 96" aria-hidden="true" className={className} fill="currentColor">
      <path d="M50 8v40c0 24-14 38-38 40v-16c13-2 20-9 21-20H10V8Z" />
      <path d="M110 8v40c0 24-14 38-38 40v-16c13-2 20-9 21-20H70V8Z" />
    </svg>
  );
}
