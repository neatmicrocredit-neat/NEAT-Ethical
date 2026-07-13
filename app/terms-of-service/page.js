import { FileCheck2, Scale, ShieldAlert } from "lucide-react";
import PublicShell from "@/components/public-shell";

const terms = [
  { icon: FileCheck2, title: "Use responsibly", text: "By using NEAT, you agree to provide accurate information and use the platform in line with applicable laws." },
  { icon: Scale, title: "Understand risk", text: "Investment information should be reviewed carefully. Projections are illustrative and not guaranteed outcomes." },
  { icon: ShieldAlert, title: "Protect access", text: "You are responsible for keeping account credentials secure and notifying us of suspicious activity." },
];

export default function TermsOfServicePage() {
  return (
    <PublicShell
      eyebrow="Terms"
      title="The rules for using NEAT clearly."
      description="A concise starter terms page for the responsibilities, expectations, and limits that govern platform use."
      cta={false}
    >
      <article className="rounded-lg bg-white p-7 shadow-[0_20px_60px_rgb(33_21_95_/_0.08)] ring-1 ring-[var(--line)] sm:p-10">
        <div className="grid gap-5 md:grid-cols-3">
          {terms.map(({ icon: Icon, title, text }) => (
            <section key={title} className="rounded-lg bg-[var(--soft)] p-5">
              <Icon className="size-10 rounded-full bg-white p-2 text-[var(--brand)]" />
              <h2 className="mt-6 text-2xl leading-tight">{title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{text}</p>
            </section>
          ))}
        </div>
        <p className="mt-8 text-sm font-semibold leading-7 text-[var(--muted-ink)]">
          These terms are a starter draft and should be reviewed by legal counsel before launch. Replace them with your finalized terms when available.
        </p>
      </article>
    </PublicShell>
  );
}

