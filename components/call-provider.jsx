"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// TEMPORARY: Vapi voice-call CTA. To remove, delete this file, components/call-button.jsx
// and their usages in app/layout.js, app/page.js and app/contact/page.js.

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

/** How long to wait for a call to connect before giving up and resetting. */
const CONNECT_TIMEOUT_MS = 25000;

const CallContext = createContext(null);

/**
 * Owns the single Vapi instance for the whole app.
 *
 * Every call affordance — the hero button, the contact page button, the FAB and
 * the in-call widget — reads its state from here, so they can never disagree
 * about whether a call is running.
 *
 * ## Why start and stop are queued
 *
 * Vapi's `stop()` clears its own re-entrancy guard *before* it awaits
 * `dailyCall.destroy()`:
 *
 *     async stop() {
 *       this.started = false;      // guard drops here
 *       if (this.call) {
 *         await this.call.destroy();   // ...but the room dies here
 *       }
 *     }
 *
 * So for the whole duration of `destroy()` the SDK will happily accept a fresh
 * `start()`, which joins a new Daily room while the previous one is still being
 * torn down. That is what produces the two errors this component used to cause:
 *
 *   - "Meeting ended due to ejection: Meeting has ended" — the old room ejects
 *     the participant just as the new call is establishing itself.
 *   - "Error unloading krisp processor: WASM_OR_WORKER_NOT_READY" — the noise
 *     filter's WASM module is asked to unload before it finished loading.
 *
 * The window is easy to hit from the UI: someone clicks the button, nothing
 * seems to happen, they click again. Every start and stop therefore runs on a
 * single promise chain (`jobRef`), so a start physically cannot begin until the
 * previous stop's `destroy()` has resolved.
 *
 * ## Why intent is a ref, not state
 *
 * `status` is React state and is stale inside the same tick, so two clicks in
 * quick succession both used to read "idle". `modeRef` mirrors it synchronously
 * and is what the guards actually read; `status` exists to render.
 */
