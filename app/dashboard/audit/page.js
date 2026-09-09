import Link from "next/link";
import { notFound } from "next/navigation";

import { AUDIT_ACTIONS, AUDIT_ENTITIES, loadAuditLog } from "@/lib/audit";
import { hasCapability } from "@/lib/auth";
import { relativeTime } from "@/lib/format";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PageHeader, Panel, PanelHeader, SetupNotice, StatCard } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Audit trail · Admin console" };

const ENTITY_TABS = [{ key: "", label: "Everything" }, ...Object.entries(AUDIT_ENTITIES).map(([key, label]) => ({ key, label }))];

export default async function AuditPage({ searchParams }) {
  const { entity = "", actor = "" } = await searchParams;

  if (!(await hasCapability("audit.read"))) notFound();

  const { entries, missing } = await loadAuditLog({ entity: entity || undefined, actor: actor || undefined, limit: 400 });

  if (missing) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Governance" title="Audit trail" description="Every change made from the console." />
        <SetupNotice feature="The audit trail" migration="supabase/migrations/0003_operations.sql" tables={["audit_log"]} />
      </div>
    );
  }

  const actors = [...new Set(entries.map((entry) => entry.actor).filter(Boolean))];
  const today = entries.filter((entry) => new Date(entry.created_at).toDateString() === new Date().toDateString());
  const destructive = entries.filter((entry) => entry.action === "delete" || entry.action === "reject");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Audit trail"
        description="An append-only record of every change made from the console — who did it, to what, and when."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Entries in view" value={entries.length.toLocaleString()} hint="Most recent first, capped at 400" />
        <StatCard label="Today" value={today.length.toLocaleString()} hint="Changes made since midnight" />
        <StatCard label="Operators" value={actors.length.toLocaleString()} hint="Distinct people in this view" />
        <StatCard
          label="Deletions and rejections"
          value={destructive.length.toLocaleString()}
          hint="The changes worth a second look"
          upIsGood={false}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {ENTITY_TABS.map((tab) => {
          const active = entity === tab.key;
          const href = tab.key ? `/dashboard/audit?entity=${tab.key}` : "/dashboard/audit";
          return (
            <Link
              key={tab.key || "all"}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-lg bg-[var(--dash-accent-soft)] px-2.5 py-1.5 text-xs font-medium text-[var(--dash-accent)]"
                  : "rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--dash-ink-2)] transition hover:bg-[var(--dash-page)]"
              }
            >
              {tab.label}
            </Link>
          );
        })}

        {actor ? (
          <Link href={entity ? `/dashboard/audit?entity=${entity}` : "/dashboard/audit"} className={cnGhost}>
            Clear “{actor}”
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <PanelHeader
            title="History"
            description={entity ? `Changes to ${AUDIT_ENTITIES[entity]?.toLowerCase() || entity} records.` : "Every entity, newest first."}
          />
          <ActivityFeed entries={entries} showEntity emptyDescription="No changes have been recorded for this filter yet." />
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="By operator" description="Who has been making changes." />
            <ul className="divide-y divide-[var(--dash-line)]">
              {actors.slice(0, 12).map((name) => {
                const count = entries.filter((entry) => entry.actor === name).length;
                const last = entries.find((entry) => entry.actor === name);
                return (
                  <li key={name} className="flex items-center gap-3 px-5 py-3">
                    <Link
                      href={`/dashboard/audit?actor=${encodeURIComponent(name)}${entity ? `&entity=${entity}` : ""}`}
                      className="min-w-0 flex-1"
                    >
                      <span className="block truncate text-sm text-[var(--dash-ink)]">{name}</span>
                      <span className="block text-[11px] text-[var(--dash-muted)]">last {relativeTime(last?.created_at)}</span>
                    </Link>
                    <span className="shrink-0 text-xs tabular-nums text-[var(--dash-ink-2)]">{count}</span>
                  </li>
                );
              })}
              {actors.length ? null : <li className="px-5 py-4 text-sm text-[var(--dash-muted)]">No operators recorded yet.</li>}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="By action" description="What kind of change was made." />
            <ul className="divide-y divide-[var(--dash-line)]">
              {Object.values(AUDIT_ACTIONS).map((action) => {
                const count = entries.filter((entry) => entry.action === action.key).length;
                if (!count) return null;
                return (
                  <li key={action.key} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <span className="text-sm text-[var(--dash-ink-2)]">{action.label}</span>
                    <span className="text-xs tabular-nums text-[var(--dash-ink)]">{count}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

const cnGhost = "rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--dash-muted)] transition hover:bg-[var(--dash-page)]";
