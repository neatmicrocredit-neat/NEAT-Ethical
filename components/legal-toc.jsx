"use client";

import { useEffect, useRef, useState } from "react";
import { ListTree } from "lucide-react";

/**
 * The contents rail for a legal document.
 *
 * Sticky on desktop so it follows the reader down a long document, and a
 * collapsed disclosure on mobile where a 16-item list ahead of the text would
 * just be something to scroll past.
 *
 * The active section is tracked with an IntersectionObserver rather than a
 * scroll handler: the observer only fires when a boundary is crossed, so there
 * is no per-frame work on a page people scroll a long way down.
 */
export function LegalToc({ sections, lastUpdated, related }) {
  const active = useActiveSection(sections);

  return (
    <>
      {/* Mobile: out of the way until asked for. */}
      <details className="rounded-lg bg-white p-5 shadow-[0_20px_60px_rgb(33_21_95_/_0.08)] ring-1 ring-[var(--line)] lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-black text-[var(--ink)]">
          <ListTree className="size-4 text-[var(--brand)]" />
          Jump to a section
          <span className="ml-auto text-xs font-bold text-[var(--muted-ink)]">{sections.length}</span>
        </summary>
        <List sections={sections} active={active} className="mt-4" />
        <p className="mt-4 border-t border-[var(--line)] pt-3 text-xs font-bold text-[var(--muted-ink)]">
          Last updated {lastUpdated}
        </p>
      </details>

      {/* Desktop: pinned alongside the text. */}
      <div className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
        <div className="rounded-lg bg-white p-6 shadow-[0_20px_60px_rgb(33_21_95_/_0.08)] ring-1 ring-[var(--line)]">
          <p className="text-xs font-black uppercase tracking-wide text-[var(--brand)]">Last updated</p>
          <p className="mt-1 text-sm font-bold text-[var(--ink)]">{lastUpdated}</p>

          <nav aria-label="Document contents" className="mt-6 border-t border-[var(--line)] pt-5">
            <p className="text-xs font-black uppercase tracking-wide text-[var(--muted-ink)]">Contents</p>
            {/* Cap the height so a long document's rail can never outgrow the
                viewport and strand the last few entries off-screen. */}
            <List
              sections={sections}
              active={active}
              className="dash-scroll mt-3 max-h-[calc(100vh-19rem)] overflow-y-auto pr-1"
            />
          </nav>

          {related ? (
            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <a href={related.href} className="text-sm font-black text-[var(--brand)] hover:underline">
                {related.label} →
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

function List({ sections, active, className = "" }) {
  return (
    <ol className={className}>
      {sections.map((section, index) => {
        const current = active === section.id;
        return (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={current ? "true" : undefined}
              className={`flex gap-2.5 border-l-2 py-1.5 pl-3 text-sm font-semibold leading-6 transition ${
                current
                  ? "border-[var(--brand)] text-[var(--brand)]"
                  : "border-transparent text-[var(--muted-ink)] hover:border-[var(--line)] hover:text-[var(--ink)]"
              }`}
            >
              <span className={`tabular-nums ${current ? "text-[var(--brand)]" : "text-[color:var(--line)]"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{section.title}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Which section the reader is currently in.
 *
 * The observer's band is the top of the viewport: a section becomes active once
 * its heading passes under the fixed header, and stays active until the next one
 * does. Entries are re-sorted by document position on every callback because the
 * observer reports them in whatever order they happened to cross.
 */
function useActiveSection(sections) {
  const [active, setActive] = useState(sections[0]?.id ?? null);
  const visible = useRef(new Set());

  // The array arrives as a fresh prop on every render, so key the effect on the
  // ids instead — otherwise each active change would tear the observer down and
  // rebuild it, losing the set of visible sections in the process.
  const key = sections.map((section) => section.id).join("|");

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    if (!nodes.length || typeof IntersectionObserver === "undefined") return undefined;

    const order = new Map(sections.map((section, index) => [section.id, index]));
    const seen = visible.current;
    seen.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target.id);
          else seen.delete(entry.target.id);
        }

        if (seen.size) {
          // Topmost of whatever is currently in the band.
          const next = [...seen].sort((a, b) => order.get(a) - order.get(b))[0];
          setActive(next);
          return;
        }

        // Nothing in the band — between two headings. Keep the last section
        // whose top has already scrolled past, so the rail never blanks out.
        const passed = nodes.filter((node) => node.getBoundingClientRect().top < 160);
        if (passed.length) setActive(passed[passed.length - 1].id);
      },
      { rootMargin: "-140px 0px -70% 0px", threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
