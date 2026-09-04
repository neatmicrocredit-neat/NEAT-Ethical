"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { buttonStyles } from "@/components/dashboard/ui";

/**
 * Deleting a placement removes payout history, so the button arms first and
 * only the second click submits.
 */
export function ConfirmDelete({ action, name, value, label = "Delete", confirmLabel = "Yes, delete permanently", warning }) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button type="button" onClick={() => setArmed(true)} className={buttonStyles.danger}>
        <Trash2 className="size-4" />
        {label}
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name={name} value={value} />
      {warning ? <span className="text-xs text-[var(--status-critical)]">{warning}</span> : null}
      <button type="submit" className={buttonStyles.danger}>
        <Trash2 className="size-4" />
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setArmed(false)} className={buttonStyles.ghost}>
        Cancel
      </button>
    </form>
  );
}
