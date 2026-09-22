import Link from "next/link";
import Image from "next/image";

const footerGroups = {
  Company: [["About", "/about"], ["Contact", "/contact"], ["Get started", "/investment-request"]],
  Product: [["Dashboard", "/portal"], ["Login", "/auth/customer-login"], ["Calculator", "/returns-calculator"]],
  Legal: [["Privacy Policy", "/privacy-policy"], ["Terms of Use", "/terms-of-service"]],
};

export default function PublicFooter() {
  return <footer className="border-t border-[color:var(--line)] bg-white px-5 py-12 sm:px-8"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.4fr]"><div><Link href="/" className="flex font-black text-[var(--brand)]"><Image src="/img/ethical-logo-nobg.png" width={250} height={150} alt="Ethical Logo" /></Link><p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-[var(--muted-ink)]">Ethical investment planning, clearer returns, and transparent impact reporting.</p><p className="mt-6 text-xs font-semibold text-[var(--muted-ink)]">(c) 2026 NEAT Ethical Investments</p></div><div className="grid gap-8 text-sm sm:grid-cols-3">{Object.entries(footerGroups).map(([group, links]) => <div key={group}><p className="font-black text-[var(--ink)]">{group}</p><div className="mt-4 space-y-3 font-semibold text-[var(--muted-ink)]">{links.map(([label, href]) => <Link key={href} href={href} className="block transition hover:text-[var(--brand)]">{label}</Link>)}</div></div>)}</div></div></footer>;
}
