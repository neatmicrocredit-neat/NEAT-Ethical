'use client'
import {motion, AnimatePresence} from 'motion/react'
import Link from "next/link";
import { ArrowRight, Landmark, Play, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatableChild, AnimatableParent } from '@/components/animation-container';


const cards = [
  { title: "Sukuk notes", value: "18.4%", label: "Projected yearly return" },
  { title: "Green agriculture", value: "N4.36m", label: "Capital deployed" },
  { title: "Clean logistics", value: "97%", label: "Impact score" },
];

const themes = [
  ["Primary", "#2c16b6"],
  ["Secondary", "#f8f512"],
  ["Ink", "#21155f"],
  ["Soft", "#f5f3ff"],
];

const testimonials = [
  "It helped me understand where my money goes.",
  "The projections finally made long-term investing feel practical.",
  "I can grow my portfolio without compromising my values.",
];

const investmentVehicles = [
  {
    name: "Neat Ethical",
    rate: "24% p.a.",
    detail: "2% monthly flat profit for investors who want a steadier ethical placement with clear documentation.",
  },
  {
    name: "Neat Funding",
    rate: "60% p.a.",
    detail: "5% monthly flat profit through Neat Microfinance SME lending pools, with lending exposure explained upfront.",
  },
];



const HeroText = () => {
  return(
    <motion.h1
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mx-auto max-w-3xl text-balance text-5xl leading-[0.96] sm:text-7xl lg:text-8xl">
      Watch your money do more
    </motion.h1>
  )
}


