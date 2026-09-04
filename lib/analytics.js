import {
  VEHICLES,
  VEHICLE_KEYS,
  addMonths,
  deriveStatus,
  endOf,
  forwardMonths,
  monthKey,
  monthLabel,
  monthLabelLong,
  monthRange,
  projectInvestment,
  resolveSchedule,
  resolveVehicle,
  startOf,
  summarizeBook,
  termMonths,
} from "@/lib/investments";
import { fullName } from "@/lib/format";

/** Index the book by customer so every page can look up a portfolio in O(1). */
export function groupByCustomer(customers = [], investments = [], now = new Date()) {
  const byId = new Map();
  for (const customer of customers) {
    byId.set(String(customer.id), { customer, investments: [] });
  }
  const orphaned = [];
  for (const investment of investments) {
    const entry = byId.get(String(investment.customer_id));
    if (entry) entry.investments.push(investment);
    else orphaned.push(investment);
  }
  for (const entry of byId.values()) {
    entry.summary = summarizeBook(entry.investments, now);
    entry.status = portfolioStatus(entry.investments, now);
  }
  return { byId, orphaned };
}

function portfolioStatus(investments, now) {
  if (!investments.length) return "none";
  const statuses = investments.map((i) => deriveStatus(i, now));
  if (statuses.includes("active")) return "active";
  if (statuses.includes("pending")) return "pending";
  return "matured";
}

/** Capital placed per month, by start date (falls back to created_at). */
export function capitalInflow(investments, months, now = new Date()) {
  const keys = monthRange(now, months);
  const buckets = new Map(keys.map((k) => [k, { key: k, label: monthLabel(k), full: monthLabelLong(k), value: 0, count: 0 }]));
  for (const investment of investments) {
    const key = monthKey(startOf(investment));
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.value += Number(investment.amount) || 0;
    bucket.count += 1;
  }
  return keys.map((k) => buckets.get(k));
}

/** Principal under management at the close of each month. */
export function bookValueTrend(investments, months, now = new Date()) {
  const keys = monthRange(now, months);
  return keys.map((key) => {
    const [year, month] = key.split("-").map(Number);
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = addMonths(monthStart, 1);
    let value = 0;
    let count = 0;
    for (const investment of investments) {
      const start = startOf(investment);
      const end = endOf(investment);
      if (!start || start >= monthEnd) continue;
      if (end && end < monthStart) continue;
      value += Number(investment.amount) || 0;
      count += 1;
    }
    return { key, label: monthLabel(key), full: monthLabelLong(key), value, count };
  });
}

export function newCustomersTrend(customers, months, now = new Date()) {
  const keys = monthRange(now, months);
  const buckets = new Map(keys.map((k) => [k, { key: k, label: monthLabel(k), full: monthLabelLong(k), value: 0 }]));
  for (const customer of customers) {
    const bucket = buckets.get(monthKey(customer.created_at));
    if (bucket) bucket.value += 1;
  }
  return keys.map((k) => buckets.get(k));
}

/**
 * Cash the business must pay out over the next `months`, split into recurring
 * profit payments and principal returning at maturity.
 */
export function payoutForecast(investments, months, now = new Date()) {
  const keys = forwardMonths(now, months);
  const buckets = new Map(
    keys.map((k) => [k, { key: k, label: monthLabel(k), full: monthLabelLong(k), values: { profit: 0, principal: 0 }, value: 0 }])
  );
  for (const investment of investments) {
    if (deriveStatus(investment, now) === "matured") continue;
    for (const row of projectInvestment(investment).rows) {
      if (!row.date || row.date < now) continue;
      const bucket = buckets.get(monthKey(row.date));
      if (!bucket) continue;
      bucket.values.profit += row.profitPaid;
      bucket.values.principal += row.principalPaid;
      bucket.value += row.profitPaid + row.principalPaid;
    }
  }
  return keys.map((k) => buckets.get(k));
}

/** Principal coming due per month — the refinancing/rollover conversation list. */
export function maturityLadder(investments, months, now = new Date()) {
  const keys = forwardMonths(now, months);
  const buckets = new Map(
    keys.map((k) => [k, { key: k, label: monthLabel(k), full: monthLabelLong(k), value: 0, count: 0, items: [] }])
  );
  for (const investment of investments) {
    if (deriveStatus(investment, now) === "matured") continue;
    const end = endOf(investment);
    const bucket = end && buckets.get(monthKey(end));
    if (!bucket) continue;
    bucket.value += Number(investment.amount) || 0;
    bucket.count += 1;
    bucket.items.push(investment);
  }
  return keys.map((k) => buckets.get(k));
}

export function vehicleAllocation(investments, now = new Date()) {
  const totals = Object.fromEntries(VEHICLE_KEYS.map((k) => [k, { principal: 0, count: 0, liability: 0 }]));
  for (const investment of investments) {
    if (deriveStatus(investment, now) === "matured") continue;
    const projection = projectInvestment(investment);
    const slot = totals[projection.vehicle.key];
    slot.principal += projection.principal;
    slot.count += 1;
    slot.liability += projection.totalProfit;
  }
  const total = Object.values(totals).reduce((sum, t) => sum + t.principal, 0);
  return VEHICLE_KEYS.map((key) => ({
    key,
    label: VEHICLES[key].label,
    value: totals[key].principal,
    count: totals[key].count,
    liability: totals[key].liability,
    share: total ? (totals[key].principal / total) * 100 : 0,
  }));
}

