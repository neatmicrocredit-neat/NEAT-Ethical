import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  ClipboardList,
  Clock,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import PublicShell from "@/components/public-shell";
import CallButton from "@/components/call-button";
import { Reveal, RevealGroup } from "@/components/reveal";

const WHATSAPP_LINK = "https://wa.me/+23409096852944?text=Hello%20NEAT%20Ethical%20Investments";
const EMAIL = "hello@neatethical.com";

const channels = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+234 909 685 2944",
    detail: "Quickest for short questions.",
    href: WHATSAPP_LINK,
    external: true,
    accent: true,
  },
  {
    icon: Mail,
    label: "Email",
    value: EMAIL,
    detail: "Best for documents and anything about an existing placement.",
    href: `mailto:${EMAIL}`,
  },
  {
    icon: Phone,
    label: "Voice assistant",
    value: "Talk to NEAT in your browser",
    detail: "Ask about the routes and how placements work, any time.",
  },
];

const routes = [
  {
    icon: ClipboardList,
    title: "You are ready to invest",
    text: "Place your investment in four steps. The team confirms your details and documentation with you before it is funded.",
    href: "/investment-request",
    cta: "Make an investment",
  },
  {
    icon: Calculator,
    title: "You are still comparing",
    text: "Model both routes against your own capital and term first, then bring the numbers to the conversation.",
    href: "/returns-calculator",
    cta: "Open the calculator",
  },
  {
    icon: FileText,
    title: "You have a general question",
    text: "Minimums, terms, payouts, risk, and what documents are needed are all covered in the FAQ.",
    href: "/#faq",
    cta: "Read the FAQ",
  },
];

export default function ContactPage() {
  return (
    <PublicShell
      compact
      eyebrow="Contact"
      title="Let us help you make the next move clearly."
      description="Reach out for product questions, onboarding support, or anything about a placement already in progress."
    >
      <RevealGroup className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start" amount={0.1}>
        <Reveal as="section" className="landing-panel no-rise p-7 sm:p-10">
          <MessageCircle className="size-12 rounded-full bg-[var(--brand-2)] p-2.5 text-[var(--ink)]" aria-hidden="true" />
          <h2 className="mt-8 text-3xl leading-none sm:text-4xl">Talk to the NEAT team.</h2>
          <p className="mt-5 text-sm font-semibold leading-6 text-[var(--muted-ink)]">
            Whether you are exploring ethical investing for the first time or already have capital placed, we can help you map the next step.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/investment-request"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1"
            >
              Make an investment
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
            <CallButton />
          </div>

          <div className="mt-8 space-y-3 border-t border-dashed border-[color:var(--line)] pt-6">
            <p className="flex items-start gap-3 text-sm font-bold text-[var(--ink)]">
              <Clock className="mt-0.5 size-4 shrink-0 text-[var(--brand)]" aria-hidden="true" />
              Messages sent on a working day are picked up the same day wherever possible.
            </p>
            <p className="flex items-start gap-3 text-sm font-semibold leading-6 text-[var(--muted-ink)]">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--brand)]" aria-hidden="true" />
              Remote-first, serving investors across Nigeria and beyond.
            </p>
          </div>
        </Reveal>

        <Reveal as="section" className="min-w-0 rounded-lg bg-white p-7 shadow-[0_20px_60px_rgb(33_21_95_/_0.08)] ring-1 ring-[color:var(--line)] sm:p-10">
          <h2 className="text-lg font-black text-[var(--ink)]">Ways to reach us</h2>

          <div className="mt-5 grid gap-4">
            {channels.map(({ icon: Icon, label, value, detail, href, external, accent }) => {
              const body = (
                <>
                  <Icon
                    className={`size-10 shrink-0 rounded-full bg-white p-2 ${accent ? "text-[#25D366]" : "text-[var(--brand)]"}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-[var(--ink)]">{label}</span>
                    <span className="mt-1 block break-words text-sm font-semibold leading-6 text-[var(--muted-ink)]">
                      {value}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-[var(--muted-ink)]">{detail}</span>
                  </span>
                </>
              );

              if (!href) {
                return (
                  <div key={label} className="rounded-lg bg-[var(--soft)] p-5">
                    <div className="flex gap-4">{body}</div>
                    <div className="mt-4 pl-14">
                      <CallButton variant="outline" className="!px-4 !py-2 !text-xs" />
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex gap-4 rounded-lg bg-[var(--soft)] p-5 transition hover:bg-[color-mix(in_oklab,var(--brand)_8%,white)]"
                >
                  {body}
                </Link>
              );
            })}
          </div>
        </Reveal>
      </RevealGroup>

      {/* ------------------------------------------------------- routing guide */}
      <RevealGroup className="mt-6" amount={0.1}>
        <Reveal as="h2" className="text-2xl font-black text-[var(--ink)] sm:text-3xl">
          Where to start, depending on where you are
        </Reveal>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {routes.map(({ icon: Icon, title, text, href, cta }) => (
            <Reveal as="article" key={title} className="landing-card no-rise group flex flex-col p-6">
              <Icon className="size-11 rounded-full bg-[var(--soft)] p-2.5 text-[var(--brand)]" aria-hidden="true" />
              <h3 className="mt-6 text-xl leading-tight">{title}</h3>
              <p className="mt-3 flex-1 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{text}</p>
              <Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[var(--brand)]">
                {cta}
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </div>
      </RevealGroup>
    </PublicShell>
  );
}
