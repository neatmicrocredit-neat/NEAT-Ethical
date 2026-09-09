"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { cn } from "@/lib/utils";
import { money, shortDate } from "@/lib/format";
import { WORKFLOW } from "@/lib/workflow";
import { Amount, Panel, PanelHeader, StatusPill, buttonStyles } from "@/components/dashboard/ui";
import { FormBanner, inputClass } from "@/components/dashboard/form-kit";

/**
 * Schedule against ledger, month by month.
 *
 * Three states matter and each has to be visually distinct at a glance: settled
 * (nothing to do), in arrears (act now), and scheduled (not yet). Rows the
 * customer has partly paid show what is left rather than the original figure.
 */
export function SettlementPanel({ settlement, investmentId, canRecord }) {
  const [showAll, setShowAll] = useState(false);
  const periods = settlement.periods.filter((period) => period.expected > 0);
  const visible = showAll ? periods : periods.filter((period) => period.state !== "settled").slice(0, 12);

  return (
    <Panel>
      <PanelHeader
        title="Settlement"
        description="Each month of the schedule, against what the ledger records as paid."
        action={
          canRecord ? (
            <Link href={`/dashboard/transactions/new?investment=${investmentId}`} className={buttonStyles.secondary}>
              Record payment
            </Link>
          ) : null
        }
      />

      <dl className="grid gap-4 border-b border-[var(--dash-line)] px-5 py-4 sm:grid-cols-4">
        <Summary label="Due to date" value={money(settlement.dueToDate)} />
        <Summary label="Paid to date" value={money(settlement.paidToDate)} />
        <Summary
          label="In arrears"
          value={money(settlement.arrears)}
          tone={settlement.arrears > 0.5 ? "critical" : "good"}
        />
        <Summary label="Still owed over term" value={money(settlement.remainingObligation)} />
      </dl>

      {settlement.funding.shortfall > 0.5 ? (
        <p className="border-b border-[var(--dash-line)] bg-[#fdf4e0] px-5 py-3 text-xs text-[#7a5600]">
          Only {money(settlement.funding.received)} of the {money(settlement.funding.expected)} principal has been
          recorded as received — a shortfall of {money(settlement.funding.shortfall)}.
        </p>
      ) : null}

      {settlement.unapplied > 0.5 ? (
        <p className="border-b border-[var(--dash-line)] bg-[var(--dash-page)] px-5 py-3 text-xs text-[var(--dash-ink-2)]">
          {money(settlement.unapplied)} of payments are not tagged to a schedule month. They count toward the total paid
          but cannot clear a specific period — edit those entries to set a period.
        </p>
      ) : null}

      {visible.length ? (
        <div className="overflow-x-auto dash-scroll">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs">
              <tr className="border-b border-[var(--dash-line)] text-[var(--dash-muted)]">
                <th scope="col" className="px-5 py-2.5 font-medium">Month</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Due</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Expected</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Paid</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Outstanding</th>
                <th scope="col" className="px-5 py-2.5 text-right font-medium">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dash-line)]">
              {visible.map((period) => (
                <tr key={period.month} className={cn(period.state === "arrears" && "bg-[#fdeced]/40")}>
                  <td className="px-5 py-2.5 tabular-nums text-[var(--dash-ink-2)]">M{period.month}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--dash-muted)]">{shortDate(period.date)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--dash-ink-2)]">{money(period.expected)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--dash-ink-2)]">{money(period.paid)}</td>
                  <td className="px-4 py-2.5 text-right"><Amount>{money(period.outstanding)}</Amount></td>
                  <td className="px-5 py-2.5 text-right">
                    <StatusPill
                      status={period.state === "arrears" ? "arrears" : period.state === "settled" ? "settled" : "pending"}
                      label={period.state === "scheduled" ? "Scheduled" : undefined}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-5 py-6 text-sm text-[var(--dash-muted)]">
          Every scheduled period is settled against the ledger.
        </p>
      )}

      {periods.length > visible.length || showAll ? (
        <button
          type="button"
          onClick={() => setShowAll((previous) => !previous)}
          className="w-full border-t border-[var(--dash-line)] px-5 py-2.5 text-xs font-medium text-[var(--dash-accent)] transition hover:bg-[var(--dash-page)]"
        >
          {showAll ? "Show outstanding only" : `Show all ${periods.length} periods`}
        </button>
      ) : null}
    </Panel>
  );
}

function Summary({ label, value, tone }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--dash-muted)]">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-sm font-semibold tabular-nums",
          tone === "critical" ? "text-[var(--status-critical)]" : tone === "good" ? "text-[var(--status-good-ink)]" : "text-[var(--dash-ink)]"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * The lifecycle control on a placement's page.
 *
 * Only the transitions legal from the current state are offered, and each
 * carries the note field, because "why" is the part a reviewer needs later.
 */
export function WorkflowControl({ investment, transitions, action, blockers = [] }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });
  const [open, setOpen] = useState(false);

  if (!transitions.length) {
    return (
      <p className="rounded-xl bg-[var(--dash-page)] px-3.5 py-2.5 text-xs text-[var(--dash-ink-2)]">
        {WORKFLOW[investment.status]?.note || "This placement has reached the end of its lifecycle."}
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonStyles.secondary}>
        Change status
      </button>
    );
  }

  return (
    <form action={formAction} className="w-full rounded-xl border border-[var(--dash-line)] bg-[var(--dash-surface)] p-4">
      <input type="hidden" name="uuid" value={investment.uuid} />
      <FormBanner state={state} />

      <p className={cn("text-xs text-[var(--dash-muted)]", (state.error || state.message) && "mt-3")}>
        Currently {WORKFLOW[investment.status]?.label.toLowerCase() || investment.status}.
      </p>

      <input name="note" placeholder="Decision note (optional)" className={cn(inputClass, "mt-2 text-xs")} />

      <div className="mt-3 flex flex-wrap gap-2">
        {transitions.map((transition) => {
          const blocked = transition.key === "approved" && blockers.length > 0;
          return (
            <button
              key={transition.key}
              type="submit"
              name="to"
              value={transition.key}
              disabled={pending || blocked}
              title={blocked ? blockers[0] : transition.note}
              className={transition.key === "rejected" || transition.key === "defaulted" ? buttonStyles.danger : buttonStyles.secondary}
            >
              {transition.label}
            </button>
          );
        })}
        <button type="button" onClick={() => setOpen(false)} className={buttonStyles.ghost}>
          Cancel
        </button>
      </div>

      {blockers.length ? <p className="mt-2 text-xs text-[#7a5600]">{blockers[0]}</p> : null}
    </form>
  );
}
