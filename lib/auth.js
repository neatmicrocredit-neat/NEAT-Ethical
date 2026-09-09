import { cookies } from "next/headers";

import { can, loadMember, roleOf } from "@/lib/team";

/**
 * Server Actions are reachable by direct POST, not just through the UI, so
 * every mutation re-checks the session rather than trusting proxy.js.
 *
 * NOTE: the current session is the same `auth=true` cookie proxy.js checks,
 * which the login page sets from the browser after a Supabase sign-in. It
 * proves someone completed the sign-in flow, not which admin they are. Moving
 * to a Supabase session cookie is the upgrade path; every call site here
 * already awaits these helpers, so only this file changes.
 *
 * What the cookie *can* tell us is which email signed in, and that is enough to
 * look the operator up in `team_members` and apply their role. Authentication is
 * therefore still cookie-deep, but authorisation is real.
 */
export async function requireAdmin() {
  const store = await cookies();
  if (store.get("auth")?.value !== "true") {
    throw new Error("Not authorised. Sign in again to continue.");
  }
  return { email: readEmail(store) };
}

export async function currentAdmin() {
  const store = await cookies();
  if (store.get("auth")?.value !== "true") return null;
  return { email: readEmail(store) };
}

/** The signed-in operator with their team record and role resolved. */
export async function currentMember() {
  const admin = await currentAdmin();
  if (!admin) return null;
  const { member, unlisted, bootstrap } = await loadMember(admin.email);
  return { ...member, email: member?.email || admin.email, unlisted, bootstrap };
}

/**
 * Gate a mutation on a capability rather than on "is signed in".
 *
 * Throws with a message meant to be shown to the operator, because every action
 * in the console already funnels thrown errors into its own error banner.
 */
export async function requireCapability(capability) {
  await requireAdmin();
  const member = await currentMember();

  if (!member || !can(member, capability)) {
    throw new Error(
      member?.status === "suspended"
        ? "Your console access has been suspended."
        : `Your role (${roleOf(member).label}) cannot ${describe(capability)}.`
    );
  }
  return member;
}

/** Non-throwing check, for hiding controls the operator cannot use. */
export async function hasCapability(capability) {
  const member = await currentMember();
  return can(member, capability);
}

function describe(capability) {
  const [subject, verb] = String(capability).split(".");
  const verbs = {
    read: "view",
    write: "change",
    approve: "approve",
    verify: "verify",
    export: "export",
  };
  return `${verbs[verb] || verb} ${subject}`;
}

function readEmail(store) {
  const raw = store.get("admin_email")?.value;
  if (!raw) return null;
  try {
    return decodeURIComponent(raw) || null;
  } catch {
    return raw;
  }
}
