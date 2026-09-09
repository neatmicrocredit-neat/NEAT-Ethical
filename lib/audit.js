import { cache } from "react";

import { createSupabaseServerClient, isMissingTable } from "@/lib/supabase-server";

export const AUDIT_TABLE = "audit_log";

export const AUDIT_ACTIONS = {
  create: { key: "create", label: "Created", tone: "good" },
  update: { key: "update", label: "Updated", tone: "neutral" },
  delete: { key: "delete", label: "Deleted", tone: "critical" },
  approve: { key: "approve", label: "Approved", tone: "good" },
  reject: { key: "reject", label: "Rejected", tone: "critical" },
  transition: { key: "transition", label: "Status changed", tone: "neutral" },
  verify: { key: "verify", label: "Verified", tone: "good" },
  send: { key: "send", label: "Sent", tone: "neutral" },
  sign_in: { key: "sign_in", label: "Signed in", tone: "neutral" },
};

export const AUDIT_ENTITIES = {
  customer: "Customer",
  investment: "Placement",
  transaction: "Transaction",
  document: "Document",
  task: "Task",
  team: "Team",
  message: "Message",
  settings: "Settings",
};

/**
 * Write one line of history.
 *
 * Deliberately swallows its own failures: an audit write must never be the
 * reason a legitimate mutation reports an error back to the operator. A missing
 * table (migration not yet applied) is silent; anything else is logged for the
 * server operator but still not surfaced.
 */
export async function recordAudit({ actor, action, entity, entityId, entityLabel, summary, changes } = {}) {
  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from(AUDIT_TABLE).insert({
      actor: actor || null,
      action: action || "update",
      entity: entity || "settings",
      entity_id: entityId === null || entityId === undefined ? null : String(entityId),
      entity_label: entityLabel || null,
      summary: summary || null,
      changes: changes || null,
    });
    if (error && !isMissingTable(error)) console.error("Audit write failed:", error);
  } catch (error) {
    console.error("Audit write threw:", error);
  }
}

/**
 * Field-level diff for the `changes` column.
 *
 * Only keys present in `next` are compared, so a partial patch does not report
 * every untouched column as cleared. Values are stringified for a stable
 * comparison — the ledger stores numerics that arrive as strings from PostgREST.
 */
export function diff(previous = {}, next = {}) {
  const changes = {};
  for (const [key, value] of Object.entries(next)) {
    const before = previous?.[key] ?? null;
    const after = value ?? null;
    if (String(before ?? "") === String(after ?? "")) continue;
    changes[key] = { from: before, to: after };
  }
  return Object.keys(changes).length ? changes : null;
}

export const loadAuditLog = cache(async ({ limit = 500, entity, entityId, actor } = {}) => {
  const supabase = createSupabaseServerClient();
  let query = supabase.from(AUDIT_TABLE).select("*").order("created_at", { ascending: false }).limit(limit);

  if (entity) query = query.eq("entity", entity);
  if (entityId !== undefined && entityId !== null) query = query.eq("entity_id", String(entityId));
  if (actor) query = query.eq("actor", actor);

  const { data, error } = await query;
  if (error) {
    if (isMissingTable(error)) return { entries: [], missing: true, error: null };
    console.error("Failed to load audit log:", error);
    return { entries: [], missing: false, error };
  }
  return { entries: data || [], missing: false, error: null };
});

/** Recent history for one record, shown inline on its detail page. */
export const loadAuditFor = cache(async (entity, entityId, limit = 25) => {
  const { entries } = await loadAuditLog({ entity, entityId, limit });
  return entries;
});
