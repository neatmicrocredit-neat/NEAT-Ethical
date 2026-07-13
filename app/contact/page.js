import Link from "next/link";
import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import PublicShell from "@/components/public-shell";

const contacts = [
  { icon: Mail, label: "Email", value: "hello@neatethicalinvestments.com" },
  { icon: Phone, label: "Phone", value: "+234 000 000 0000" },
  { icon: MapPin, label: "Office", value: "Remote-first, serving investors globally" },
];

export default function ContactPage() {
  return (
    <PublicShell
      eyebrow="Contact"
      title="Let us help you make the next move clearly."
      description="Reach out for product questions, demo requests, onboarding support, or partnership conversations."
    >
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="landing-panel p-7 sm:p-10">
          <MessageCircle className="size-12 rounded-full bg-[var(--brand-2)] p-2.5 text-[var(--ink)]" />
          <h2 className="mt-8 text-4xl leading-none">Talk to the NEAT team.</h2>
          <p className="mt-5 text-sm font-semibold leading-6 text-[var(--muted-ink)]">
            Whether you are exploring ethical investing for the first time or modernizing an advisory workflow, we can help you map the next step.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/get-started" className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1">
              Get started <ArrowRight className="size-4" />
            </Link>
            <Link href="/calculator" className="rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-black text-[var(--ink)] transition hover:border-[var(--brand)]">
              View calculator
            </Link>
          </div>
        </section>

        <section className="rounded-lg bg-white p-7 shadow-[0_20px_60px_rgb(33_21_95_/_0.08)] ring-1 ring-[var(--line)] sm:p-10">
          <div className="grid gap-4">
            {contacts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-4 rounded-lg bg-[var(--soft)] p-5">
                <Icon className="size-10 shrink-0 rounded-full bg-white p-2 text-[var(--brand)]" />
                <div>
                  <p className="text-sm font-black text-[var(--ink)]">{label}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}

