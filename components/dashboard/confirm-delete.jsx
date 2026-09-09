"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { buttonStyles } from "@/components/dashboard/ui";

/**
 * Deleting a record removes history that cannot be reconstructed, so the button
 * arms first and only the second click submits.
 *
 * Pass a single field with `name`/`value`, or several with `hiddenFields` when
 * the action also needs the paths to revalidate.
 */
export function ConfirmDelete({
  action,
  name,
  value,
  hiddenFields,
  label = "Delete",
  confirmLabel = "Yes, delete permanently",
  warning,
  description,
  size = "md",
}) {
  const [armed, setArmed] = useState(false);
  const fields = hiddenFields || (name ? { [name]: value } : {});
  const compact = size === "sm";

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={compact ? "rounded-lg p-1.5 text-[var(--dash-muted)] transition hover:bg-[#fdeced] hover:text-[var(--status-critical)]" : buttonStyles.danger}
        aria-label={compact ? label : undefined}
      >
        <Trash2 className={compact ? "size-3.5" : "size-4"} />
        {compact ? null : label}
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      {Object.entries(fields).map(([field, fieldValue]) =>
        fieldValue === undefined || fieldValue === null ? null : (
          <input key={field} type="hidden" name={field} value={String(fieldValue)} />
        )
      )}
      {warning || description ? (
        <span className="text-xs text-[var(--status-critical)]">{warning || description}</span>
      ) : null}
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
