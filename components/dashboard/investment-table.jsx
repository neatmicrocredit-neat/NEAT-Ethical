"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Briefcase, RefreshCw } from "lucide-react";

import { money, shortDate } from "@/lib/format";
import { Amount, EmptyState, StatusPill } from "@/components/dashboard/ui";
import { FilterChips, Pagination, SortHeader, Toolbar, compare, downloadCsv } from "@/components/dashboard/table-kit";

const PAGE_SIZE = 25;

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "matured", label: "Matured" },
];

const VEHICLE_FILTERS = [
  { value: "all", label: "Both vehicles" },
  { value: "ethical", label: "Ethical" },
  { value: "funding", label: "Funding" },
];

export function InvestmentTable({ rows, initialStatus = "all", initialVehicle = "all" }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(STATUS_FILTERS.some((f) => f.value === initialStatus) ? initialStatus : "all");
  const [vehicle, setVehicle] = useState(VEHICLE_FILTERS.some((f) => f.value === initialVehicle) ? initialVehicle : "all");
  const [sort, setSort] = useState({ key: "startAt", direction: "desc" });
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const tally = { all: rows.length, active: 0, pending: 0, matured: 0 };
    for (const row of rows) tally[row.status] += 1;
    return tally;
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = rows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (vehicle !== "all" && row.vehicleKey !== vehicle) return false;
      if (!term) return true;
      return [row.customer, row.email, row.vehicle, row.bank, row.accountName].some((field) =>
        String(field || "").toLowerCase().includes(term)
      );
    });
    return [...matched].sort((a, b) => compare(a[sort.key], b[sort.key], sort.direction));
  }, [rows, search, status, vehicle, sort]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, row) => ({
          principal: acc.principal + row.amount,
          profit: acc.profit + row.totalProfit,
          monthly: acc.monthly + (row.status === "matured" ? 0 : row.monthlyProfit),
        }),
        { principal: 0, profit: 0, monthly: 0 }
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

  const exportCsv = () =>
    downloadCsv(
      "neat-placements.csv",
      ["Customer", "Vehicle", "Amount", "Term (months)", "Start", "End", "Payout", "Rollover", "Status", "Monthly profit", "Total profit"],
      filtered.map((row) => [
        row.customer,
        row.vehicle,
        row.amount,
        row.months,
        row.startAt?.slice(0, 10) || "",
        row.endAt?.slice(0, 10) || "",
        row.schedule,
        row.rollover ? "Yes" : "No",
        row.status,
        Math.round(row.monthlyProfit),
        Math.round(row.totalProfit),
      ])
    );

  return (
    <div className="rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]">
      <Toolbar
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search customer, bank or account name"
        onExport={exportCsv}
      >
        <FilterChips
          label="Status"
          options={STATUS_FILTERS.map((filter) => ({ ...filter, count: counts[filter.value] }))}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
        <span className="hidden h-5 w-px bg-[var(--dash-line)] sm:block" aria-hidden />
        <FilterChips
          label="Vehicle"
          options={VEHICLE_FILTERS}
          value={vehicle}
          onChange={(value) => {
            setVehicle(value);
            setPage(1);
          }}
        />
      </Toolbar>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[var(--dash-line)] bg-[var(--dash-raised)] px-4 py-2.5 text-xs">
        <span className="text-[var(--dash-muted)]">
          Capital in view <Amount className="ml-1">{money(totals.principal)}</Amount>
        </span>
        <span className="text-[var(--dash-muted)]">
          Projected profit <Amount className="ml-1">{money(totals.profit)}</Amount>
        </span>
        <span className="text-[var(--dash-muted)]">
          Monthly obligation <Amount className="ml-1">{money(totals.monthly)}</Amount>
        </span>
        <span className="ml-auto text-[var(--dash-muted)]">{filtered.length.toLocaleString()} placements</span>
      </div>

      {visible.length ? (
        <>
          <div className="overflow-x-auto dash-scroll">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-xs">
                <tr className="border-b border-[var(--dash-line)]">
                  <SortHeader column="customer" sort={sort} onSort={onSort}>Customer</SortHeader>
                  <SortHeader column="vehicle" sort={sort} onSort={onSort}>Vehicle</SortHeader>
                  <SortHeader column="amount" sort={sort} onSort={onSort} align="right">Amount</SortHeader>
                  <SortHeader column="months" sort={sort} onSort={onSort} align="right">Term</SortHeader>
                  <SortHeader column="startAt" sort={sort} onSort={onSort} align="right">Start</SortHeader>
                  <SortHeader column="endAt" sort={sort} onSort={onSort} align="right">Matures</SortHeader>
                  <SortHeader column="monthlyProfit" sort={sort} onSort={onSort} align="right">Monthly profit</SortHeader>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium text-[var(--dash-muted)]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-line)]">
                {visible.map((row) => (
                  <tr key={row.uuid} className="transition hover:bg-[var(--dash-page)]">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/investments/${row.uuid}`} className="block min-w-0">
                        <span className="block truncate font-medium text-[var(--dash-ink)]">{row.customer}</span>
                        <span className="block truncate text-xs text-[var(--dash-muted)]">{row.email}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-[var(--dash-ink-2)]">
                        <span
                          className="size-2 shrink-0 rounded-[3px]"
                          style={{ background: row.vehicleKey === "funding" ? "var(--series-2)" : "var(--series-1)" }}
                          aria-hidden
                        />
                        {row.vehicle}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right"><Amount>{money(row.amount)}</Amount></td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--dash-ink-2)]">{row.months} mo</td>
                    <td className="px-4 py-3 text-right text-xs text-[var(--dash-muted)]">{shortDate(row.startAt)}</td>
                    <td className="px-4 py-3 text-right text-xs text-[var(--dash-muted)]">{shortDate(row.endAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5">
                        {row.rollover ? <RefreshCw className="size-3 text-[var(--dash-muted)]" aria-label="Rolls over" /> : null}
                        <Amount>{money(row.monthlyProfit)}</Amount>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right"><StatusPill status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={current} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
        </>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No placements match those filters"
          description="Clear the status or vehicle filter, or search for a different customer."
        />
      )}
    </div>
  );
}
