"use client";

import { TriangleAlert } from "lucide-react";

import { buttonStyles } from "@/components/dashboard/ui";

export default function DashboardError({ error, reset }) {
  return (
    <div className="rounded-2xl bg-[var(--dash-surface)] p-8 ring-1 ring-[var(--dash-line)]">
      <span className="grid size-11 place-items-center rounded-full bg-[#fdeced] text-[var(--status-critical)]">
        <TriangleAlert className="size-5" />
      </span>
      <h1 className="mt-4 text-lg font-semibold text-[var(--dash-ink)]">Something went wrong loading this view</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--dash-ink-2)]">
        The dashboard reads live from Supabase, so this is usually a connection or permissions problem rather than
        missing data.
      </p>
      {error?.message ? (
        <p className="mt-3 rounded-xl bg-[var(--dash-page)] px-3.5 py-2.5 font-mono text-xs text-[var(--dash-ink-2)]">
          {error.message}
        </p>
      ) : null}
      <button type="button" onClick={reset} className={`${buttonStyles.primary} mt-5`}>
        Try again
      </button>
    </div>
  );
}
