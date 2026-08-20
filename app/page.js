'use client'
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import Link from "next/link";
import { ArrowRight, Landmark, Sparkles, TrendingUp } from "lucide-react";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import { useIsMobile } from "@/hooks/use-mobile";
import CallButton from '@/components/call-button';
import TrustSection from '@/components/trust-section';
import GrowthPathsSection from '@/components/growth-paths-section';
import TestimonialsSection from '@/components/testimonials-section';
import FaqSection from '@/components/faq-section';
import CountUp from '@/components/count-up';
import { Reveal, RevealGroup } from '@/components/reveal';
import HeroArt from '@/components/hero-art';


const cards = [
  { title: "Sukuk notes", amount: 18.4, decimals: 1, suffix: "%", label: "Projected yearly return" },
  { title: "Green agriculture", amount: 4.36, decimals: 2, prefix: "₦", suffix: "m", label: "Capital deployed" },
  { title: "Clean logistics", amount: 97, decimals: 0, suffix: "%", label: "Impact score" },
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
  const reduceMotion = useReducedMotion();
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const readingProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const backdropY = useTransform(heroProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(heroProgress, [0, 1], [0, -60]);
  const contentOpacity = useTransform(heroProgress, [0, 0.75], [1, 0]);

  return (
    <main className="landing-theme min-h-screen overflow-hidden bg-[var(--page)] text-[var(--ink)]">
      <motion.div
        aria-hidden="true"
        style={{ scaleX: readingProgress }}
        className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-[var(--brand)]"
      />

      <section ref={heroRef} className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pb-16 pt-28 sm:px-8">
        <motion.div
          aria-hidden="true"
          style={{
            backgroundImage: "url('/img/hero-money-nobg.png')",
            backgroundSize: "cover",
            backgroundPosition: isMobile ? "left" : "center",
            ...(reduceMotion ? {} : { y: backdropY }),
          }}
          className="pointer-events-none absolute inset-x-0 -inset-y-24 z-0"
        />
        {/* Scrim: keeps the headline readable over the photograph. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--page)_92%,transparent)_0%,color-mix(in_oklab,var(--page)_72%,transparent)_38%,color-mix(in_oklab,var(--page)_38%,transparent)_70%)]"
        />

        <PublicHeader />
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 landing-grid opacity-10" />
        </div>

        <HeroArt />

        <motion.div
          style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
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
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-2xl text-pretty text-lg font-medium leading-8 text-[var(--ink)]">
            Invest in Ethical Investment at 24% p.a. or Ethical Funding at 60% p.a., then track your placement, projected profit, and next steps with clarity.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Link href="/investment-request" className="group inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_44px_color-mix(in_oklab,var(--brand)_32%,transparent)] transition hover:-translate-y-1">
              Start building wealth
              <ArrowRight className="size-4 transition group-hover:translate-x-2" />
            </Link>
            <Link href="/returns-calculator" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-1 hover:border-[color:var(--brand)]">
              <TrendingUp className="size-4 text-[var(--brand)]" />
              Model returns
            </Link>
            <CallButton />
          </motion.div>
        </motion.div>

        <ScrollCue reduceMotion={reduceMotion} />
      </section>

      <section className="bg-white px-5 py-20 sm:px-8">
        <RevealGroup className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <Reveal as="p" className="text-sm font-black uppercase text-[var(--brand)]">The investment</Reveal>
            <Reveal as="h2" className="mt-3 text-4xl leading-none sm:text-5xl">Two NEAT routes, one clear way to invest.</Reveal>
            <Reveal as="p" className="mt-6 max-w-xl text-sm font-semibold leading-7 text-[var(--muted-ink)]">
              NEAT gives investors a plain-language way to compare return profiles before the team confirms documentation, dates, payout details, and risk notes.
            </Reveal>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {investmentVehicles.map((vehicle) => (
              <Reveal as="article" key={vehicle.name} className="landing-card no-rise p-6">
                <Landmark className="size-11 rounded-full bg-[var(--soft)] p-2.5 text-[var(--brand)]" />
                <h3 className="mt-8 text-3xl leading-tight">{vehicle.name}</h3>
                <p className="mt-4 text-5xl font-black text-[var(--brand)]">{vehicle.rate}</p>
                <p className="mt-4 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{vehicle.detail}</p>
              </Reveal>
            ))}
          </div>
        </RevealGroup>
      </section>

      <GrowthPathsSection />

      <TrustSection />

      <section className="bg-[var(--brand)] px-5 py-24 text-white sm:px-8">
        <RevealGroup className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <Reveal as="h2" className="text-4xl leading-none sm:text-6xl">Time really is money</Reveal>
            <Reveal as="p" className="max-w-xl text-sm font-semibold leading-7 text-white/78">
              The sooner your capital is thoughtfully placed, the more room it has to grow. Explore projected values in a dashboard made for clear decisions.
            </Reveal>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <Reveal
                key={card.title}
                className="rounded-lg bg-white/14 p-6 shadow-inner shadow-white/10 backdrop-blur transition hover:bg-white/20"
              >
                <p className="text-sm font-bold text-white/70">{card.title}</p>
                <p className="mt-10 text-3xl font-black">
                  <CountUp
                    value={card.amount}
                    decimals={card.decimals}
                    prefix={card.prefix}
                    suffix={card.suffix}
                  />
                </p>
                <p className="mt-2 text-xs font-semibold text-white/65">{card.label}</p>
              </Reveal>
            ))}
          </div>
        </RevealGroup>
      </section>

      <TestimonialsSection />

      <FaqSection />

      <PublicFooter />
    </main>
  );
}

function ScrollCue({ reduceMotion }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block"
    >
      <span className="grid h-11 w-7 place-items-start justify-center rounded-full border-2 border-[color:var(--brand)]/40 pt-2">
        <motion.span
          animate={reduceMotion ? undefined : { y: [0, 10, 0], opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="block size-1.5 rounded-full bg-[var(--brand)]"
        />
      </span>
    </motion.div>
  );
}
