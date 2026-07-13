import Link from "next/link";
import { Leaf } from "lucide-react";
import Image from "next/image";


const footerGroups = {
  "Company": [["About", "/about"], ["Contact", "/contact"], ["Get started", "/investment-request"]],
  "Product" : [["Calculator", "/returns-calculator"], ["Dashboard", "/dashboard"], ["Login", "/auth/login"]],
  "Legal": [["Privacy", "/privacy-policy"], ["Terms", "/terms-of-service"]],
}


export default function PublicFooter(){

    return(
        
    <footer className="border-t border-[color:var(--line)] bg-white px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
            <Link href="/" className="flex font-black text-[var(--brand)]">
                <div className="">
                    <Image src="/img/ethical-logo-nobg.png" width={250} height={150} className="" alt="Ethical Logo" />
                </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-[var(--muted-ink)]">
                Ethical investment planning, clearer returns, and transparent impact reporting.
            </p>
            <p className="mt-6 text-xs font-semibold text-[var(--muted-ink)]">(c) 2026 NEAT Ethical Investments</p>
            </div>

            <div className="grid gap-8 text-sm sm:grid-cols-3">
            <div>
                <p className="font-black text-[var(--ink)]">Company</p>
                <div className="mt-4 space-y-3 font-semibold text-[var(--muted-ink)]">
                {footerGroups['Company'].map(([label, href]) => (
                    <Link key={href} href={href} className="block transition hover:text-[var(--brand)]">{label}</Link>
                ))}
                </div>
            </div>

            <div>
                <p className="font-black text-[var(--ink)]">Product</p>
                <div className="mt-4 space-y-3 font-semibold text-[var(--muted-ink)]">
                {footerGroups['Product'].map(([label, href]) => (
                    <Link key={href} href={href} className="block transition hover:text-[var(--brand)]">{label}</Link>
                ))}
                </div>
            </div>
            
            <div>
                <p className="font-black text-[var(--ink)]">Legal</p>
                <div className="mt-4 space-y-3 font-semibold text-[var(--muted-ink)]">
                {footerGroups['Legal'].map(([label, href]) => (
                    <Link key={href} href={href} className="block transition hover:text-[var(--brand)]">{label}</Link>
                ))}
                </div>
            </div>
            </div>
        </div>
    </footer>

    )
}