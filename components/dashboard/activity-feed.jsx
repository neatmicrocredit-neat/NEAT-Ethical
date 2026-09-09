import { History } from "lucide-react";

import { cn } from "@/lib/utils";
import { dateTime, relativeTime } from "@/lib/format";
import { AUDIT_ACTIONS } from "@/lib/audit";
import { EmptyState } from "@/components/dashboard/ui";

const TONE_DOT = {
  good: "var(--status-good)",
  critical: "var(--status-critical)",
  neutral: "var(--series-1)",
};

/**
 * The audit trail rendered as a timeline.
 *
 * Used both on a record's own page (scoped to that record) and on the global
 * audit screen, so it takes already-loaded entries rather than fetching.
 */
export function ActivityFeed({ entries = [], showEntity = false, className, emptyDescription }) {
  if (!entries.length) {
    return (
      <EmptyState
        icon={History}
        title="Nothing recorded yet"
        description={emptyDescription || "Changes made from the console will appear here."}
      />
    );
  }

  return (
    <ol className={cn("divide-y divide-[var(--dash-line)]", className)}>
      {entries.map((entry) => {
        const action = AUDIT_ACTIONS[entry.action] || AUDIT_ACTIONS.update;
        const changes = entry.changes && typeof entry.changes === "object" ? Object.entries(entry.changes) : [];

        return (
          <li key={entry.id} className="flex gap-3 px-5 py-3.5">
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full"
              style={{ background: TONE_DOT[action.tone] || TONE_DOT.neutral }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[var(--dash-ink)]">
                <span className="font-medium">{action.label}</span>
                {showEntity && entry.entity_label ? (
                  <span className="text-[var(--dash-ink-2)]"> · {entry.entity_label}</span>
                ) : null}
              </p>
              {entry.summary ? <p className="mt-0.5 text-xs text-[var(--dash-ink-2)]">{entry.summary}</p> : null}

              {/* Only field-level diffs are worth unfolding; a whole-record
                  snapshot would bury the one line that changed. */}
              {changes.length && changes.length <= 6 ? (
                <ul className="mt-1.5 space-y-0.5">
                  {changes.map(([field, change]) =>
                    change && typeof change === "object" && "from" in change ? (
                      <li key={field} className="text-[11px] text-[var(--dash-muted)]">
                        <span className="font-medium text-[var(--dash-ink-2)]">{humanise(field)}</span>{" "}
                        <span className="line-through">{display(change.from)}</span> → {display(change.to)}
                      </li>
                    ) : null
                  )}
                </ul>
              ) : null}

              <p className="mt-1 text-[11px] text-[var(--dash-muted)]">
                <span title={dateTime(entry.created_at)}>{relativeTime(entry.created_at)}</span>
                {entry.actor ? <> · {entry.actor}</> : null}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function humanise(field) {
  return String(field).replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function display(value) {
  if (value === null || value === undefined || value === "") return "empty";
  const text = String(value);
  return text.length > 40 ? `${text.slice(0, 40)}…` : text;
}
