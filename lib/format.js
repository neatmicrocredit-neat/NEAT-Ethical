const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Full naira figure, e.g. ₦1,250,000. Use in tables and detail rows. */
export function money(value) {
  return NGN.format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

/** Abbreviated naira, e.g. ₦1.3m. Use on axis ticks and stat tiles. */
export function compactMoney(value) {
  const n = Number(value) || 0;
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${sign}₦${trim(abs / 1_000_000_000)}b`;
  if (abs >= 1_000_000) return `${sign}₦${trim(abs / 1_000_000)}m`;
  if (abs >= 1_000) return `${sign}₦${trim(abs / 1_000)}k`;
  return `${sign}₦${Math.round(abs)}`;
}

function trim(n) {
  return n >= 100 ? Math.round(n) : Number(n.toFixed(n >= 10 ? 0 : 1));
}

export function compactNumber(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1_000_000) return `${trim(n / 1_000_000)}m`;
  if (Math.abs(n) >= 1_000) return `${trim(n / 1_000)}k`;
  return String(Math.round(n));
}

export function percent(value, digits = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n >= 0 ? "" : "-"}${Math.abs(n).toFixed(digits)}%`;
}

export function shortDate(value) {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function dayMonth(value) {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export function dateTime(value) {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

/** "3 days ago" / "in 2 months". Returns "—" for unparseable input. */
export function relativeTime(value) {
  const d = toDate(value);
  if (!d) return "—";
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units = [
    ["year", 365 * 24 * 3600e3],
    ["month", 30 * 24 * 3600e3],
    ["day", 24 * 3600e3],
    ["hour", 3600e3],
    ["minute", 60e3],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return "just now";
}

export function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function fullName(customer) {
  if (!customer) return "Unknown customer";
  return [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email || "Unnamed";
}

export function initials(customer) {
  const name = fullName(customer);
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
