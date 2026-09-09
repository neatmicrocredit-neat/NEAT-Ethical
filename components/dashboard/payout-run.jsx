"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { CalendarCheck2, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { money, shortDate } from "@/lib/format";
import { Amount, EmptyState, StatusPill, buttonStyles } from "@/components/dashboard/ui";
import { FilterChips, Toolbar, downloadCsv } from "@/components/dashboard/table-kit";
import { Field, FormBanner, Select, inputClass, today } from "@/components/dashboard/form-kit";

const FILTERS = [
  { value: "all", label: "Everything due" },
  { value: "overdue", label: "Overdue" },
  { value: "upcoming", label: "Upcoming" },
];

/**
 * The payout worklist.
 *
 * Each row is one placement-month that the schedule says is owed and the ledger
 * says has not been paid. Selecting rows and submitting writes them to the
 * ledger as a batch, which is how an operator clears a payout run without
 * opening twenty forms.
 *
 * The value posted per row is `investmentId:month:amount:kind` — the server
 * re-reads the placement rather than trusting the customer or bank details that
 * were rendered into this page.
 */
export function PayoutRun({ rows, action, canRecord }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("overdue");
  const [selected, setSelected] = useState(() => new Set());

  const counts = useMemo(
    () => ({
      all: rows.length,
      overdue: rows.filter((row) => row.overdue).length,
      upcoming: rows.filter((row) => !row.overdue).length,
    }),
    [rows]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === "overdue" && !row.overdue) return false;
      if (filter === "upcoming" && row.overdue) return false;
      if (!term) return true;
      return [row.customer, row.vehicleLabel, row.bank, row.accountName].some((field) =>
        String(field || "").toLowerCase().includes(term)
      );
    });
  }, [rows, search, filter]);

  const selectedRows = useMemo(() => visible.filter((row) => selected.has(row.id)), [visible, selected]);
  const selectedTotal = selectedRows.reduce((sum, row) => sum + row.outstanding, 0);
  const allVisibleSelected = visible.length > 0 && visible.every((row) => selected.has(row.id));

  const toggle = (id) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (allVisibleSelected) visible.forEach((row) => next.delete(row.id));
      else visible.forEach((row) => next.add(row.id));
      return next;
    });

  const exportCsv = () =>
    downloadCsv(
      "payouts-due.csv",
      ["Customer", "Vehicle", "Month", "Due date", "Profit", "Principal", "Already paid", "Outstanding", "Days late", "Bank", "Account"],
      visible.map((row) => [
        row.customer,
        row.vehicleLabel,
        row.month,
        row.date?.slice(0, 10) || "",
        Math.round(row.profitDue),
        Math.round(row.principalDue),
        Math.round(row.paid),
        Math.round(row.outstanding),
        row.overdue ? row.daysLate : 0,
        row.bank || "",
        row.accountNumber || "",
      ])
    );

  return (
    <form action={formAction} className="rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]">
      <Toolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search customer, bank or account"
        onExport={exportCsv}
      >
        <FilterChips
          label="Due"
          options={FILTERS.map((entry) => ({ ...entry, count: counts[entry.value] }))}
          value={filter}
          onChange={setFilter}
        />
      </Toolbar>

      {state.error || state.message ? (
        <div className="border-b border-[var(--dash-line)] px-4 py-3">
          <FormBanner state={state} />
        </div>
      ) : null}

      {visible.length ? (
        <>
          <div className="overflow-x-auto dash-scroll">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="text-xs">
                <tr className="border-b border-[var(--dash-line)] text-[var(--dash-muted)]">
                  <th scope="col" className="w-10 px-4 py-2.5">
                    {canRecord ? (
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAll}
                        aria-label="Select every payout in view"
                        className="size-4 accent-[var(--dash-accent)]"
                      />
                    ) : null}
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Customer</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Period</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Profit</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Principal</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Outstanding</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Payout account</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-line)]">
                {visible.map((row) => {
                  const checked = selected.has(row.id);
                  return (
                    <tr key={row.id} className={cn("transition", checked ? "bg-[var(--dash-accent-soft)]" : "hover:bg-[var(--dash-page)]")}>
                      <td className="px-4 py-3">
                        {canRecord ? (
                          <>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggle(row.id)}
                              aria-label={`Select ${row.customer}, month ${row.month}`}
                              className="size-4 accent-[var(--dash-accent)]"
                            />
                            {checked ? (
                              <input
                                type="hidden"
                                name="selection"
                                value={`${row.investmentId}:${row.month}:${Math.round(row.outstanding)}:${row.kind}`}
                              />
                            ) : null}
                          </>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/investments/${row.investmentUuid}`} className="block min-w-0">
                          <span className="block truncate font-medium text-[var(--dash-ink)]">{row.customer}</span>
                          <span className="block truncate text-xs text-[var(--dash-muted)]">{row.vehicleLabel}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[var(--dash-ink-2)]">
                        Month {row.month}
                        {row.paid > 0 ? (
                          <span className="mt-0.5 block text-[11px] text-[var(--dash-muted)]">{money(row.paid)} already paid</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--dash-ink-2)]">
                        {row.profitDue ? money(row.profitDue) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--dash-ink-2)]">
                        {row.principalDue ? money(row.principalDue) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right"><Amount>{money(row.outstanding)}</Amount></td>
                      <td className="px-4 py-3">
                        <span className="block truncate text-xs text-[var(--dash-ink-2)]">{row.bank || "No bank on file"}</span>
                        <span className="block truncate font-mono text-[11px] text-[var(--dash-muted)]">{row.accountNumber || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.overdue ? (
                          <StatusPill status="arrears" label={row.daysLate ? `${row.daysLate}d late` : "Due"} />
                        ) : (
                          <span className="text-xs text-[var(--dash-muted)]">{shortDate(row.date)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {canRecord ? (
            <div className="flex flex-wrap items-end gap-3 border-t border-[var(--dash-line)] bg-[var(--dash-raised)] px-4 py-4">
              <div className="mr-auto">
                <p className="text-sm font-medium text-[var(--dash-ink)]">
                  {selectedRows.length
                    ? `${selectedRows.length} selected · ${money(selectedTotal)}`
                    : "Select the payouts you have sent"}
                </p>
                <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
                  Recording writes one ledger entry per row, tagged to its schedule month.
                </p>
              </div>

              <Field label="Value date" className="w-40">
                <input type="date" name="value_date" defaultValue={today()} className={inputClass} />
              </Field>
              <Field label="Status" className="w-36">
                <Select
                  name="status"
                  defaultValue="cleared"
                  options={[
                    { value: "cleared", label: "Cleared" },
                    { value: "pending", label: "Pending" },
                  ]}
                />
              </Field>
              <Field label="Method" className="w-40">
                <Select
                  name="method"
                  defaultValue="bank_transfer"
                  options={[
                    { value: "bank_transfer", label: "Bank transfer" },
                    { value: "cash", label: "Cash" },
                    { value: "cheque", label: "Cheque" },
                    { value: "internal", label: "Internal" },
                  ]}
                />
              </Field>

              <button type="submit" disabled={pending || !selectedRows.length} className={buttonStyles.primary}>
                <CalendarCheck2 className="size-4" />
                {pending ? "Recording…" : "Record payouts"}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          icon={filter === "overdue" ? CalendarCheck2 : TriangleAlert}
          title={filter === "overdue" ? "Nothing is overdue" : "Nothing due in this window"}
          description={
            filter === "overdue"
              ? "Every scheduled payout that has fallen due has been recorded against the ledger."
              : "Switch to another filter, or widen the horizon to see payouts further out."
          }
        />
      )}
    </form>
  );
}
