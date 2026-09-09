import { cache } from "react";

import { createSupabaseServerClient, isMissingTable } from "@/lib/supabase-server";

export const TEAM_TABLE = "team_members";

/**
 * Roles are ordered by reach, and every permission below is expressed as the
 * lowest role that holds it. That keeps the matrix readable: if you can approve,
 * you can obviously also read.
 *
 * `owner` is deliberately the only role that can change roles, so an admin
 * cannot quietly promote themselves.
 */
export const ROLES = {
  owner: { key: "owner", rank: 4, label: "Owner", note: "Full control, including team and settings." },
  admin: { key: "admin", rank: 3, label: "Administrator", note: "Runs the book: approvals, payouts, records." },
  analyst: { key: "analyst", rank: 2, label: "Analyst", note: "Reads everything, exports, no money movement." },
  support: { key: "support", rank: 1, label: "Support", note: "Customer records and correspondence only." },
};

export const ROLE_KEYS = Object.keys(ROLES);

export const MEMBER_STATUSES = {
  active: { key: "active", label: "Active" },
  invited: { key: "invited", label: "Invited" },
  suspended: { key: "suspended", label: "Suspended" },
};

/** capability -> minimum role rank that holds it. */
const PERMISSIONS = {
  "customers.read": 1,
  "customers.write": 1,
  "messages.write": 1,
  "tasks.write": 1,
  "documents.read": 1,
  "documents.write": 1,
  "investments.read": 1,
  "analytics.read": 2,
  "reports.export": 2,
  "audit.read": 2,
  "investments.write": 3,
  "investments.approve": 3,
  "documents.verify": 3,
  "ledger.read": 2,
  "ledger.write": 3,
  "customers.verify": 3,
  "team.read": 3,
  "team.write": 4,
  "settings.write": 4,
};

export const CAPABILITIES = Object.keys(PERMISSIONS);

export function roleOf(member) {
  const raw = String(member?.role ?? "").trim().toLowerCase();
  return ROLES[raw] || ROLES.support;
}

/**
 * Does this member hold this capability?
 *
 * A suspended member holds nothing regardless of role. An unknown capability is
 * denied rather than allowed, so a typo fails closed.
 */
export function can(member, capability) {
  if (!member) return false;
  if (member.status === "suspended") return false;
  const required = PERMISSIONS[capability];
  if (!required) return false;
  return roleOf(member).rank >= required;
}

export function capabilitiesFor(role) {
  const rank = ROLES[role]?.rank ?? 0;
  return CAPABILITIES.filter((capability) => rank >= PERMISSIONS[capability]);
}

/* ------------------------------------------------------------------ loading */

export const loadTeam = cache(async () => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TEAM_TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTable(error)) return { members: [], missing: true, error: null };
    console.error("Failed to load team:", error);
    return { members: [], missing: false, error };
  }
  return { members: data || [], missing: false, error: null };
});

/**
 * Resolve the signed-in admin's console identity.
 *
 * The sign-in cookie proves someone completed the Supabase sign-in; this looks
 * them up in `team_members` to find out what they may do. Two deliberate
 * fallbacks keep an un-migrated or un-seeded project usable:
 *
 *   - table missing  -> treat as owner, because the roles feature is not on yet
 *   - table empty    -> treat as owner, so the first operator can seed the team
 *
 * Once at least one member exists, an email that is not on the list gets the
 * lowest role rather than none, so they can still do their job while an owner
 * adds them properly.
 */
export const loadMember = cache(async (email) => {
  if (!email) return { member: null, missing: false, unlisted: true };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TEAM_TABLE)
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  if (error && isMissingTable(error)) {
    return { member: { email, role: "owner", status: "active", name: email }, missing: true, unlisted: false };
  }
  if (data) return { member: data, missing: false, unlisted: false };

  const { count } = await supabase.from(TEAM_TABLE).select("id", { count: "exact", head: true });
  const bootstrap = !count;

  return {
    member: { email, role: bootstrap ? "owner" : "support", status: "active", name: email },
    missing: false,
    unlisted: true,
    bootstrap,
  };
});

export function displayName(member) {
  return member?.name?.trim() || member?.email || "Unknown";
}
