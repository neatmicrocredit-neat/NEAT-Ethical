import { toDate } from "@/lib/format";

/**
 * The two products the business actually sells. Rates mirror the public
 * calculator in components/investment-calculator.jsx — keep them in sync.
 */
export const VEHICLES = {
  ethical: {
    key: "ethical",
    label: "Neat Ethical",
    short: "Ethical",
    monthlyRate: 0.02,
    annualRate: 0.24,
    note: "Product placement. Lower risk than the lending pool.",
  },
  funding: {
    key: "funding",
    label: "Neat Funding",
    short: "Funding",
    monthlyRate: 0.05,
    annualRate: 0.6,
    note: "SME lending pool. Carries repayment risk.",
  },
};

export const VEHICLE_KEYS = Object.keys(VEHICLES);
export const PAYOUT_SCHEDULES = { monthly: "Monthly", maturity: "At maturity" };
export const DEFAULT_TERM_MONTHS = 12;

export const STATUSES = {
  pending: { key: "pending", label: "Pending", note: "Start date is in the future" },
  active: { key: "active", label: "Active", note: "Currently earning" },
  matured: { key: "matured", label: "Matured", note: "Term has ended" },
};

/**
 * Early records wrote the vehicle into `other_instructions` instead of the
 * `vehicle` column, so fall back to parsing that text before defaulting.
 */
export function resolveVehicle(investment) {
  const raw = String(investment?.vehicle ?? "").trim().toLowerCase();
  if (VEHICLES[raw]) return VEHICLES[raw];

  const notes = String(investment?.other_instructions ?? "").toLowerCase();
  if (notes.includes("neat funding") || notes.includes("vehicle: funding")) return VEHICLES.funding;
  if (notes.includes("neat ethical") || notes.includes("vehicle: ethical")) return VEHICLES.ethical;

  return VEHICLES.ethical;
}

export function resolveSchedule(investment) {
  const raw = String(investment?.payout_schedule ?? "").trim().toLowerCase();
  return raw === "maturity" ? "maturity" : "monthly";
}

export function startOf(investment) {
  return toDate(investment?.start_date) || toDate(investment?.created_at);
}

export function endOf(investment) {
  const explicit = toDate(investment?.end_date);
  if (explicit) return explicit;
  const start = startOf(investment);
  if (!start) return null;
  return addMonths(start, DEFAULT_TERM_MONTHS);
}

export function termMonths(investment) {
  const start = startOf(investment);
  const end = endOf(investment);
  if (!start || !end) return DEFAULT_TERM_MONTHS;
  const months = Math.round((end.getTime() - start.getTime()) / (30.44 * 24 * 3600e3));
  return Math.max(1, months);
}

/** pending | active | matured, derived from the term dates. */
export function deriveStatus(investment, now = new Date()) {
  const start = startOf(investment);
  const end = endOf(investment);
  if (start && start.getTime() > now.getTime()) return "pending";
  if (end && end.getTime() < now.getTime()) return "matured";
  return "active";
}

/**
 * Month-by-month projection for one placement.
 * Rollover retains profit (it compounds and settles at maturity) and therefore
 * overrides a `monthly` payout schedule.
 */
export function projectInvestment(investment) {
  const principal = Math.max(0, Number(investment?.amount) || 0);
  const vehicle = resolveVehicle(investment);
  const months = termMonths(investment);
  const rollover = Boolean(investment?.rollover);
  const schedule = rollover ? "maturity" : resolveSchedule(investment);
  const rate = vehicle.monthlyRate;
  const start = startOf(investment);

  const rows = [];
  let balance = principal;
  let cumulativeProfit = 0;
  let cumulativePaid = 0;
  let principalReturned = 0;

  for (let month = 1; month <= months; month += 1) {
    const profit = rollover ? balance * rate : principal * rate;
    cumulativeProfit += profit;
    if (rollover) balance += profit;

    const isFinal = month === months;
    const profitPaid = schedule === "monthly" ? profit : isFinal ? cumulativeProfit - cumulativePaid : 0;
    const principalPaid = isFinal ? principal : 0;
    cumulativePaid += profitPaid;
    principalReturned += principalPaid;

    rows.push({
      month,
      date: start ? addMonths(start, month) : null,
      profit,
      profitPaid,
      principalPaid,
      cumulativeProfit,
      // What the customer still has with NEAT after this month settles.
      balance: principal - principalReturned + cumulativeProfit - cumulativePaid,
    });
  }

  return {
    principal,
    vehicle,
    months,
    rollover,
    schedule,
    monthlyProfit: principal * rate,
    totalProfit: cumulativeProfit,
    maturityValue: principal + (schedule === "monthly" ? 0 : cumulativeProfit),
    totalReturned: principal + cumulativeProfit,
    rows,
  };
}

