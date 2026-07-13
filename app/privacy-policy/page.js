import { Database, LockKeyhole, ShieldCheck } from "lucide-react";
import PublicShell from "@/components/public-shell";

const sections = [
  { icon: Database, title: "What we collect", text: "We collect the account, onboarding, and support information needed to provide investment planning and platform access." },
  { icon: LockKeyhole, title: "How it is protected", text: "Information is handled with access controls and used only for the services you request from NEAT." },
  { icon: ShieldCheck, title: "Your choices", text: "You can contact us to review, update, or ask questions about information associated with your account." },
];

export default function PrivacyPolicyPage() {
  return (
    <PublicShell
      eyebrow="Privacy"
      title="Privacy that supports trust."
      description="A clear starter policy for how NEAT handles data while delivering account access, planning, and customer support."
      cta={false}
    >
      <article className="rounded-lg bg-white p-7 shadow-[0_20px_60px_rgb(33_21_95_/_0.08)] ring-1 ring-[var(--line)] sm:p-10">
        <div className="grid gap-5 md:grid-cols-3">
          {sections.map(({ icon: Icon, title, text }) => (
            <section key={title} className="rounded-lg bg-[var(--soft)] p-5">
              <Icon className="size-10 rounded-full bg-white p-2 text-[var(--brand)]" />
              <h2 className="mt-6 text-2xl leading-tight">{title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{text}</p>
            </section>
          ))}
        </div>
        <p className="mt-8 text-sm font-semibold leading-7 text-[var(--muted-ink)]">
          This page is a starter draft and should be reviewed by legal counsel before launch. Replace it with your finalized privacy policy when available.
        </p>
      </article>
    </PublicShell>
  );
}

