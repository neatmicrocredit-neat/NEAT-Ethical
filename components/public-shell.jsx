import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";


export default function PublicShell({ eyebrow = "NEAT Ethical", title, description, children, cta = true, compact = false }) {
  return (
    <div className="landing-theme min-h-screen overflow-hidden bg-[var(--page)] text-[var(--ink)]">
      <main>
        <section
          className={`relative flex items-center border-b border-[color:var(--line)] px-5 sm:px-8 ${
            compact ? "pb-12 pt-32 sm:pb-16 sm:pt-36" : "min-h-screen pb-16 pt-28"
          }`}
        >
          <PublicHeader />
          <div className="absolute inset-0 landing-grid opacity-70" />
          <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase text-[var(--brand)]">{eyebrow}</p>
              <h1 className={`mt-4 max-w-3xl text-balance leading-[0.98] ${compact ? "text-4xl sm:text-5xl lg:text-6xl" : "text-5xl sm:text-7xl"}`}>{title}</h1>
            </div>
            {description ? (
              <p className="max-w-2xl text-pretty text-lg font-semibold leading-8 text-[var(--muted-ink)] lg:justify-self-end">
                {description}
              </p>
            ) : null}
          </div>
        </section>

        <div className={`mx-auto max-w-7xl px-5 sm:px-8 ${compact ? "py-12 lg:py-16" : "py-16 lg:py-20"}`}>{children}</div>
      </main>

      {cta ? (
        <section className="bg-[var(--brand)] px-5 py-16 text-white sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-white/70">Ready when you are</p>
              <h2 className="mt-2 text-4xl leading-none sm:text-5xl">Your future will not wait.</h2>
            </div>
            <Link href="/investment-request" className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-black text-[var(--ink)] transition hover:-translate-y-1">
              Start growing today <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      ) : null}


      <PublicFooter />
    </div>
  );
}