export function scheduleSplit(investments, now = new Date()) {
  const totals = { monthly: 0, maturity: 0 };
  for (const investment of investments) {
    if (deriveStatus(investment, now) === "matured") continue;
    const key = investment.rollover ? "maturity" : resolveSchedule(investment);
    totals[key] += Number(investment.amount) || 0;
  }
  const total = totals.monthly + totals.maturity;
  return [
    { key: "monthly", label: "Monthly payout", value: totals.monthly, share: total ? (totals.monthly / total) * 100 : 0 },
    { key: "maturity", label: "At maturity", value: totals.maturity, share: total ? (totals.maturity / total) * 100 : 0 },
  ];
}

const TERM_BANDS = [
  { key: "0-3", label: "≤ 3 mo", max: 3 },
  { key: "4-6", label: "4–6 mo", max: 6 },
  { key: "7-12", label: "7–12 mo", max: 12 },
  { key: "13-24", label: "13–24 mo", max: 24 },
  { key: "25+", label: "25+ mo", max: Infinity },
];

export function termDistribution(investments) {
  const buckets = TERM_BANDS.map((band) => ({ ...band, value: 0, count: 0 }));
  for (const investment of investments) {
    const months = termMonths(investment);
    const bucket = buckets.find((b) => months <= b.max);
    bucket.value += Number(investment.amount) || 0;
    bucket.count += 1;
  }
  return buckets;
}

/** Customers ranked by capital placed, with each one's share of the book. */
export function topHolders(grouped, limit = 8) {
  const rows = [];
  let total = 0;
  for (const entry of grouped.byId.values()) {
    if (!entry.summary.principal) continue;
    total += entry.summary.principal;
    rows.push({
      id: entry.customer.id,
      uuid: entry.customer.uuid,
      name: fullName(entry.customer),
      value: entry.summary.principal,
      count: entry.summary.count,
    });
  }
  rows.sort((a, b) => b.value - a.value);
  for (const row of rows) row.share = total ? (row.value / total) * 100 : 0;
  return { rows: rows.slice(0, limit), total, all: rows };
}

/**
 * Concentration risk. HHI is the sum of squared percentage shares:
 * under 1,500 is diversified, above 2,500 is concentrated.
 */
export function concentration(holders) {
  const { all, total } = holders;
  const share = (n) => (total ? (all.slice(0, n).reduce((sum, r) => sum + r.value, 0) / total) * 100 : 0);
  const hhi = all.reduce((sum, row) => sum + row.share ** 2, 0);
  return {
    top1Share: share(1),
    top5Share: share(5),
    top10Share: share(10),
    hhi,
    verdict: hhi > 2500 ? "Concentrated" : hhi > 1500 ? "Moderate" : "Diversified",
    holders: all.length,
  };
}

export function stateDistribution(grouped, limit = 8) {
  const buckets = new Map();
  for (const entry of grouped.byId.values()) {
    const state = (entry.customer.state || "Unspecified").trim();
    const bucket = buckets.get(state) || { key: state, label: state, value: 0, count: 0 };
    bucket.value += entry.summary.principal;
    bucket.count += 1;
    buckets.set(state, bucket);
  }
  return [...buckets.values()].sort((a, b) => b.value - a.value).slice(0, limit);
}

/** How many customers hold more than one placement — the repeat-business signal. */
export function repeatInvestors(grouped) {
  let withBook = 0;
  let repeat = 0;
  let placements = 0;
  for (const entry of grouped.byId.values()) {
    if (!entry.summary.count) continue;
    withBook += 1;
    placements += entry.summary.count;
    if (entry.summary.count > 1) repeat += 1;
  }
  return {
    withBook,
    repeat,
    rate: withBook ? (repeat / withBook) * 100 : 0,
    placementsPerCustomer: withBook ? placements / withBook : 0,
  };
}

/** Average ticket size per month of placement. */
export function averageTicketTrend(investments, months, now = new Date()) {
  return capitalInflow(investments, months, now).map((row) => ({
    ...row,
    value: row.count ? row.value / row.count : 0,
  }));
}

export function kycCompleteness(customers) {
  let complete = 0;
  const missing = { id: 0, photo: 0, nextOfKin: 0, address: 0 };
  for (const customer of customers) {
    const hasId = Boolean(customer.id_number && (customer.id_front_url || customer.id_back_url));
    const hasPhoto = Boolean(customer.image_url);
    const hasNok = Boolean(customer.nok_name && customer.nok_phone_number);
    const hasAddress = Boolean(customer.address && customer.state);
    if (!hasId) missing.id += 1;
    if (!hasPhoto) missing.photo += 1;
    if (!hasNok) missing.nextOfKin += 1;
    if (!hasAddress) missing.address += 1;
    if (hasId && hasPhoto && hasNok && hasAddress) complete += 1;
  }
  return {
    complete,
    total: customers.length,
    rate: customers.length ? (complete / customers.length) * 100 : 0,
    missing,
  };
}

/** Percentage change between the last two entries of a monthly series. */
export function momChange(series) {
  if (!series || series.length < 2) return null;
  const previous = series[series.length - 2].value;
  const current = series[series.length - 1].value;
  if (!previous) return current ? 100 : null;
  return ((current - previous) / previous) * 100;
}

export { VEHICLES, resolveVehicle };
