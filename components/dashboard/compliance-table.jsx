"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import { KYC_STATUSES, RISK_RATINGS } from "@/lib/compliance";
import { Amount, Avatar, EmptyState, StatusPill, buttonStyles } from "@/components/dashboard/ui";
import { FilterChips, Pagination, SortHeader, Toolbar, compare, downloadCsv } from "@/components/dashboard/table-kit";
import { Checkbox, Field, FormBanner, Select, inputClass, optionsFrom } from "@/components/dashboard/form-kit";

const PAGE_SIZE = 20;

const FILTERS = [
  { value: "all", label: "Everyone" },
  { value: "unverified", label: "Unverified" },
  { value: "in_review", label: "In review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

/**
 * The KYC board. Each row expands into the review form rather than navigating
 * away, because verifying a file is a queue task — the reviewer wants to stay
 * in the list and work down it.
 */
export function ComplianceTable({ rows, action, canVerify }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ key: "score", direction: "asc" });
  const [page, setPage] = useState(1);
  const [openUuid, setOpenUuid] = useState(null);

  const counts = useMemo(() => {
    const tally = { all: rows.length, unverified: 0, in_review: 0, verified: 0, rejected: 0 };
    for (const row of rows) tally[row.kycStatus] = (tally[row.kycStatus] || 0) + 1;
    return tally;
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = rows.filter((row) => {
      if (status !== "all" && row.kycStatus !== status) return false;
      if (!term) return true;
      return [row.name, row.email, row.phone].some((field) => String(field || "").toLowerCase().includes(term));
    });
    return [...matched].sort((a, b) => compare(a[sort.key], b[sort.key], sort.direction));
  }, [rows, search, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const onSort = (key) => {
    setSort((previous) => ({ key, direction: previous.key === key && previous.direction === "desc" ? "asc" : "desc" }));
    setPage(1);
  };

  const exportCsv = () =>
    downloadCsv(
      "kyc-register.csv",
      ["Customer", "Email", "Phone", "KYC status", "Risk", "PEP", "File complete (%)", "Capital", "Outstanding gaps"],
      filtered.map((row) => [
        row.name,
        row.email,
        row.phone,
        row.kycStatus,
        row.riskRating,
        row.isPep ? "Yes" : "No",
        row.score,
        Math.round(row.principal),
        row.gaps.join("; "),
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
        placeholder="Search name, email or phone"
        onExport={exportCsv}
      >
        <FilterChips
          label="KYC status"
          options={FILTERS.map((filter) => ({ ...filter, count: counts[filter.value] }))}
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
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs">
                <tr className="border-b border-[var(--dash-line)]">
                  <SortHeader column="name" sort={sort} onSort={onSort}>Customer</SortHeader>
                  <SortHeader column="score" sort={sort} onSort={onSort}>File</SortHeader>
                  <th scope="col" className="px-4 py-2.5 font-medium text-[var(--dash-muted)]">Outstanding</th>
                  <SortHeader column="principal" sort={sort} onSort={onSort} align="right">Capital</SortHeader>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium text-[var(--dash-muted)]">Status</th>
                  <th scope="col" className="w-24 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-line)]">
                {visible.map((row) => (
                  <ComplianceRow
                    key={row.uuid}
                    row={row}
                    action={action}
                    canVerify={canVerify}
                    open={openUuid === row.uuid}
                    onToggle={() => setOpenUuid((previous) => (previous === row.uuid ? null : row.uuid))}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={current} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
        </>
      ) : (
        <EmptyState icon={ShieldCheck} title="Nobody matches those filters" description="Clear the status filter or search for a different customer." />
      )}
    </div>
  );
}

function ComplianceRow({ row, action, canVerify, open, onToggle }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });

  return (
    <>
      <tr className={cn("transition", open ? "bg-[var(--dash-page)]" : "hover:bg-[var(--dash-page)]")}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar customer={row.avatar} size="sm" />
            <Link href={`/dashboard/customers/${row.uuid}`} className="block min-w-0">
              <span className="block truncate font-medium text-[var(--dash-ink)]">{row.name}</span>
              <span className="block truncate text-xs text-[var(--dash-muted)]">{row.email}</span>
            </Link>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--dash-line)]">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${row.score}%`,
                  background: row.score === 100 ? "var(--status-good)" : row.score >= 60 ? "var(--status-warning)" : "var(--status-critical)",
                }}
              />
            </span>
            <span className="text-xs tabular-nums text-[var(--dash-ink-2)]">{row.score}%</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="block truncate text-xs text-[var(--dash-muted)]">
            {row.gaps.length ? row.gaps.slice(0, 2).join(", ") + (row.gaps.length > 2 ? ` +${row.gaps.length - 2}` : "") : "Nothing outstanding"}
          </span>
        </td>
        <td className="px-4 py-3 text-right"><Amount>{money(row.principal)}</Amount></td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {row.isPep ? <StatusPill status="high" label="PEP" /> : null}
            {row.riskRating !== "unrated" ? <StatusPill status={row.riskRating} /> : null}
            <StatusPill status={row.kycStatus} />
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          {canVerify ? (
            <button type="button" onClick={onToggle} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--dash-accent)] hover:bg-[var(--dash-accent-soft)]">
              {open ? "Close" : "Review"}
            </button>
          ) : null}
        </td>
      </tr>

      {open ? (
        <tr className="bg-[var(--dash-page)]">
          <td colSpan={6} className="px-4 pb-5">
            <form action={formAction} className="rounded-xl border border-[var(--dash-line)] bg-[var(--dash-surface)] p-4">
              <input type="hidden" name="uuid" value={row.uuid} />
              <FormBanner state={state} />

              <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr]">
                <div>
                  <p className="text-xs font-medium text-[var(--dash-ink-2)]">Checklist</p>
                  <ul className="mt-2 space-y-1">
                    {row.checklist.map((item) => (
                      <li key={item.label} className="flex items-center gap-1.5 text-xs text-[var(--dash-ink-2)]">
                        {item.satisfied ? (
                          <Check className="size-3.5 text-[var(--status-good-ink)]" aria-label="Complete" />
                        ) : (
                          <X className="size-3.5 text-[var(--status-critical)]" aria-label="Missing" />
                        )}
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <Field label="KYC status">
                    <Select name="kyc_status" defaultValue={row.kycStatus} options={optionsFrom(KYC_STATUSES)} />
                  </Field>
                  <Field label="Risk rating">
                    <Select name="risk_rating" defaultValue={row.riskRating} options={optionsFrom(RISK_RATINGS)} />
                  </Field>
                </div>

                <div className="space-y-3">
                  <Field label="Reviewer note">
                    <textarea name="kyc_note" rows={3} defaultValue={row.kycNote || ""} placeholder="What was checked, and against what." className={cn(inputClass, "resize-y")} />
                  </Field>
                  <Checkbox
                    name="is_pep"
                    defaultChecked={row.isPep}
                    label="Politically exposed person"
                    hint="Flags the file for enhanced due diligence."
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button type="submit" disabled={pending} className={buttonStyles.primary}>
                  {pending ? "Saving…" : "Save review"}
                </button>
                <Link href={`/dashboard/documents?customer=${row.uuid}`} className={buttonStyles.secondary}>
                  Open document vault
                </Link>
              </div>
            </form>
          </td>
        </tr>
      ) : null}
    </>
  );
}
