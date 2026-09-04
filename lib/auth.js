import { cookies } from "next/headers";

/**
 * Server Actions are reachable by direct POST, not just through the UI, so
 * every mutation re-checks the session rather than trusting proxy.js.
 *
 * NOTE: the current session is the same `auth=true` cookie proxy.js checks,
 * which the login page sets from the browser after a Supabase sign-in. It
 * proves someone completed the sign-in flow, not which admin they are. Moving
 * to a Supabase session cookie (and looking the user up in `admin_users`) is
 * the upgrade path; every call site here already awaits this helper, so only
 * this function changes.
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

function readEmail(store) {
  const raw = store.get("admin_email")?.value;
  if (!raw) return null;
  try {
    return decodeURIComponent(raw) || null;
  } catch {
    return raw;
  }
}
