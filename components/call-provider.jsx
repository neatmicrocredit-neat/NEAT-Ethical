"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// TEMPORARY: Vapi voice-call CTA. To remove, delete this file, components/call-button.jsx
// and their usages in app/layout.js, app/page.js and app/contact/page.js.

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

const CallContext = createContext(null);

/**
 * Owns the single Vapi instance for the whole app.
 *
 * Every call affordance — the hero button, the contact page button, the FAB and
 * the in-call widget — reads its state from here, so they can never disagree
 * about whether a call is running.
 */
export function CallProvider({ children }) {
  const vapiRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | connecting | active
  const [muted, setMuted] = useState(false);
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [startedAt, setStartedAt] = useState(null);

  const isConfigured = Boolean(PUBLIC_KEY && ASSISTANT_ID);

  useEffect(() => {
    if (!isConfigured) return undefined;

    let cancelled = false;

    import("@vapi-ai/web")
      .then(({ default: Vapi }) => {
        if (cancelled) return;

        const vapi = new Vapi(PUBLIC_KEY);

        vapi.on("call-start", () => {
          setStatus("active");
          setStartedAt(Date.now());
          setMuted(false);
        });
        vapi.on("call-end", () => {
          setStatus("idle");
          setStartedAt(null);
          setAssistantSpeaking(false);
        });
        vapi.on("error", () => {
          setStatus("idle");
          setStartedAt(null);
          setAssistantSpeaking(false);
        });
        vapi.on("speech-start", () => setAssistantSpeaking(true));
        vapi.on("speech-end", () => setAssistantSpeaking(false));

        vapiRef.current = vapi;
      })
      .catch(() => {
        // SDK failed to load; the call affordances stay inert rather than breaking the page.
      });

    return () => {
      cancelled = true;
      vapiRef.current?.stop();
      vapiRef.current = null;
    };
  }, [isConfigured]);

  const start = useCallback(() => {
    const vapi = vapiRef.current;
    if (!vapi || status !== "idle") return;

    setStatus("connecting");
    // start() rejects on a denied mic or a failed connection — without this the
    // UI would sit on "Connecting…" forever.
    Promise.resolve(vapi.start(ASSISTANT_ID)).catch(() => {
      setStatus("idle");
      setStartedAt(null);
    });
  }, [status]);

  const stop = useCallback(() => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    Promise.resolve(vapi.stop()).catch(() => {});
    setStatus("idle");
    setStartedAt(null);
    setAssistantSpeaking(false);
  }, []);

  const toggle = useCallback(() => {
    if (status === "idle") start();
    else stop();
  }, [status, start, stop]);

  const toggleMute = useCallback(() => {
    const vapi = vapiRef.current;
    if (!vapi || typeof vapi.setMuted !== "function") return;

    setMuted((previous) => {
      const next = !previous;
      vapi.setMuted(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ status, muted, assistantSpeaking, startedAt, isConfigured, start, stop, toggle, toggleMute }),
    [status, muted, assistantSpeaking, startedAt, isConfigured, start, stop, toggle, toggleMute],
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  const context = useContext(CallContext);

  if (!context) {
    throw new Error("useCall must be used inside <CallProvider>. Check app/layout.js.");
  }

  return context;
}

/** Live mm:ss for a call that started at `startedAt` (null when no call is running). */
export function useCallDuration(startedAt) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return undefined;
    }

    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}
