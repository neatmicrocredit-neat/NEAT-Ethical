"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { MenuDrawer } from "./public-sidebar";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import {motion} from 'motion/react';
import { Button } from "./ui/button";


export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();
  const parentVariants = {
    hover: {}, // parent doesn’t need to animate, but passes down the state
  };

  const arrowVariants = {
    initial: { x: 0 },
    hover: { x: 5 }, // move arrow to the right
  };


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
          <span className="grid place-items-center rounded-full bg-[white] text-white shadow-[0_12px_28px_rgb(44_22_182_/_0.22)]">
            <Image loading="lazy" src="/img/ethical-logo-nobg.png" alt="NEAT Ethical Logo" width={55} height={55} />
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
          {!isMobile &&
            <motion.button whileHover="hover" initial="initial" variants={parentVariants}>
              <Link
              href="/investment-request"
              className="rounded-full flex bg-[var(--brand)] px-4 py-2 text-sm font-black text-white shadow-[0_14px_32px_rgb(44_22_182_/_0.26)] transition hover:-translate-y-0.5"
            >
              Start investing <motion.span variants={arrowVariants}><ArrowRight /></motion.span>
            </Link></motion.button>
          }
          <MenuDrawer />
        </div>
      </div>
    </header>
  );
}
