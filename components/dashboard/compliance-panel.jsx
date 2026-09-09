"use client";

import { useActionState, useState } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { KYC_STATUSES, RISK_RATINGS } from "@/lib/compliance";
import { dateTime } from "@/lib/format";
import { Panel, PanelHeader, StatusPill, buttonStyles } from "@/components/dashboard/ui";
import { Checkbox, Field, FormBanner, Select, inputClass, optionsFrom } from "@/components/dashboard/form-kit";

/**
 * One customer's compliance standing, with the review form folded away until
 * needed. The checklist is the whole point: it says what is missing, not just
 * that something is.
 */
export function CompliancePanel({ customer, compliance, action, canVerify }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });
  const [open, setOpen] = useState(false);

  const items = [...compliance.profile.items, ...compliance.kyc.items.map((item) => ({ label: item.label, satisfied: item.satisfied }))];

  return (
    <Panel>
      <PanelHeader
        title="Compliance"
        description={compliance.status.note}
        action={
          canVerify ? (
            <button
              type="button"
              onClick={() => setOpen((previous) => !previous)}
              className="text-xs font-medium text-[var(--dash-accent)] hover:underline"
            >
              {open ? "Close" : "Review"}
            </button>
          ) : null
        }
      />

      <div className="space-y-4 px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={compliance.status.key} label={compliance.status.label} />
          <StatusPill status={compliance.risk.key} label={`${compliance.risk.label} risk`} />
          {compliance.isPep ? <StatusPill status="high" label="PEP" /> : null}
        </div>

        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--dash-muted)]">File completeness</span>
            <span className="tabular-nums text-[var(--dash-ink-2)]">{compliance.score}%</span>
          </div>
          <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-[var(--dash-line)]">
            <span
              className="block h-full rounded-full transition-[width]"
              style={{
                width: `${compliance.score}%`,
                background: compliance.score === 100 ? "var(--status-good)" : compliance.score >= 60 ? "var(--status-warning)" : "var(--status-critical)",
              }}
            />
          </span>
        </div>

        <ul className="grid gap-1.5 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5 text-xs text-[var(--dash-ink-2)]">
              {item.satisfied ? (
                <Check className="size-3.5 shrink-0 text-[var(--status-good-ink)]" aria-label="Complete" />
              ) : (
                <X className="size-3.5 shrink-0 text-[var(--status-critical)]" aria-label="Missing" />
              )}
              {item.label}
            </li>
          ))}
        </ul>

        {customer.kyc_verified_at ? (
          <p className="text-[11px] text-[var(--dash-muted)]">
            Verified {dateTime(customer.kyc_verified_at)}
            {customer.kyc_verified_by ? ` by ${customer.kyc_verified_by}` : ""}
          </p>
        ) : null}

        {customer.kyc_note ? (
          <p className="rounded-xl bg-[var(--dash-page)] px-3.5 py-2.5 text-xs text-[var(--dash-ink-2)]">{customer.kyc_note}</p>
        ) : null}

        {open ? (
          <form action={formAction} className="space-y-3 border-t border-[var(--dash-line)] pt-4">
            <input type="hidden" name="uuid" value={customer.uuid} />
            <FormBanner state={state} />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="KYC status">
                <Select name="kyc_status" defaultValue={compliance.status.key} options={optionsFrom(KYC_STATUSES)} />
              </Field>
              <Field label="Risk rating">
                <Select name="risk_rating" defaultValue={compliance.risk.key} options={optionsFrom(RISK_RATINGS)} />
              </Field>
            </div>

            <Field label="Reviewer note">
              <textarea
                name="kyc_note"
                rows={3}
                defaultValue={customer.kyc_note || ""}
                placeholder="What was checked, and against what."
                className={cn(inputClass, "resize-y")}
              />
            </Field>

            <Checkbox
              name="is_pep"
              defaultChecked={compliance.isPep}
              label="Politically exposed person"
              hint="Flags the file for enhanced due diligence."
            />

            <button type="submit" disabled={pending} className={buttonStyles.primary}>
              {pending ? "Saving…" : "Save review"}
            </button>
          </form>
        ) : null}
      </div>
    </Panel>
  );
}
