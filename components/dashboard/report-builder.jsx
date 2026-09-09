"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";

import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import { buttonStyles } from "@/components/dashboard/ui";
import { downloadCsv } from "@/components/dashboard/table-kit";
import { Field, Select, inputClass } from "@/components/dashboard/form-kit";

/**
 * Every export the console offers, driven off one already-loaded dataset.
 *
 * The reports are built on the client from data the page already fetched, so
 * choosing a date range or a report is instant and never re-queries. Each
 * definition declares its own columns and row builder, which keeps adding a new
 * report to a single object rather than a new route.
 */
export function ReportBuilder({ datasets, companyName }) {
  const [reportKey, setReportKey] = useState("portfolio");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const REPORTS = useMemo(
    () => ({
      portfolio: {
        label: "Portfolio register",
        note: "Every placement with its term, rate, projected profit and current standing.",
        head: [
          "Reference", "Customer", "Email", "Vehicle", "Principal", "Term (months)", "Start", "Maturity",
          "Payout", "Rollover", "Lifecycle", "Monthly profit", "Total profit", "Paid to date", "Outstanding",
        ],
        rows: datasets.portfolio,
        dateIndex: 6,
        total: (rows) => rows.reduce((sum, row) => sum + Number(row[4] || 0), 0),
      },
      ledger: {
        label: "Cash ledger",
        note: "Every recorded money movement, in and out, with its settlement detail.",
        head: ["Date", "Customer", "Placement", "Kind", "Direction", "Amount", "Status", "Method", "Reference", "Period", "Recorded by"],
        rows: datasets.ledger,
        dateIndex: 0,
        total: (rows) =>
          rows.reduce((sum, row) => sum + (row[4] === "in" ? Number(row[5] || 0) : -Number(row[5] || 0)), 0),
      },
      arrears: {
        label: "Arrears report",
        note: "Scheduled payouts that have fallen due and are not covered by the ledger.",
        head: ["Customer", "Vehicle", "Schedule month", "Due date", "Profit due", "Principal due", "Paid", "Outstanding", "Days late"],
        rows: datasets.arrears,
        dateIndex: 3,
        total: (rows) => rows.reduce((sum, row) => sum + Number(row[7] || 0), 0),
      },
      customers: {
        label: "Customer register",
        note: "The full customer book with contact details, KYC standing and capital placed.",
        head: ["Customer", "Email", "Phone", "State", "ID type", "ID number", "KYC status", "Risk", "PEP", "Placements", "Capital", "Joined"],
        rows: datasets.customers,
        dateIndex: 11,
        total: (rows) => rows.reduce((sum, row) => sum + Number(row[10] || 0), 0),
      },
      maturities: {
        label: "Maturity schedule",
        note: "Principal and profit falling due, ordered by maturity date.",
        head: ["Customer", "Vehicle", "Principal", "Profit at maturity", "Total due", "Maturity date", "Lifecycle"],
        rows: datasets.maturities,
        dateIndex: 5,
        total: (rows) => rows.reduce((sum, row) => sum + Number(row[4] || 0), 0),
      },
      compliance: {
        label: "Compliance register",
        note: "KYC standing, document completeness and outstanding gaps per customer.",
        head: ["Customer", "Email", "KYC status", "Risk", "PEP", "File complete (%)", "Documents verified", "Outstanding gaps", "Capital at stake"],
        rows: datasets.compliance,
        dateIndex: null,
        total: (rows) => rows.reduce((sum, row) => sum + Number(row[8] || 0), 0),
      },
    }),
    [datasets]
  );

  const report = REPORTS[reportKey];

  // A blank bound means "open ended" on that side, so a single date filters
  // everything before or after it without needing both fields.
  const filtered = useMemo(() => {
    if (report.dateIndex === null || (!from && !to)) return report.rows;
    return report.rows.filter((row) => {
      const value = String(row[report.dateIndex] || "").slice(0, 10);
      if (!value) return false;
      if (from && value < from) return false;
      if (to && value > to) return false;
      return true;
    });
  }, [report, from, to]);

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `${slug(companyName)}-${reportKey}-${stamp}.csv`;

  return (
    <div className="rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]">
      <div className="grid gap-4 border-b border-[var(--dash-line)] p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Report" className="sm:col-span-2">
          <Select
            value={reportKey}
            onChange={(event) => setReportKey(event.target.value)}
            options={Object.entries(REPORTS).map(([value, entry]) => ({ value, label: entry.label }))}
          />
        </Field>
        <Field label="From" hint={report.dateIndex === null ? "This report has no date column." : undefined}>
          <input
            type="date"
            value={from}
            disabled={report.dateIndex === null}
            onChange={(event) => setFrom(event.target.value)}
            className={cn(inputClass, report.dateIndex === null && "opacity-50")}
          />
        </Field>
        <Field label="To">
          <input
            type="date"
            value={to}
            disabled={report.dateIndex === null}
            onChange={(event) => setTo(event.target.value)}
            className={cn(inputClass, report.dateIndex === null && "opacity-50")}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--dash-line)] bg-[var(--dash-raised)] px-5 py-3.5">
        <p className="text-sm text-[var(--dash-ink-2)]">{report.note}</p>
        <span className="ml-auto text-xs text-[var(--dash-muted)]">
          {filtered.length.toLocaleString()} rows · {money(report.total(filtered))}
        </span>
        <button
          type="button"
          onClick={() => downloadCsv(filename, report.head, filtered)}
          disabled={!filtered.length}
          className={buttonStyles.primary}
        >
          <Download className="size-4" />
          Export CSV
        </button>
      </div>

      {filtered.length ? (
        <div className="overflow-x-auto dash-scroll">
          <table className="w-full text-left text-sm">
            <thead className="text-xs">
              <tr className="border-b border-[var(--dash-line)] text-[var(--dash-muted)]">
                {report.head.map((heading) => (
                  <th key={heading} scope="col" className="whitespace-nowrap px-4 py-2.5 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dash-line)]">
              {filtered.slice(0, 50).map((row, index) => (
                <tr key={index} className="hover:bg-[var(--dash-page)]">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="whitespace-nowrap px-4 py-2.5 text-[var(--dash-ink-2)]">
                      {typeof cell === "number" ? cell.toLocaleString() : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 50 ? (
            <p className="border-t border-[var(--dash-line)] px-5 py-3 text-xs text-[var(--dash-muted)]">
              Showing the first 50 rows. The export contains all {filtered.length.toLocaleString()}.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="flex items-center gap-2 px-5 py-10 text-sm text-[var(--dash-muted)]">
          <FileSpreadsheet className="size-4" />
          Nothing falls in this range.
        </p>
      )}
    </div>
  );
}

function slug(value) {
  return String(value || "report").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "report";
}
