import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";

import PublicShell from "@/components/public-shell";
import { LegalToc } from "@/components/legal-toc";
import { LAST_UPDATED } from "@/lib/legal";

const WHATSAPP_LINK = "https://wa.me/+23409096852944?text=Hello%20NEAT%20Ethical%20Investments";
const EMAIL = "hello@neatethical.com";

/**
 * Renders a legal document from the structured content in lib/legal.js.
 *
 * Legal pages are read in two ways and the layout serves both: skimmed for one
 * clause, via the numbered contents rail that stays in view on desktop; or read
 * straight through, which is why the measure is capped and the prose sits at a
 * larger size than the rest of the site. Section numbers and anchors are derived
 * from the array order, so a clause can be linked to directly and the numbering
 * can never drift from the content.
 */
export default function LegalDocument({ document, related }) {
  const { eyebrow, heading, summary, intro, sections } = document;

  return (
    <PublicShell eyebrow={eyebrow} title={heading} description={summary} cta={false} compact>
      {/* `items-start` matters: a stretched grid item is full-height, and a
          sticky element inside one has nowhere to travel. */}
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-14">
        <LegalToc
          // Only what the rail needs — the block content never crosses to the client.
          sections={sections.map((section) => ({ id: section.id, title: section.title }))}
          lastUpdated={LAST_UPDATED}
          related={related}
        />

        <article className="min-w-0">
          <div className="rounded-lg bg-white p-7 shadow-[0_20px_60px_rgb(33_21_95_/_0.08)] ring-1 ring-[var(--line)] sm:p-10">
            <div className="max-w-2xl space-y-5">
              {intro.map((block, index) => (
                <Block key={index} block={block} lead={index === 0} />
              ))}
            </div>

            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                // Anchor jumps land under the fixed header rather than behind it.
                className="mt-12 max-w-2xl scroll-mt-28 border-t border-[var(--line)] pt-10 first-of-type:mt-12"
              >
                <h2 className="flex gap-3 text-2xl leading-tight sm:text-3xl">
                  <span aria-hidden className="text-lg font-black tabular-nums text-[var(--brand)] sm:text-xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{section.title}</span>
                </h2>
                <div className="mt-5 space-y-5">
                  {section.blocks.map((block, blockIndex) => (
                    <Block key={blockIndex} block={block} />
                  ))}
                </div>
              </section>
            ))}

            <ContactCard />
          </div>

          <p className="mt-6 max-w-2xl text-sm font-semibold leading-7 text-[var(--muted-ink)]">
            Where a signed investment or funding agreement covers the same subject as this document, the terms of that
            agreement apply to the transaction it governs.
          </p>
        </article>
      </div>
    </PublicShell>
  );
}

function Block({ block, lead = false }) {
  if (block.items) {
    return (
      <ul className="space-y-2.5">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3 text-base font-semibold leading-7 text-[var(--muted-ink)]">
            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[var(--brand)]/40" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p
      className={
        lead
          ? "text-lg font-semibold leading-8 text-[var(--ink)]"
          : "text-base font-semibold leading-7 text-[var(--muted-ink)]"
      }
    >
      {block.text}
    </p>
  );
}

/** The "contact us through the channels on our website" clause, made actionable. */
function ContactCard() {
  return (
    <div className="mt-12 max-w-2xl rounded-lg bg-[var(--soft)] p-6 sm:p-7">
      <p className="text-sm font-black uppercase tracking-wide text-[var(--brand)]">NEAT Ethical Investments</p>
      <p className="mt-2 text-base font-semibold leading-7 text-[var(--muted-ink)]">
        Questions about this document, or a request relating to your information? Reach the team directly.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={`mailto:${EMAIL}`}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5"
        >
          <Mail className="size-4" />
          {EMAIL}
        </a>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[var(--ink)] ring-1 ring-[var(--line)] transition hover:-translate-y-0.5"
        >
          <MessageCircle className="size-4" />
          +234 909 685 2944
        </a>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black text-[var(--brand)] transition hover:underline"
        >
          All contact channels
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
