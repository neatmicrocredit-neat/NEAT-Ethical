'use client'

import { motion } from "motion/react";
import { useAmbientAnimation } from "@/components/reveal";

/**
 * Animated investment vignettes that float around the hero headline.
 *
 * Decorative only: aria-hidden, pointer-events-none, and sized to sit in the
 * margins beside the centred copy. They appear from `lg` up, where there is
 * room for them without crowding the text.
 */
export default function HeroArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] hidden lg:block">
      <Floating className="left-[3%] top-[22%] w-[15rem] xl:left-[6%] xl:w-[17rem]" delay={0.2} distance={14}>
        <PortfolioCard />
      </Floating>

      <Floating className="right-[3%] top-[28%] w-[13rem] xl:right-[6%] xl:w-[15rem]" delay={0.5} distance={18} duration={7.5}>
        <CoinStack />
      </Floating>

      <Floating className="bottom-[16%] left-[10%] w-[11rem] xl:left-[13%]" delay={0.8} distance={12} duration={6.5}>
        <ProfitPill />
      </Floating>

      <Floating className="bottom-[20%] right-[9%] w-[9rem] xl:right-[12%]" delay={1} distance={16} duration={8}>
        <EthicalSeed />
      </Floating>
    </div>
  );
}

function Floating({ children, className = "", delay = 0, distance = 14, duration = 6.8 }) {
  const drift = useAmbientAnimation({ y: [0, -distance, 0] });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`absolute ${className}`}
    >
      <motion.div animate={drift} transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Glass card with a self-drawing balance curve and rising bars. */
function PortfolioCard() {
  const curve = "M14 76 C40 74 54 62 74 54 S116 44 140 22 168 10 186 6";

  return (
    <svg viewBox="0 0 200 132" className="w-full drop-shadow-[0_18px_40px_rgb(33_21_95_/_0.18)]">
      <defs>
        <linearGradient id="hero-card-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="200" height="132" rx="14" fill="rgba(255,255,255,0.92)" stroke="var(--line)" />

      <text x="14" y="22" fill="var(--muted-ink)" fontSize="9" fontWeight="800" letterSpacing="0.08em">
        PORTFOLIO VALUE
      </text>
      <text x="14" y="40" fill="var(--ink)" fontSize="17" fontWeight="900">
        ₦1,240,000
      </text>

      <g transform="translate(0, 26)">
        <path d={`${curve} L186 92 L14 92 Z`} fill="url(#hero-card-fill)" />
        <motion.path
          d={curve}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 0.6, ease: "easeInOut" }}
        />
        <motion.circle
          cx="186"
          cy="6"
          r="5"
          fill="var(--brand-2)"
          stroke="#ffffff"
          strokeWidth="2.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 2, ease: "backOut" }}
          style={{ originX: "186px", originY: "6px" }}
        />
      </g>

      <g>
        {[
          { x: 14, h: 10 },
          { x: 30, h: 16 },
          { x: 46, h: 22 },
        ].map((bar, index) => (
          <motion.rect
            key={bar.x}
            x={bar.x}
            width="9"
            rx="2.5"
            fill="color-mix(in oklab, var(--brand) 30%, white)"
            initial={{ height: 0, y: 120 }}
            animate={{ height: bar.h, y: 120 - bar.h }}
            transition={{ duration: 0.5, delay: 1.1 + index * 0.12, ease: "easeOut" }}
          />
        ))}
        <text x="70" y="120" fill="var(--brand)" fontSize="9" fontWeight="900">
          +2% monthly
        </text>
      </g>
    </svg>
  );
}

/** Naira coins stacking up, with one coin dropping onto the pile on a loop. */
function CoinStack() {
  const drop = useAmbientAnimation({ y: [-34, 0, 0, -34], opacity: [0, 1, 1, 0] });

  return (
    <svg viewBox="0 0 180 150" className="w-full drop-shadow-[0_18px_40px_rgb(33_21_95_/_0.18)]">
      <defs>
        <linearGradient id="hero-coin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand-2)" />
          <stop offset="100%" stopColor="var(--brand)" />
        </linearGradient>
      </defs>

      <motion.g
        animate={drop}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.75, 1] }}
      >
        <ellipse cx="90" cy="30" rx="30" ry="11" fill="url(#hero-coin)" />
        <text x="90" y="35" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900">
          ₦
        </text>
      </motion.g>

      {[0, 1, 2, 3].map((index) => {
        const cy = 128 - index * 17;
        return (
          <motion.g
            key={cy}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 + index * 0.14, ease: "easeOut" }}
          >
            <ellipse cx="90" cy={cy + 5} rx="42" ry="15" fill="color-mix(in oklab, var(--brand) 78%, black)" opacity="0.18" />
            <ellipse cx="90" cy={cy} rx="42" ry="15" fill="url(#hero-coin)" />
            <ellipse cx="90" cy={cy} rx="42" ry="15" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
          </motion.g>
        );
      })}

      <text x="90" y="73" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900">
        ₦
      </text>
    </svg>
  );
}

/** Small glass pill showing a payout landing. */
function ProfitPill() {
  return (
    <svg viewBox="0 0 160 56" className="w-full drop-shadow-[0_14px_30px_rgb(33_21_95_/_0.16)]">
      <rect x="0" y="0" width="160" height="56" rx="28" fill="rgba(255,255,255,0.94)" stroke="var(--line)" />
      <circle cx="30" cy="28" r="14" fill="color-mix(in oklab, var(--brand) 12%, white)" />
      <motion.path
        d="M24 28 l4.5 4.5 L37 23"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 1.4, ease: "easeOut" }}
      />
      <text x="54" y="25" fill="var(--ink)" fontSize="11" fontWeight="900">
        Payout sent
      </text>
      <text x="54" y="39" fill="var(--muted-ink)" fontSize="9.5" fontWeight="700">
        ₦20,000 · monthly
      </text>
    </svg>
  );
}

/** A coin sprouting a leaf — capital and ethics in one mark. */
function EthicalSeed() {
  const sway = useAmbientAnimation({ rotate: [-4, 4, -4] });

  return (
    <svg viewBox="0 0 120 130" className="w-full drop-shadow-[0_14px_34px_rgb(33_21_95_/_0.16)]">
      <motion.g animate={sway} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "60px", originY: "104px" }}>
        <path d="M60 104 V54" stroke="color-mix(in oklab, var(--brand) 55%, white)" strokeWidth="4" strokeLinecap="round" />
        <motion.path
          d="M60 66 C46 66 36 56 34 42 c16 -2 26 8 26 24 Z"
          fill="color-mix(in oklab, var(--brand) 42%, white)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2, ease: "backOut" }}
          style={{ originX: "60px", originY: "60px" }}
        />
        <motion.path
          d="M60 58 C74 58 84 48 86 34 c-16 -2 -26 8 -26 24 Z"
          fill="var(--brand)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.45, ease: "backOut" }}
          style={{ originX: "60px", originY: "52px" }}
        />
      </motion.g>

      <ellipse cx="60" cy="110" rx="34" ry="13" fill="var(--brand-2)" />
      <ellipse cx="60" cy="110" rx="34" ry="13" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <text x="60" y="115" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900">
        ₦
      </text>
    </svg>
  );
}
