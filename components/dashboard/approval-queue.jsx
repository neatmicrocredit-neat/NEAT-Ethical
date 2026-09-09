"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { CheckCheck, ClipboardCheck, ShieldAlert, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { money, relativeTime, shortDate } from "@/lib/format";
import { Amount, Avatar, EmptyState, StatusPill, buttonStyles } from "@/components/dashboard/ui";
import { FormBanner, inputClass } from "@/components/dashboard/form-kit";

/**
 * The review queue.
 *
 * Every card carries its own blockers, computed on the server against the same
 * policy the approve action re-checks. Showing why a placement cannot be
 * approved next to the disabled button is the difference between a queue an
 * operator can clear and one they have to guess at.
 */
export function ApprovalQueue({ rows, bulkAction, decideAction, canApprove }) {
  const [bulkState, bulkFormAction, bulkPending] = useActionState(bulkAction, { ok: false, error: null, message: null });
  const [selected, setSelected] = useState(() => new Set());

  const approvable = useMemo(() => rows.filter((row) => row.clear && row.canApprove), [rows]);
  const selectedRows = approvable.filter((row) => selected.has(row.uuid));

  const toggle = (uuid) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });

  if (!rows.length) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="The queue is clear"
        description="Nothing is waiting on a decision. New submissions from the public form land here."
        className="rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]"
      />
    );
  }

  return (
    <div className="space-y-4">
      {canApprove && approvable.length ? (
        <form action={bulkFormAction} className="rounded-2xl bg-[var(--dash-surface)] p-4 ring-1 ring-[var(--dash-line)]">
          <FormBanner state={bulkState} />
          <div className={cn("flex flex-wrap items-center gap-3", (bulkState.error || bulkState.message) && "mt-3")}>
            <label className="flex items-center gap-2 text-sm text-[var(--dash-ink-2)]">
              <input
                type="checkbox"
                checked={selectedRows.length === approvable.length && approvable.length > 0}
                onChange={() =>
                  setSelected((previous) =>
                    previous.size === approvable.length ? new Set() : new Set(approvable.map((row) => row.uuid))
                  )
                }
                className="size-4 accent-[var(--dash-accent)]"
              />
              Select all {approvable.length} clear to approve
            </label>

            {selectedRows.map((row) => (
              <input key={row.uuid} type="hidden" name="selection" value={row.uuid} />
            ))}

            <span className="text-xs text-[var(--dash-muted)]">
              {selectedRows.length
                ? `${selectedRows.length} selected · ${money(selectedRows.reduce((sum, row) => sum + row.amount, 0))}`
                : "Nothing selected"}
            </span>

            <button type="submit" disabled={bulkPending || !selectedRows.length} className={cn(buttonStyles.primary, "ml-auto")}>
              <CheckCheck className="size-4" />
              {bulkPending ? "Approving…" : "Approve selected"}
            </button>
          </div>
        </form>
      ) : null}

      <ul className="space-y-3">
        {rows.map((row) => (
          <ApprovalCard
            key={row.uuid}
            row={row}
            action={decideAction}
            canApprove={canApprove}
            selected={selected.has(row.uuid)}
            onToggle={() => toggle(row.uuid)}
          />
        ))}
      </ul>
    </div>
  );
}

function ApprovalCard({ row, action, canApprove, selected, onToggle }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });

  return (
    <li
      className={cn(
        "rounded-2xl bg-[var(--dash-surface)] ring-1 transition",
        selected ? "ring-[var(--dash-accent)]" : "ring-[var(--dash-line)]"
      )}
    >
      <div className="flex flex-wrap items-start gap-4 p-5">
        {canApprove && row.clear && row.canApprove ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            aria-label={`Select ${row.customer}'s placement`}
            className="mt-1 size-4 accent-[var(--dash-accent)]"
          />
        ) : null}

        <Avatar customer={row.customerRecord} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/dashboard/investments/${row.uuid}`} className="text-sm font-semibold text-[var(--dash-ink)] hover:underline">
              {row.customer}
            </Link>
            <StatusPill status={row.status} />
            {row.kycStatus ? <StatusPill status={row.kycStatus} /> : null}
            {row.riskRating && row.riskRating !== "unrated" ? <StatusPill status={row.riskRating} /> : null}
          </div>

          <p className="mt-1 text-xs text-[var(--dash-muted)]">
            {row.vehicleLabel} · {row.months} month term from {shortDate(row.startAt)} · submitted {relativeTime(row.submittedAt || row.createdAt)}
          </p>

          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
            <div>
              <dt className="inline text-[var(--dash-muted)]">Principal </dt>
              <dd className="inline"><Amount>{money(row.amount)}</Amount></dd>
            </div>
            <div>
              <dt className="inline text-[var(--dash-muted)]">Profit over term </dt>
              <dd className="inline"><Amount>{money(row.totalProfit)}</Amount></dd>
            </div>
            <div>
              <dt className="inline text-[var(--dash-muted)]">Payout </dt>
              <dd className="inline text-[var(--dash-ink-2)]">{row.schedule}</dd>
            </div>
          </dl>

          <p
            className={cn(
              "mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-xs leading-relaxed",
              row.clear ? "bg-[#eaf7ea] text-[#046004]" : "bg-[#fdf4e0] text-[#7a5600]"
            )}
          >
            {row.clear ? <ShieldCheck className="mt-0.5 size-3.5 shrink-0" /> : <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />}
            <span>{row.clear ? "Compliance file is complete. Clear to approve." : row.blockers.join(" ")}</span>
          </p>

          {state.error || state.message ? <div className="mt-3"><FormBanner state={state} /></div> : null}
        </div>

        {canApprove ? (
          <form action={formAction} className="flex w-full flex-col gap-2 sm:w-56">
            <input type="hidden" name="uuid" value={row.uuid} />
            <input
              name="note"
              placeholder="Decision note (optional)"
              className={cn(inputClass, "text-xs")}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                name="to"
                value="approved"
                disabled={pending || !row.clear || !row.canApprove}
                title={row.clear ? undefined : row.blockers[0]}
                className={cn(buttonStyles.primary, "flex-1")}
              >
                {pending ? "Saving…" : "Approve"}
              </button>
              <button type="submit" name="to" value="rejected" disabled={pending} className={buttonStyles.danger}>
                Reject
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </li>
  );
}
