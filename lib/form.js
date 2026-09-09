/**
 * Shared FormData readers for the console's Server Actions.
 *
 * Every action returns the same `{ ok, error, message }` shape so a single
 * client-side banner can render the result of any of them.
 */

export const ok = (message, extra = {}) => ({ ok: true, error: null, message, ...extra });
export const fail = (error) => ({ ok: false, error, message: null });

/** Trimmed string, or null for an empty field — never an empty string. */
export function text(formData, field) {
  const value = formData.get(field);
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

/** Tolerates the grouped digits and currency symbols an operator types. */
export function number(formData, field) {
  const raw = text(formData, field);
  if (raw === null) return null;
  const parsed = Number(String(raw).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function integer(formData, field) {
  const value = number(formData, field);
  return value === null ? null : Math.trunc(value);
}

/** Checkbox semantics: present and truthy, in either the HTML or JSON spelling. */
export function bool(formData, field) {
  const value = formData.get(field);
  return value === "on" || value === "true" || value === true;
}

/** ISO date (YYYY-MM-DD), or null. Rejects anything unparseable. */
export function date(formData, field) {
  const raw = text(formData, field);
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : raw.slice(0, 10);
}

/** Constrain a field to a known set, falling back rather than writing garbage. */
export function choice(formData, field, allowed, fallback = null) {
  const raw = text(formData, field);
  if (!raw) return fallback;
  const list = Array.isArray(allowed) ? allowed : Object.keys(allowed);
  return list.includes(raw) ? raw : fallback;
}

/** Pull a whole record out of a form in one call. */
export function fields(formData, names) {
  return Object.fromEntries(names.map((name) => [name, text(formData, name)]));
}