export default function Home() {

  const isMobile = useIsMobile();

  return (
    <main className="landing-theme min-h-screen overflow-hidden bg-[var(--page)] text-[var(--ink)]">
      <section className="relative flex min-h-screen items-center justify-center px-5 pb-16 pt-28 sm:px-8"
        style={{ backgroundImage: "url('/img/hero-money-nobg.png')", backgroundSize: "cover", backgroundBlendMode: "color", backgroundPosition: isMobile? 'left': "center", }}
      
      >
        <PublicHeader />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 landing-grid opacity-10" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'backInOut'}}
            className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--muted-ink)] shadow-sm">
            <Sparkles className="size-4 text-[var(--brand)]" />
            Transparent wealth building
          </motion.div>
          
          {/* Animated Hero Text */}
          <HeroText />

          <motion.p 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-2xl text-pretty text-lg font-medium leading-8 text-[var(--ink)]">
            Invest in Neat Ethical at 24% p.a. or Neat Funding at 60% p.a., then track your placement, projected profit, and next steps with clarity.
          </motion.p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/investment-request" className="group inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_44px_color-mix(in_oklab,var(--brand)_32%,transparent)] transition hover:-translate-y-1">
              Start building wealth
              <ArrowRight className="size-4 transition group-hover:translate-x-2" />
            </Link>
            <Link href="/returns-calculator" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-1 hover:border-[color:var(--brand)]">
              <TrendingUp className="size-4 text-[var(--brand)]" />
              Model returns
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase text-[var(--brand)]">The investment</p>
            <h2 className="mt-3 text-4xl leading-none sm:text-5xl">Two NEAT routes, one clear request flow.</h2>
            <p className="mt-6 max-w-xl text-sm font-semibold leading-7 text-[var(--muted-ink)]">
              NEAT gives investors a plain-language way to compare return profiles before the team confirms documentation, dates, payout details, and risk notes.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {investmentVehicles.map((vehicle) => (
              <article key={vehicle.name} className="landing-card p-6">
                <Landmark className="size-11 rounded-full bg-[var(--soft)] p-2.5 text-[var(--brand)]" />
                <h3 className="mt-8 text-3xl leading-tight">{vehicle.name}</h3>
                <p className="mt-4 text-5xl font-black text-[var(--brand)]">{vehicle.rate}</p>
                <p className="mt-4 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{vehicle.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[color:var(--line)] bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <h2 className="text-4xl leading-none sm:text-5xl">How would you like to grow?</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {cards.map((card, index) => (
              <article key={card.title} className="landing-card group min-h-52 p-6" style={{ "--delay": `${index * 120}ms` }}>
                <p className="text-sm font-bold text-[var(--muted-ink)]">{card.title}</p>
                <p className="mt-8 text-4xl font-black text-[var(--brand)]">{card.value}</p>
                <p className="mt-3 text-sm font-semibold text-[var(--muted-ink)]">{card.label}</p>
                <div className="mt-8 h-2 rounded-full bg-[var(--soft)]">
                  <div className="h-full w-3/4 rounded-full bg-[var(--brand)] transition group-hover:w-full" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-4xl leading-[1.02] sm:text-6xl">Built on trust. Backed by results.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted-ink)]">
              Every opportunity is reviewed for transparency, ethical fit, risk, and reporting quality before it reaches your dashboard.
            </p>
            <AnimatableParent variants={{hover: {}}}>
              <Link href="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-black text-[var(--brand)]">
              See our approach 
              <AnimatableChild variants={{hover: {x: 5}, initial: {x: 0}}}><ArrowRight className="size-4" /></AnimatableChild>
            </Link>
            </AnimatableParent>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="landing-panel flex min-h-80 items-end p-6">
              <ShieldCheck className="size-16 rounded-full bg-sky-100 p-3 text-sky-500" />
            </div>
            <div className="landing-panel min-h-80 p-6">
              <p className="text-xl font-black leading-tight">Grow with clarity, not confusion.</p>
              <p className="mt-8 text-sm font-semibold leading-6 text-[var(--muted-ink)]">
                Track returns, strategy, impact, and next steps from one clean investment view.
              </p>
              <div className="mt-12 h-24 rounded-t-full bg-[radial-gradient(circle_at_70%_30%,#ffe76a,transparent_42%),var(--brand)] opacity-90" />
            </div>
            <div className="landing-panel relative min-h-80 overflow-hidden p-6">
              <ImpactFlowers />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--brand)] px-5 py-24 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <h2 className="text-4xl leading-none sm:text-6xl">Time really is money</h2>
            <p className="max-w-xl text-sm font-semibold leading-7 text-white/78">
              The sooner your capital is thoughtfully placed, the more room it has to grow. Explore projected values in a dashboard made for clear decisions.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <div key={card.title} className="rounded-lg bg-white/14 p-6 shadow-inner shadow-white/10 backdrop-blur">
                <p className="text-sm font-bold text-white/70">{card.title}</p>
                <p className="mt-10 text-3xl font-black">{card.value}</p>
                <p className="mt-2 text-xs font-semibold text-white/65">{card.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2">
            <h2 className="text-4xl leading-[1.02] sm:text-6xl">Millions of customers cannot be wrong</h2>
            <p className="max-w-xl text-lg leading-8 text-[var(--muted-ink)]">
              Your goals are personal. NEAT helps you build a plan that keeps your values, timeline, and risk appetite in view.
            </p>
          </div>
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {testimonials.map((quote, index) => (
              <article key={quote} className="landing-quote min-h-56 p-6" style={{ "--delay": `${index * 150}ms` }}>
                <button className="ml-auto grid size-8 place-items-center rounded-full bg-white text-[var(--muted-ink)]" aria-label="Play testimonial">
                  <Play className="size-4 fill-current" />
                </button>
                <p className="mt-20 text-lg font-black leading-tight text-white">{quote}</p>
                <p className="mt-3 text-xs font-semibold text-white/70">NEAT investor</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function ImpactFlowers() {
  return (
    <div className="absolute inset-0 flex items-end justify-center">
      <div className="stem" />
      <div className="flower flower-a">Ethical</div>
      <div className="flower flower-b">Impact</div>
      <div className="flower flower-c">Growth</div>
      <div className="flower flower-d">Clear</div>
      <div className="pot" />
    </div>
  );
}



