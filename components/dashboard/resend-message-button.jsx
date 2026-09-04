"use client";

import { useActionState } from "react";
import { Clock3, RotateCcw } from "lucide-react";

import { buttonStyles } from "@/components/dashboard/ui";

export function ResendMessageButton({ action, messageId, threadUuid, status }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });
  const failed = status === "failed";
  const Icon = failed ? RotateCcw : Clock3;
  const label = failed ? "Try sending this message again" : "Send this queued message now";

  return (
    <form action={formAction} className="inline-flex items-center gap-1.5">
      <input type="hidden" name="message_id" value={messageId} />
      <input type="hidden" name="thread_uuid" value={threadUuid} />
      <button
        type="submit"
        disabled={pending}
        title={label}
        aria-label={label}
        className={buttonStyles.ghost}
      >
        <Icon className="size-3.5" />
        {pending ? "Sending..." : failed ? "Try again" : "Send now"}
      </button>
      {state.error ? <span role="alert" className="text-[11px] text-[var(--status-critical)]">{state.error}</span> : null}
    </form>
  );
}