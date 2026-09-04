"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Loader2, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useState } from "react";
import { useCall, useCallDuration } from "@/components/call-provider";

// TEMPORARY: Vapi voice-call CTA. To remove, delete this file, components/call-provider.jsx
// and their usages in app/layout.js, app/page.js and app/contact/page.js.

export default function CallButton({ variant = "solid", className = "" }) {
  const { status, toggle } = useCall();

  const styles =
    status === "active"
      ? "bg-red-600 text-white shadow-[0_18px_44px_rgb(220_38_38_/_0.32)]"
      : variant === "solid"
        ? "bg-[var(--brand-2)] text-white shadow-[0_18px_44px_color-mix(in_oklab,var(--brand-2)_32%,transparent)]"
        : "border border-[color:var(--line)] bg-white text-[var(--ink)] hover:border-[color:var(--brand)]";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:-translate-y-1 ${styles} ${className}`}
    >
      {status === "connecting" ? (
        <Loader2 className="size-4 animate-spin" />
      ) : status === "active" ? (
        <PhoneOff className="size-4" />
      ) : (
        <Phone className="size-4" />
      )}
      {status === "connecting" ? "Connecting…" : status === "active" ? "End call" : "Talk to NEAT"}
    </button>
  );
}

/**
 * The floating call affordance: the FAB when no call is running, and the
 * in-call widget once one connects. Only ever one of the two is on screen.
 */
export function CallDock() {
  const pathname = usePathname();
  const { status } = useCall();
  const inCall = status === "active";

  // Hide on dashboard pages, same as the WhatsApp FAB
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {inCall ? <CallWidget key="widget" /> : <CallFAB key="fab" />}
    </AnimatePresence>
  );
}

function CallFAB() {
  const { status, toggle } = useCall();

  return (
    <motion.button
      type="button"
      onClick={toggle}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="landing-theme fixed bottom-24 right-6 z-40 flex items-center justify-center rounded-full bg-[var(--brand)] p-4 text-white shadow-lg transition hover:scale-110 hover:shadow-xl"
      aria-label="Talk to NEAT"
    >
      {status === "idle" && (
        <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-[var(--brand)] opacity-30" />
      )}
      {status === "connecting" ? (
        <Loader2 className="relative size-6 animate-spin" />
      ) : (
        <Phone className="relative size-6" />
      )}
    </motion.button>
  );
}

function CallWidget() {
  const { stop, muted, toggleMute, assistantSpeaking, startedAt } = useCall();
  const duration = useCallDuration(startedAt);
  const [hidden, setHidden] = useState(false);

  // Hidden collapses the widget to a small pill rather than removing it: a live
  // call with no visible control would be worse than a bit of screen furniture.
  if (hidden) {
    return (
      <motion.button
        type="button"
        onClick={() => setHidden(false)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="landing-theme fixed bottom-24 right-6 z-40 flex items-center gap-2 rounded-full bg-red-600 py-3 pl-4 pr-5 text-white shadow-lg transition hover:scale-105"
        aria-label={`Call in progress, ${duration}. Show call controls`}
      >
        <span aria-hidden="true" className="size-2.5 animate-pulse rounded-full bg-white" />
        <span className="text-sm font-black tabular-nums">{duration}</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      role="region"
      aria-label="Voice call in progress"
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="landing-theme fixed bottom-24 right-6 z-40 w-[17rem] max-w-[calc(100vw-3rem)] rounded-2xl border border-[color:var(--line)] bg-white p-4 shadow-[0_24px_60px_rgb(33_21_95_/_0.22)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-red-600 text-white">
            <Phone className="size-4" />
            <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-red-600 opacity-25" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-[var(--ink)]">Call in progress</span>
            <span className="block text-xs font-bold tabular-nums text-[var(--muted-ink)]">{duration}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setHidden(true)}
          className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-[var(--muted-ink)] transition hover:bg-[var(--soft)] hover:text-[var(--ink)]"
          aria-label="Hide call widget"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs font-bold text-[var(--muted-ink)]">
        <span
          aria-hidden="true"
          className={`size-2 rounded-full ${assistantSpeaking ? "animate-pulse bg-[var(--brand)]" : "bg-[color:var(--line)]"}`}
        />
        {assistantSpeaking ? "NEAT is speaking…" : "Listening"}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-xs font-black transition ${
            muted
              ? "bg-[var(--ink)] text-white"
              : "bg-[var(--soft)] text-[var(--ink)] hover:bg-[color-mix(in_oklab,var(--brand)_12%,white)]"
          }`}
        >
          {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          {muted ? "Unmute" : "Mute"}
        </button>

        <button
          type="button"
          onClick={stop}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 px-3 py-2.5 text-xs font-black text-white transition hover:bg-red-700"
        >
          <PhoneOff className="size-4" />
          End call
        </button>
      </div>
    </motion.div>
  );
}
