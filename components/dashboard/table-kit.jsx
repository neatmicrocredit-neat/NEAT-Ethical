"use client";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

/** One filter row above the table — never per-column controls. */
export function Toolbar({ search, onSearch, placeholder, children, onExport, resultLabel }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--dash-line)] px-4 py-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--dash-muted)]" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-xl border border-[var(--dash-line)] bg-[var(--dash-page)] py-2 pl-9 pr-8 text-sm outline-none transition placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-accent)] focus:bg-[var(--dash-surface)]"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearch("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[var(--dash-muted)] hover:bg-[var(--dash-line)]"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {children}

      {resultLabel ? <span className="text-xs text-[var(--dash-muted)]">{resultLabel}</span> : null}

      {onExport ? (
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--dash-line)] px-3 py-2 text-xs font-medium text-[var(--dash-ink-2)] transition hover:bg-[var(--dash-page)]"
        >
          <Download className="size-3.5" />
          CSV
        </button>
      ) : null}
    </div>
  );
}

export function FilterChips({ options, value, onChange, label }) {
  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label={label}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
              active
                ? "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]"
                : "text-[var(--dash-ink-2)] hover:bg-[var(--dash-page)]"
            )}
          >
            {option.label}
            {option.count !== undefined ? (
              <span className="ml-1.5 tabular-nums text-[var(--dash-muted)]">{option.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function SortHeader({ column, sort, onSort, children, align = "left", className }) {
  const active = sort.key === column;
  const Icon = active && sort.direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <th scope="col" className={cn("px-4 py-2.5 font-medium", align === "right" && "text-right", className)}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1 transition hover:text-[var(--dash-ink)]",
          align === "right" && "flex-row-reverse",
          active ? "text-[var(--dash-ink)]" : "text-[var(--dash-muted)]"
        )}
      >
        {children}
        <Icon className={cn("size-3", active ? "opacity-100" : "opacity-0")} />
      </button>
    </th>
  );
}

export function Pagination({ page, pageCount, total, onPage, pageSize }) {
  if (pageCount <= 1) {
    return (
      <div className="flex items-center justify-end border-t border-[var(--dash-line)] px-4 py-3 text-xs text-[var(--dash-muted)]">
        {total.toLocaleString()} record{total === 1 ? "" : "s"}
      </div>
    );
  }

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[var(--dash-line)] px-4 py-3">
      <p className="text-xs text-[var(--dash-muted)]">
        {first.toLocaleString()}–{last.toLocaleString()} of {total.toLocaleString()}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="rounded-lg border border-[var(--dash-line)] p-1.5 text-[var(--dash-ink-2)] transition hover:bg-[var(--dash-page)] disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="px-2 text-xs tabular-nums text-[var(--dash-ink-2)]">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="rounded-lg border border-[var(--dash-line)] p-1.5 text-[var(--dash-ink-2)] transition hover:bg-[var(--dash-page)] disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** Client-side CSV export of exactly the rows currently in view. */
export function downloadCsv(filename, head, rows) {
  const escape = (cell) => {
    const value = cell === null || cell === undefined ? "" : String(cell);
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  };
  const csv = [head, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function compare(a, b, direction) {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  const result = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));
  return direction === "asc" ? result : -result;
}
