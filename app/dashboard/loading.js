/**
 * Instant loading state for dashboard navigations. Mirrors the shape of the
 * overview — header, stat row, chart pair — so the swap-in doesn't jump.
 */
export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-[var(--dash-line)]" />
        <div className="h-7 w-72 rounded bg-[var(--dash-line)]" />
      </div>

      <div className="h-52 rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]" />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]" />
        <div className="h-72 rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]" />
      </div>
    </div>
  );
}
