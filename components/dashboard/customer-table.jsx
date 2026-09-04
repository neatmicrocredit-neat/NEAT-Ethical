"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Users } from "lucide-react";

import { money, shortDate } from "@/lib/format";
import { Amount, Avatar, EmptyState, StatusPill } from "@/components/dashboard/ui";
import { FilterChips, Pagination, SortHeader, Toolbar, compare, downloadCsv } from "@/components/dashboard/table-kit";

const PAGE_SIZE = 25;

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "matured", label: "Matured" },
  { value: "none", label: "No placements" },
];

/**
 * @param rows - plain serialisable rows built on the server by
 *   app/dashboard/customers/page.js, so no domain maths runs on the client.
 */
export function CustomerTable({ rows, initialSearch = "" }) {
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ key: "capital", direction: "desc" });
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const tally = { all: rows.length, active: 0, pending: 0, matured: 0, none: 0 };
    for (const row of rows) tally[row.status] = (tally[row.status] || 0) + 1;
    return tally;
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = rows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (!term) return true;
      return [row.name, row.email, row.phone, row.state, row.reference].some((field) =>
        String(field || "").toLowerCase().includes(term)
      );
    });
    return [...matched].sort((a, b) => compare(a[sort.key], b[sort.key], sort.direction));
  }, [rows, search, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const onSort = (key) => {
    setSort((previous) => ({
      key,
      direction: previous.key === key && previous.direction === "desc" ? "asc" : "desc",
    }));
    setPage(1);
  };

  const exportCsv = () =>
    downloadCsv(
      "neat-customers.csv",
      ["Name", "Email", "Phone", "State", "Placements", "Capital placed", "Portfolio status", "Joined"],
      filtered.map((row) => [row.name, row.email, row.phone, row.state, row.placements, row.capital, row.status, row.joined])
    );

  return (
    <div className="rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]">
      <Toolbar
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search name, email, phone or state"
        onExport={exportCsv}
        resultLabel={`${filtered.length.toLocaleString()} of ${rows.length.toLocaleString()}`}
      >
        <FilterChips
          label="Portfolio status"
          options={STATUS_FILTERS.map((filter) => ({ ...filter, count: counts[filter.value] || 0 }))}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </Toolbar>

      {visible.length ? (
        <>
          <div className="overflow-x-auto dash-scroll">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-xs">
                <tr className="border-b border-[var(--dash-line)]">
                  <SortHeader column="name" sort={sort} onSort={onSort}>Customer</SortHeader>
                  <SortHeader column="phone" sort={sort} onSort={onSort}>Phone</SortHeader>
                  <SortHeader column="state" sort={sort} onSort={onSort}>State</SortHeader>
                  <SortHeader column="placements" sort={sort} onSort={onSort} align="right">Placements</SortHeader>
                  <SortHeader column="capital" sort={sort} onSort={onSort} align="right">Capital placed</SortHeader>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium text-[var(--dash-muted)]">Status</th>
                  <SortHeader column="joinedAt" sort={sort} onSort={onSort} align="right">Joined</SortHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-line)]">
                {visible.map((row) => (
                  <tr key={row.uuid} className="transition hover:bg-[var(--dash-page)]">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/customers/${row.uuid}`} className="flex items-center gap-3">
                        <Avatar customer={{ first_name: row.name, image_url: row.image }} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-[var(--dash-ink)]">{row.name}</span>
                          <span className="block truncate text-xs text-[var(--dash-muted)]">{row.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--dash-ink-2)]">{row.phone || "—"}</td>
                    <td className="px-4 py-3 text-[var(--dash-ink-2)]">{row.state || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--dash-ink-2)]">{row.placements}</td>
                    <td className="px-4 py-3 text-right"><Amount>{money(row.capital)}</Amount></td>
                    <td className="px-4 py-3 text-right"><StatusPill status={row.status} /></td>
                    <td className="px-4 py-3 text-right text-xs text-[var(--dash-muted)]">{shortDate(row.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={current} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="No customers match those filters"
          description="Try a different search term, or clear the portfolio status filter."
        />
      )}
    </div>
  );
}
