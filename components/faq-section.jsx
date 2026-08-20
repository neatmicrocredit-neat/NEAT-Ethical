'use client'

import Link from "next/link";
import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, MessageCircleQuestion, Plus } from "lucide-react";
import { Reveal, RevealGroup } from "@/components/reveal";

const faqs = [
  {
    question: "What am I actually investing in?",
    answer:
      "Two routes. Neat Ethical places your capital into Neat products at a flat 2% monthly profit (24% p.a.). Neat Funding places it into Neat Microfinance SME lending pools at a flat 5% monthly profit (60% p.a.), which carries the added lending exposure. You choose the route when you place your investment.",
  },
  {
    question: "What is the minimum I can place?",
    answer:
      "Placements start at ₦100,000. Above that you can invest any amount, and the returns calculator will model the monthly profit, total profit, and maturity value before you commit.",
  },
  {
    question: "How long is my capital placed for?",
    answer:
      "Terms are commonly modelled from 3 to 24 months. You set your start and maturity dates when you invest, and the NEAT team confirms them in writing before anything is funded.",
  },
  {
    question: "How and when do I receive profit?",
    answer:
      "You choose either monthly payouts or a single payout at maturity, and you can ask for profit to roll over instead. Payouts go to the bank account you provide when you invest.",
  },
  {
    question: "What do I need to invest?",
    answer:
      "Placing an investment runs in four steps: your personal details, a passport photo plus ID documents and next-of-kin contact, your investment details (route, amount, dates, payout schedule, bank account), then a review screen before you submit.",
  },
  {
    question: "What happens after I submit my details?",
    answer:
      "The team reviews what you submitted and follows up with documentation, dates, and risk notes. Your placement is funded once those details are confirmed with you, so nothing moves on unconfirmed information.",
  },
  {
    question: "What are the risks?",
    answer:
      "Projections shown on this site are flat calculations, not guarantees. Neat Funding in particular carries SME lending and repayment risk, because the capital sits in lending pools. The specific risk notes for your placement are shared with you before you fund it.",
  },
  {
    question: "What makes it ethical?",
    answer:
      "Opportunities are screened before they reach you: interest-bearing, speculative, and harm-linked activity is filtered out, and what remains is reviewed for transparency, risk, and reporting quality.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const baseId = useId();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <section id="faq" className="scroll-mt-24 border-t border-[color:var(--line)] bg-white px-5 py-24 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <RevealGroup className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start" amount={0.1}>
        <div className="lg:sticky lg:top-28">
          <Reveal as="p" className="text-sm font-black uppercase tracking-wide text-[var(--brand)]">
            Questions, answered
          </Reveal>
          <Reveal as="h2" className="mt-3 text-4xl leading-none sm:text-5xl">
            Before you place capital
          </Reveal>
          <Reveal as="p" className="mt-6 max-w-md text-base font-semibold leading-7 text-[var(--muted-ink)]">
            The things investors ask us most often, answered plainly. Anything not covered here, the team will walk you through directly.
          </Reveal>

          <Reveal className="mt-8 rounded-lg bg-[color-mix(in_oklab,var(--brand)_6%,white)] p-6 ring-1 ring-[color:var(--line)]">
            <MessageCircleQuestion className="size-10 rounded-full bg-white p-2 text-[var(--brand)] ring-1 ring-[color:var(--line)]" />
            <p className="mt-4 text-lg font-black text-[var(--ink)]">Still unsure which route fits?</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--muted-ink)]">
              Talk it through before you send anything. No placement is processed from a conversation alone.
            </p>
            <Link
              href="/contact"
              className="group mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              Talk to the team
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-trigger-${index}`;

            return (
              <Reveal key={faq.question} distance={16}>
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-[var(--brand)]"
                  >
                    <span className="text-lg font-black leading-snug text-[var(--ink)] transition-colors hover:text-[var(--brand)]">
                      {faq.question}
                    </span>
                    <motion.span
                      aria-hidden="true"
                      animate={{ rotate: isOpen ? 135 : 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
                      className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ring-1 transition-colors ${
                        isOpen
                          ? "bg-[var(--brand)] text-white ring-[color:var(--brand)]"
                          : "bg-white text-[var(--brand)] ring-[color:var(--line)]"
                      }`}
                    >
                      <Plus className="size-4" />
                    </motion.span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="panel"
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.32, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 pr-10 text-sm font-semibold leading-7 text-[var(--muted-ink)]">
                        {faq.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </RevealGroup>
    </section>
  );
}
