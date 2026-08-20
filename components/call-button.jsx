"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Phone, PhoneOff } from "lucide-react";

// TEMPORARY: Vapi voice-call CTA. To remove, delete this file and its usages
// in app/layout.js, app/page.js and app/contact/page.js.

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

function useVapiCall() {
  const vapiRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | connecting | active

  useEffect(() => {
    let cancelled = false;
    import("@vapi-ai/web").then(({ default: Vapi }) => {
      if (cancelled) return;
      const vapi = new Vapi(PUBLIC_KEY);
      vapi.on("call-start", () => setStatus("active"));
      vapi.on("call-end", () => setStatus("idle"));
      vapi.on("error", () => setStatus("idle"));
      vapiRef.current = vapi;
    });
    return () => {
      cancelled = true;
      vapiRef.current?.stop();
    };
  }, []);

  const toggle = () => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    if (status === "idle") {
      setStatus("connecting");
      vapi.start(ASSISTANT_ID);
    } else {
      vapi.stop();
    }
  };

  return { status, toggle };
}

export default function CallButton({ variant = "solid", className = "" }) {
  const { status, toggle } = useVapiCall();

  const styles =
    status === "active"
      ? "bg-red-600 text-white shadow-[0_18px_44px_rgb(220_38_38_/_0.32)]"
      : variant === "solid"
        ? "bg-[var(--brand-2)] text-white shadow-[0_18px_44px_color-mix(in_oklab,var(--brand-2)_32%,transparent)]"
        : "border border-[color:var(--line)] bg-white text-[var(--ink)] hover:border-[color:var(--brand)]";

  return (
    <button
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

export function CallFAB() {
  const pathname = usePathname();
  const { status, toggle } = useVapiCall();

  // Hide on dashboard pages, same as the WhatsApp FAB
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <button
      onClick={toggle}
      className={`landing-theme fixed bottom-24 right-6 z-40 flex items-center justify-center rounded-full p-4 text-white shadow-lg transition hover:scale-110 hover:shadow-xl ${
        status === "active" ? "bg-red-600" : "bg-[var(--brand)]"
      }`}
      aria-label={status === "active" ? "End voice call" : "Talk to NEAT"}
    >
      {status === "idle" && (
        <span className="absolute inset-0 animate-ping rounded-full bg-[var(--brand)] opacity-30" />
      )}
      {status === "connecting" ? (
        <Loader2 className="relative size-6 animate-spin" />
      ) : status === "active" ? (
        <PhoneOff className="relative size-6" />
      ) : (
        <Phone className="relative size-6" />
      )}
    </button>
  );
}