/** Roll a set of placements into the numbers a portfolio card needs. */
export function summarizeBook(investments = [], now = new Date()) {
  const summary = {
    count: investments.length,
    principal: 0,
    activePrincipal: 0,
    maturedPrincipal: 0,
    pendingPrincipal: 0,
    projectedProfit: 0,
    outstandingProfit: 0,
    monthlyObligation: 0,
    byStatus: { pending: 0, active: 0, matured: 0 },
    byVehicle: {},
    maturingSoon: [],
    maturingSoonValue: 0,
  };

  const horizon = addDays(now, 30);

  for (const investment of investments) {
    const projection = projectInvestment(investment);
    const status = deriveStatus(investment, now);
    const vehicleKey = projection.vehicle.key;

    summary.principal += projection.principal;
    summary.projectedProfit += projection.totalProfit;
    summary.byStatus[status] += 1;
    summary.byVehicle[vehicleKey] = (summary.byVehicle[vehicleKey] || 0) + projection.principal;

    if (status === "active") summary.activePrincipal += projection.principal;
    if (status === "pending") summary.pendingPrincipal += projection.principal;
    if (status === "matured") summary.maturedPrincipal += projection.principal;

    if (status !== "matured") {
      summary.outstandingProfit += projection.totalProfit;
      if (projection.schedule === "monthly") summary.monthlyObligation += projection.monthlyProfit;
    }

    const end = endOf(investment);
    if (status === "active" && end && end <= horizon) {
      summary.maturingSoon.push(investment);
      summary.maturingSoonValue += projection.principal + (projection.schedule === "monthly" ? 0 : projection.totalProfit);
    }
  }

  summary.underManagement = summary.activePrincipal + summary.pendingPrincipal;
  summary.averageTicket = summary.count ? summary.principal / summary.count : 0;
  return summary;
}

/* ------------------------------------------------------------------ dates */

export function addMonths(date, months) {
  const d = new Date(date.getTime());
  const targetDay = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + months);
  // Clamp Jan 31 + 1 month to Feb 28/29 rather than spilling into March.
  if (d.getUTCDate() < targetDay) d.setUTCDate(0);
  return d;
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 3600e3);
}

export function monthKey(date) {
  const d = toDate(date);
  if (!d) return null;
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Axis tick label. January carries its year so a multi-year axis never shows
 * two identical "Jan" ticks.
 */
export function monthLabel(key) {
  const [year, month] = String(key).split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, 1));
  const short = d.toLocaleDateString("en-NG", { month: "short", timeZone: "UTC" });
  return month === 1 ? `${short} ${String(year).slice(2)}` : short;
}

export function monthLabelLong(key) {
  const [year, month] = String(key).split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, 1));
  return d.toLocaleDateString("en-NG", { month: "short", year: "numeric", timeZone: "UTC" });
}

/** Inclusive list of month keys, oldest first, ending on `end`. */
export function monthRange(end, count) {
  const anchor = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  const keys = [];
  for (let i = count - 1; i >= 0; i -= 1) keys.push(monthKey(addMonths(anchor, -i)));
  return keys;
}

/** Forward-looking month keys, starting with the month containing `start`. */
export function forwardMonths(start, count) {
  const anchor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const keys = [];
  for (let i = 0; i < count; i += 1) keys.push(monthKey(addMonths(anchor, i)));
  return keys;
}
