import { Suspense } from "react";
import { CheckCircle2, ClipboardCheck, Landmark, UserRound, UsersRound } from "lucide-react";
import InvestmentRequestForm from "@/components/investment-request-form";
import PublicShell from "@/components/public-shell";


export default function InvestmentRequestPage() {
  return (
    <PublicShell
      eyebrow="Investment request"
      title="Request a Neat Ethical investment."
      description="Send the details needed to begin processing your placement. The team will follow up before any capital is committed."
    >
      <div className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]" style={{ alignItems: "flex-start" }}>
        <section className="rounded-lg bg-[var(--brand)] p-7 text-white shadow-[0_30px_80px_rgb(44_22_182_/_0.22)] sm:p-10 lg:sticky lg:top-6">
          <p className="text-sm font-black uppercase text-white/70">Investment request</p>
          <h2 className="mt-4 text-4xl leading-none sm:text-5xl">Two ways to place capital with NEAT.</h2>
          <p className="mt-6 max-w-xl text-sm font-semibold leading-7 text-white/75">
            Neat Ethical offers 2% monthly flat profit. Neat Funding offers 5% monthly flat profit by placing capital into SME lending pools through Neat Microfinance.
          </p>
          <div className="mt-8 grid gap-3">
            <div className="rounded-lg bg-white/14 p-5">
              <p className="text-sm font-black">Neat Ethical</p>
              <p className="mt-2 text-3xl font-black">24% p.a.</p>
              <p className="mt-1 text-xs font-bold text-white/68">2% monthly flat profit</p>
            </div>
            <div className="rounded-lg bg-white/14 p-5">
              <p className="text-sm font-black">Neat Funding</p>
              <p className="mt-2 text-3xl font-black">60% p.a.</p>
              <p className="mt-1 text-xs font-bold text-white/68">5% monthly flat profit with lending-pool risk</p>
            </div>
          </div>

          <p className="mt-6 flex items-center gap-3 rounded-lg bg-white/14 p-4 text-sm font-bold text-white">
            <CheckCircle2 className="size-5" /> This is a request form, not an automatic investment confirmation.
          </p>
        </section>

        <Suspense fallback={<div className="landing-panel min-h-96 p-8" />}>
          <InvestmentRequestForm />
        </Suspense>
      </div>
    </PublicShell>
  );
}
