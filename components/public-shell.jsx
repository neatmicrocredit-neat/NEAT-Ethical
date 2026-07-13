import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import PublicHeader from "@/components/public-header";

const footerGroups = [
  { title: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["Get started", "/investment-request"]] },
  { title: "Product", links: [["Calculator", "/returns-calculator"], ["Dashboard", "/dashboard"], ["Login", "/auth/login"]] },
  { title: "Legal", links: [["Privacy", "/privacy-policy"], ["Terms", "/terms-of-service"]] },
];

export default function PublicShell({ eyebrow = "NEAT Ethical", title, description, children, cta = true }) {
  return (
    <div className="landing-theme min-h-screen overflow-hidden bg-[var(--page)] text-[var(--ink)]">
      <main>
        <section className="relative flex min-h-screen items-center border-b border-[color:var(--line)] px-5 pb-16 pt-28 sm:px-8">
          <PublicHeader />
          <div className="absolute inset-0 landing-grid opacity-70" />
          <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase text-[var(--brand)]">{eyebrow}</p>
              <h1 className="mt-4 max-w-3xl text-balance text-5xl leading-[0.98] sm:text-7xl">{title}</h1>
            </div>
            {description ? (
              <p className="max-w-2xl text-pretty text-lg font-semibold leading-8 text-[var(--muted-ink)] lg:justify-self-end">
                {description}
              </p>
            ) : null}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">{children}</div>
      </main>

      {cta ? (
        <section className="bg-[var(--brand)] px-5 py-16 text-white sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-white/70">Ready when you are</p>
              <h2 className="mt-2 text-4xl leading-none sm:text-5xl">Your future will not wait.</h2>
            </div>
            <Link href="/investment-request" className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--brand-2)] px-6 py-3 text-sm font-black text-[var(--ink)] transition hover:-translate-y-1">
              Start growing today <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      ) : null}

      <footer className="border-t border-[color:var(--line)] bg-white px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 text-sm font-black text-[var(--brand)]">
              <span className="grid size-7 place-items-center rounded-full bg-[var(--brand)] text-white"><Leaf className="size-4" /></span>
              NEAT Ethical Investments
            </Link>
            <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-[var(--muted-ink)]">
              Ethical investment planning, clearer returns, and transparent impact reporting.
            </p>
            <p className="mt-6 text-xs font-semibold text-[var(--muted-ink)]">(c) 2026 NEAT Ethical Investments</p>
          </div>
          <div className="grid gap-8 text-sm sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className="font-black text-[var(--ink)]">{group.title}</p>
                <div className="mt-4 space-y-3 font-semibold text-[var(--muted-ink)]">
                  {group.links.map(([label, href]) => (
                    <Link key={href} href={href} className="block transition hover:text-[var(--brand)]">{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