export function CallProvider({ children }) {
  const vapiRef = useRef(null);
  const jobRef = useRef(null);
  const modeRef = useRef("idle");
  const timeoutRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | connecting | active
  const [muted, setMuted] = useState(false);
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [error, setError] = useState(null);

  const isConfigured = Boolean(PUBLIC_KEY && ASSISTANT_ID);

  if (jobRef.current === null) jobRef.current = Promise.resolve();

  const clearConnectTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /** Set intent and rendered status together so they can never disagree. */
  const apply = useCallback((mode) => {
    modeRef.current = mode;
    setStatus(mode);
  }, []);

  const reset = useCallback(
    (message = null) => {
      clearConnectTimeout();
      modeRef.current = "idle";
      setStatus("idle");
      setStartedAt(null);
      setAssistantSpeaking(false);
      setMuted(false);
      if (message) setError(message);
    },
    [clearConnectTimeout]
  );

  /**
   * Run `task` after every previously queued task has settled.
   * A rejected task must not poison the chain, so the stored promise is the
   * swallowed one while the caller still gets the real result.
   */
  const enqueue = useCallback((task) => {
    const run = jobRef.current.then(task, task);
    jobRef.current = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      // The buttons still render (they just cannot dial) so a missing key never
      // silently removes a CTA from the page.
      console.warn(
        "[call] NEXT_PUBLIC_VAPI_PUBLIC_KEY / NEXT_PUBLIC_VAPI_ASSISTANT_ID are not set — voice calls are disabled.",
      );
      return undefined;
    }

    let cancelled = false;
    let instance = null;

    import("@vapi-ai/web")
      .then(({ default: Vapi }) => {
        if (cancelled) return;

        const vapi = new Vapi(PUBLIC_KEY);
        instance = vapi;

        vapi.on("call-start", () => {
          clearConnectTimeout();
          modeRef.current = "active";
          setStatus("active");
          setStartedAt(Date.now());
          setMuted(vapi.isMuted?.() ?? false);
          setError(null);
        });

        vapi.on("call-end", () => {
          clearConnectTimeout();
          modeRef.current = "idle";
          setStatus("idle");
          setStartedAt(null);
          setAssistantSpeaking(false);
        });

        // The SDK reports why a connection attempt failed — far more useful than
        // the generic error event, and the only place the real stage shows up.
        vapi.on("call-start-failed", (event) => {
          console.error("[call] could not start:", event?.stage, event?.error);
          reset(describe(event?.error));
        });

        vapi.on("error", (raw) => {
          console.error("[call] error:", raw);
          // Ejection is what the old overlapping-call bug looked like from here.
          // It is fatal to the current call, so fall back to idle either way.
          reset(describe(raw));
        });

        vapi.on("speech-start", () => setAssistantSpeaking(true));
        vapi.on("speech-end", () => setAssistantSpeaking(false));

        vapiRef.current = vapi;
      })
      .catch((loadError) => {
        // SDK failed to load; the call affordances stay inert rather than breaking the page.
        console.error("[call] SDK failed to load:", loadError);
      });

    return () => {
      cancelled = true;
      clearConnectTimeout();
      const vapi = instance || vapiRef.current;
      vapiRef.current = null;
      modeRef.current = "idle";
      if (!vapi) return;
      // Drop listeners first: teardown emits call-end, and setting state on an
      // unmounted provider is pointless work at best.
      vapi.removeAllListeners?.();
      Promise.resolve(vapi.stop()).catch(() => {});
    };
  }, [isConfigured, clearConnectTimeout, reset]);

  const start = useCallback(() => {
    if (modeRef.current !== "idle") return;
    if (!isConfigured) {
      setError("Voice calling is not configured on this site yet.");
      return;
    }

    apply("connecting");
    setError(null);

    // Without this the UI can sit on "Connecting…" indefinitely when the SDK
    // neither resolves nor emits — which is what a blocked mic prompt or a
    // dropped websocket looks like from here.
    clearConnectTimeout();
    timeoutRef.current = setTimeout(() => {
      if (modeRef.current !== "connecting") return;
      console.error("[call] timed out after", CONNECT_TIMEOUT_MS, "ms");
      modeRef.current = "idle";
      enqueue(async () => {
        await Promise.resolve(vapiRef.current?.stop()).catch(() => {});
      });
      reset("That call took too long to connect. Please try again.");
    }, CONNECT_TIMEOUT_MS);

    enqueue(async () => {
      const vapi = vapiRef.current;
      if (!vapi) {
        reset("Voice calling is still loading. Give it a moment and try again.");
        return;
      }
      // The user may have cancelled while this task sat in the queue.
      // A cancel that lands *during* the await cannot abort it — its teardown
      // simply queues behind, so the call connects and is hung up a moment
      // later. That is deliberate: aborting a half-open connection is precisely
      // what produced the krisp and ejection errors this queue exists to avoid.
      if (modeRef.current !== "connecting") return;

      try {
        const call = await vapi.start(ASSISTANT_ID);
        // `null` means the SDK refused because it still considers a call live.
        // Clear it down rather than leaving the button stuck on "Connecting…".
        if (call === null && modeRef.current === "connecting") {
          await Promise.resolve(vapi.stop()).catch(() => {});
          reset("A previous call was still closing. Please try again.");
        }
      } catch (startError) {
        console.error("[call] start threw:", startError);
        // Leave nothing half-open behind a failed attempt.
        await Promise.resolve(vapi.stop()).catch(() => {});
        reset(describe(startError));
      }
    });
  }, [apply, clearConnectTimeout, enqueue, isConfigured, reset]);

  const stop = useCallback(() => {
    if (modeRef.current === "idle") return;

    // The UI returns to idle at once; the queued teardown is what actually
    // gates the next start, so an immediate re-click is safe.
    clearConnectTimeout();
    modeRef.current = "idle";
    setStatus("idle");
    setStartedAt(null);
    setAssistantSpeaking(false);

    enqueue(async () => {
      const vapi = vapiRef.current;
      if (!vapi) return;
      try {
        await vapi.stop();
      } catch (stopError) {
        console.error("[call] stop threw:", stopError);
      }
    });
  }, [clearConnectTimeout, enqueue]);

  const toggle = useCallback(() => {
    if (modeRef.current === "idle") start();
    else stop();
  }, [start, stop]);

  const toggleMute = useCallback(() => {
    const vapi = vapiRef.current;
    if (!vapi || typeof vapi.setMuted !== "function") return;

    // Read from the SDK rather than local state, and never mutate inside a
    // state updater — updaters run twice under StrictMode, which used to flip
    // the mute back on the spot.
    const next = !(vapi.isMuted?.() ?? muted);
    vapi.setMuted(next);
    setMuted(next);
  }, [muted]);

  const dismissError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      status,
      muted,
      assistantSpeaking,
      startedAt,
      isConfigured,
      error,
      start,
      stop,
      toggle,
      toggleMute,
      dismissError,
    }),
    [status, muted, assistantSpeaking, startedAt, isConfigured, error, start, stop, toggle, toggleMute, dismissError],
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

/** Turn whatever the SDK threw into one sentence a visitor can act on. */
function describe(raw) {
  const text = typeof raw === "string" ? raw : raw?.message || raw?.error?.message || raw?.errorMsg || "";
  const lower = String(text).toLowerCase();

  if (lower.includes("permission") || lower.includes("notallowed") || lower.includes("denied")) {
    return "We could not access your microphone. Allow microphone access and try again.";
  }
  if (lower.includes("notfound") || lower.includes("no microphone") || lower.includes("requested device not found")) {
    return "No microphone was found. Connect one and try again.";
  }
  if (lower.includes("ejection") || lower.includes("meeting has ended")) {
    return "That call ended unexpectedly. Please try again.";
  }
  if (lower.includes("network") || lower.includes("websocket") || lower.includes("connection")) {
    return "We could not reach the call service. Check your connection and try again.";
  }
  return "We could not connect the call. Please try again.";
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
