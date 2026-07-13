"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import { MenuDrawer } from "./public-sidebar";

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 160);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
        scrolled
          ? "border-b border-[color:var(--line)] bg-white/78 shadow-[0_12px_40px_rgb(33_21_95_/_0.08)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-black text-[var(--brand)]">
          <span className="grid size-7 place-items-center rounded-full bg-[var(--brand)] text-white shadow-[0_12px_28px_rgb(44_22_182_/_0.22)]">
            <Leaf className="size-4" />
          </span>
          NEAT Ethical
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-bold text-[var(--muted-ink)] md:flex">
          <Link href="/about" className="transition hover:text-[var(--brand)]">
            About
          </Link>
          <Link href="/returns-calculator" className="transition hover:text-[var(--brand)]">
            Calculator
          </Link>
          <Link href="/contact" className="transition hover:text-[var(--brand)]">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {/* <Link href="/auth/login" className="hidden text-sm font-bold text-[var(--brand)] sm:inline-flex">
            Log in
          </Link> */}
          <Link
            href="/investment-request"
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-black text-white shadow-[0_14px_32px_rgb(44_22_182_/_0.26)] transition hover:-translate-y-0.5"
          >
            Start investing
          </Link>

          <MenuDrawer />
        </div>
      </div>
    </header>
  );
}
