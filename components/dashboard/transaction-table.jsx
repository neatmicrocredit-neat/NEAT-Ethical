"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";

import { money, shortDate } from "@/lib/format";
import { Amount, EmptyState, StatusPill } from "@/components/dashboard/ui";
import { FilterChips, Pagination, SortHeader, Toolbar, compare, downloadCsv } from "@/components/dashboard/table-kit";

const PAGE_SIZE = 25;

const DIRECTION_FILTERS = [
  { value: "all", label: "All" },
  { value: "in", label: "Money in" },
  { value: "out", label: "Money out" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Any status" },
  { value: "cleared", label: "Cleared" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

/**
 * The cash ledger.
 *
 * Rows are pre-flattened on the server so the client never re-derives a
 * customer name or a vehicle label. The running totals in the strip reflect the
 * *filtered* set, not the whole book, because the question an operator asks here
 * is always "how much of this slice".
 */
export function TransactionTable({ rows, initialDirection = "all", initialStatus = "all", initialKind = "all", kinds = [] }) {
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState(initialDirection);
  const [status, setStatus] = useState(initialStatus);
  const [kind, setKind] = useState(initialKind);
  const [sort, setSort] = useState({ key: "valueDate", direction: "desc" });
  const [page, setPage] = useState(1);

  const kindFilters = useMemo(
    () => [{ value: "all", label: "All kinds" }, ...kinds.map((entry) => ({ value: entry.key, label: entry.label }))],
    [kinds]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = rows.filter((row) => {
      if (direction !== "all" && row.direction !== direction) return false;
      if (status !== "all" && row.status !== status) return false;
      if (kind !== "all" && row.kind !== kind) return false;
      if (!term) return true;
      return [row.customer, row.reference, row.note, row.kindLabel, row.accountName, row.bank].some((field) =>
        String(field || "").toLowerCase().includes(term)
      );
    });
    return [...matched].sort((a, b) => compare(a[sort.key], b[sort.key], sort.direction));
  }, [rows, search, direction, status, kind, sort]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, row) => {
          if (row.status !== "cleared") {
            acc.pending += row.amount;
            return acc;
          }
          if (row.direction === "in") acc.inflow += row.amount;
          else acc.outflow += row.amount;
          return acc;
        },
        { inflow: 0, outflow: 0, pending: 0 }
      ),
    [filtered]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const onSort = (key) => {
    setSort((previous) => ({ key, direction: previous.key === key && previous.direction === "desc" ? "asc" : "desc" }));
    setPage(1);
  };

  const reset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const exportCsv = () =>
    downloadCsv(
      "ledger.csv",
      ["Date", "Customer", "Kind", "Direction", "Amount", "Status", "Method", "Reference", "Period", "Note"],
      filtered.map((row) => [
        row.valueDate?.slice(0, 10) || "",
        row.customer,
        row.kindLabel,
        row.direction,
        Math.round(row.amount),
        row.status,
        row.methodLabel || "",
        row.reference || "",
        row.periodIndex || "",
        row.note || "",
      ])
    );

  return (
    <div className="rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]">
      <Toolbar search={search} onSearch={reset(setSearch)} placeholder="Search customer, reference or note" onExport={exportCsv}>
        <FilterChips label="Direction" options={DIRECTION_FILTERS} value={direction} onChange={reset(setDirection)} />
        <span className="hidden h-5 w-px bg-[var(--dash-line)] sm:block" aria-hidden />
        <FilterChips label="Status" options={STATUS_FILTERS} value={status} onChange={reset(setStatus)} />
        <span className="hidden h-5 w-px bg-[var(--dash-line)] sm:block" aria-hidden />
        <FilterChips label="Kind" options={kindFilters} value={kind} onChange={reset(setKind)} />
      </Toolbar>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[var(--dash-line)] bg-[var(--dash-raised)] px-4 py-2.5 text-xs">
        <span className="text-[var(--dash-muted)]">
          Cleared in <Amount className="ml-1 text-[var(--status-good-ink)]">{money(totals.inflow)}</Amount>
        </span>
        <span className="text-[var(--dash-muted)]">
          Cleared out <Amount className="ml-1">{money(totals.outflow)}</Amount>
        </span>
        <span className="text-[var(--dash-muted)]">
          Net <Amount className="ml-1">{money(totals.inflow - totals.outflow)}</Amount>
        </span>
        {totals.pending ? (
          <span className="text-[var(--dash-muted)]">
            Unsettled <Amount className="ml-1">{money(totals.pending)}</Amount>
          </span>
        ) : null}
        <span className="ml-auto text-[var(--dash-muted)]">{filtered.length.toLocaleString()} entries</span>
      </div>

      {visible.length ? (
        <>
          <div className="overflow-x-auto dash-scroll">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="text-xs">
                <tr className="border-b border-[var(--dash-line)]">
                  <SortHeader column="valueDate" sort={sort} onSort={onSort}>Date</SortHeader>
                  <SortHeader column="customer" sort={sort} onSort={onSort}>Customer</SortHeader>
                  <SortHeader column="kindLabel" sort={sort} onSort={onSort}>Entry</SortHeader>
                  <SortHeader column="amount" sort={sort} onSort={onSort} align="right">Amount</SortHeader>
                  <th scope="col" className="px-4 py-2.5 font-medium text-[var(--dash-muted)]">Reference</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium text-[var(--dash-muted)]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-line)]">
                {visible.map((row) => {
                  const Icon = row.direction === "in" ? ArrowDownLeft : ArrowUpRight;
                  return (
                    <tr key={row.uuid} className="transition hover:bg-[var(--dash-page)]">
                      <td className="px-4 py-3 text-xs text-[var(--dash-muted)]">{shortDate(row.valueDate)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/transactions/${row.uuid}`} className="block min-w-0">
                          <span className="block truncate font-medium text-[var(--dash-ink)]">{row.customer}</span>
                          {row.vehicleLabel ? (
                            <span className="block truncate text-xs text-[var(--dash-muted)]">{row.vehicleLabel}</span>
                          ) : null}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 text-[var(--dash-ink-2)]">
                          <Icon
                            className={row.direction === "in" ? "size-3.5 text-[var(--status-good-ink)]" : "size-3.5 text-[var(--dash-muted)]"}
                            aria-hidden
                          />
                          {row.kindLabel}
                          {row.periodIndex ? (
                            <span className="rounded-md bg-[var(--dash-page)] px-1.5 py-0.5 text-[10px] text-[var(--dash-muted)]">
                              month {row.periodIndex}
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Amount className={row.direction === "in" ? "text-[var(--status-good-ink)]" : undefined}>
                          {row.direction === "in" ? "+" : "−"}
                          {money(row.amount)}
                        </Amount>
                      </td>
                      <td className="px-4 py-3">
                        <span className="block truncate text-xs text-[var(--dash-muted)]">{row.reference || row.methodLabel || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-right"><StatusPill status={row.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={current} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
        </>
      ) : (
        <EmptyState
          icon={Receipt}
          title="No ledger entries match those filters"
          description="Clear a filter, or record the first entry against a placement."
        />
      )}
    </div>
  );
}
