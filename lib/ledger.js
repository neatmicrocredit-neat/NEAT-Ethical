import { cache } from "react";

import { createSupabaseServerClient, isMissingTable } from "@/lib/supabase-server";
import { projectInvestment, startOf } from "@/lib/investments";
import { isDormant } from "@/lib/workflow";

export const TRANSACTIONS_TABLE = "transactions";

/**
 * The ledger's vocabulary. `direction` is fixed per kind except for
 * `adjustment`, which the operator points either way.
 */
export const TRANSACTION_KINDS = {
  deposit: {
    key: "deposit",
    label: "Deposit",
    direction: "in",
    note: "Capital received from the customer.",
    settles: false,
  },
  profit_payout: {
    key: "profit_payout",
    label: "Profit payout",
    direction: "out",
    note: "Profit paid to the customer for one period.",
    settles: true,
  },
  principal_return: {
    key: "principal_return",
    label: "Principal return",
    direction: "out",
    note: "Capital returned at maturity.",
    settles: true,
  },
  withdrawal: {
    key: "withdrawal",
    label: "Early withdrawal",
    direction: "out",
    note: "Capital released before maturity.",
    settles: true,
  },
  fee: {
    key: "fee",
    label: "Fee",
    direction: "in",
    note: "Charge retained by the business.",
    settles: false,
  },
  adjustment: {
    key: "adjustment",
    label: "Adjustment",
    direction: "out",
    note: "Manual correction. Choose the direction explicitly.",
    settles: false,
  },
};

export const TRANSACTION_KIND_KEYS = Object.keys(TRANSACTION_KINDS);

export const TRANSACTION_STATUSES = {
  pending: { key: "pending", label: "Pending", note: "Instructed, not yet confirmed." },
  cleared: { key: "cleared", label: "Cleared", note: "Confirmed against the bank." },
  failed: { key: "failed", label: "Failed", note: "The transfer did not go through." },
  cancelled: { key: "cancelled", label: "Cancelled", note: "Reversed before it settled." },
};

export const PAYMENT_METHODS = {
  bank_transfer: "Bank transfer",
  cash: "Cash",
  cheque: "Cheque",
  internal: "Internal / rollover",
};

/** The kinds that discharge a scheduled obligation. */
const SETTLING_KINDS = new Set(
  TRANSACTION_KIND_KEYS.filter((key) => TRANSACTION_KINDS[key].settles)
);

const COLUMNS =
  "id, uuid, customer_id, investment_id, kind, direction, amount, status, value_date, period_index, method, reference, bank_name, account_name, account_number, note, created_by, created_at, cleared_at";

export function directionOf(kind, fallback = "out") {
  return TRANSACTION_KINDS[kind]?.direction || fallback;
}

/** Money in is positive, money out negative — the only signing rule in here. */
export function signedAmount(transaction) {
  const amount = Math.abs(Number(transaction?.amount) || 0);
  return transaction?.direction === "in" ? amount : -amount;
}

/* ------------------------------------------------------------------ loading */

export const loadTransactions = cache(async ({ limit = 5000 } = {}) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TRANSACTIONS_TABLE)
    .select(COLUMNS)
    .order("value_date", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTable(error)) return { transactions: [], missing: true, error: null };
    console.error("Failed to load transactions:", error);
    return { transactions: [], missing: false, error };
  }
  return { transactions: data || [], missing: false, error: null };
});

export const loadTransactionsForInvestment = cache(async (investmentId) => {
  if (!investmentId) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TRANSACTIONS_TABLE)
    .select(COLUMNS)
    .eq("investment_id", investmentId)
    .order("value_date", { ascending: false });
  if (error && !isMissingTable(error)) console.error("Failed to load placement ledger:", error);
  return data || [];
});

export const loadTransactionsForCustomer = cache(async (customerId) => {
  if (!customerId) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TRANSACTIONS_TABLE)
    .select(COLUMNS)
    .eq("customer_id", customerId)
    .order("value_date", { ascending: false });
  if (error && !isMissingTable(error)) console.error("Failed to load customer ledger:", error);
  return data || [];
});

export const loadTransactionByUuid = cache(async (uuid) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from(TRANSACTIONS_TABLE).select(COLUMNS).eq("uuid", uuid).maybeSingle();
  if (error && !isMissingTable(error)) console.error("Failed to load transaction:", error);
  return data || null;
});

/* ---------------------------------------------------------- reconciliation */

/**
 * Compare one placement's *schedule* against what the ledger actually records.
 *
 * `projectInvestment` already produces a row per month with the profit and
 * principal that fall due in it. A period is due once its date has passed; it is
 * settled once cleared settling transactions tagged with that `period_index`
 * cover the amount. Anything due and not covered is arrears — which is the
 * number the payouts screen exists to surface.
 *
 * Transactions with no `period_index` still count toward the placement total but
 * cannot settle a specific month, so they are reported separately as `unapplied`
 * rather than silently absorbed.
 */
export function settlementFor(investment, transactions = [], now = new Date()) {
  const projection = projectInvestment(investment);
  const cleared = transactions.filter((t) => t.status === "cleared");

  const paidByPeriod = new Map();
  let unapplied = 0;
  let depositsIn = 0;
  let feesIn = 0;

  for (const transaction of cleared) {
    if (transaction.kind === "deposit") {
      depositsIn += Math.abs(Number(transaction.amount) || 0);
      continue;
    }
    if (transaction.kind === "fee") {
      feesIn += Math.abs(Number(transaction.amount) || 0);
      continue;
    }
    if (!SETTLING_KINDS.has(transaction.kind)) continue;

    const amount = Math.abs(Number(transaction.amount) || 0);
    const period = Number(transaction.period_index);
    if (Number.isFinite(period) && period > 0) {
      paidByPeriod.set(period, (paidByPeriod.get(period) || 0) + amount);
    } else {
      unapplied += amount;
    }
  }

  const periods = projection.rows.map((row) => {
    const expected = row.profitPaid + row.principalPaid;
    const paid = paidByPeriod.get(row.month) || 0;
    const due = Boolean(row.date) && row.date <= now;
    const outstanding = Math.max(0, expected - paid);

    return {
      month: row.month,
      date: row.date,
      expected,
      profitDue: row.profitPaid,
      principalDue: row.principalPaid,
      paid,
      outstanding,
      due,
      state: expected <= 0 ? "none" : outstanding <= 0.5 ? "settled" : due ? "arrears" : "scheduled",
    };
  });

  const dueToDate = periods.filter((p) => p.due).reduce((sum, p) => sum + p.expected, 0);
  const paidToDate = periods.reduce((sum, p) => sum + p.paid, 0) + unapplied;
  const arrears = Math.max(0, dueToDate - paidToDate);
  const nextDue = periods.find((p) => !p.due && p.expected > 0) || null;
  const oldestArrears = periods.find((p) => p.state === "arrears") || null;

  return {
    projection,
    periods,
    dueToDate,
    paidToDate,
    arrears,
    unapplied,
    nextDue,
    oldestArrears,
    // Capital the customer was meant to send in, against what actually landed.
    funding: {
      expected: projection.principal,
      received: depositsIn,
      shortfall: Math.max(0, projection.principal - depositsIn),
      funded: depositsIn >= projection.principal - 0.5,
    },
    fees: feesIn,
    remainingObligation: Math.max(0, projection.totalReturned - paidToDate),
  };
}

/** Index a flat transaction list by placement so a page reconciles in one pass. */
export function groupTransactionsByInvestment(transactions = []) {
  const byInvestment = new Map();
  for (const transaction of transactions) {
    const key = String(transaction.investment_id ?? "");
    if (!key) continue;
    const list = byInvestment.get(key);
    if (list) list.push(transaction);
    else byInvestment.set(key, [transaction]);
  }
  return byInvestment;
}

/**
 * Every obligation across the book, flattened into one worklist.
 *
 * Rows are the unit the payouts screen pays: one placement, one period. Dormant
 * placements (still in review, cancelled, rejected) are skipped — nothing is
 * owed on a placement that was never funded.
 */
export function buildPayoutRun(investments = [], transactions = [], now = new Date(), { horizonDays = 30 } = {}) {
  const byInvestment = groupTransactionsByInvestment(transactions);
  const horizon = new Date(now.getTime() + horizonDays * 24 * 3600e3);
  const rows = [];

  for (const investment of investments) {
    if (isDormant(investment)) continue;

    const settlement = settlementFor(investment, byInvestment.get(String(investment.id)) || [], now);

    for (const period of settlement.periods) {
      if (period.expected <= 0) continue;
      if (period.state === "settled") continue;
      if (!period.due && (!period.date || period.date > horizon)) continue;

      rows.push({
        investment,
        investmentId: investment.id,
        investmentUuid: investment.uuid,
        customerId: investment.customer_id,
        vehicle: settlement.projection.vehicle,
        month: period.month,
        date: period.date,
        expected: period.expected,
        profitDue: period.profitDue,
        principalDue: period.principalDue,
        paid: period.paid,
        outstanding: period.outstanding,
        overdue: period.state === "arrears",
        daysLate: period.date && period.due ? Math.floor((now - period.date) / (24 * 3600e3)) : 0,
      });
    }
  }

  rows.sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    return (a.date?.getTime() || 0) - (b.date?.getTime() || 0);
  });

  const overdue = rows.filter((row) => row.overdue);
  return {
    rows,
    overdue,
    upcoming: rows.filter((row) => !row.overdue),
    overdueValue: overdue.reduce((sum, row) => sum + row.outstanding, 0),
    upcomingValue: rows.filter((row) => !row.overdue).reduce((sum, row) => sum + row.outstanding, 0),
  };
}

/** Headline totals for the ledger screen. */
export function ledgerSummary(transactions = []) {
  const summary = {
    count: transactions.length,
    inflow: 0,
    outflow: 0,
    pending: 0,
    pendingCount: 0,
    failedCount: 0,
    byKind: {},
  };

  for (const transaction of transactions) {
    const amount = Math.abs(Number(transaction.amount) || 0);
    const kind = transaction.kind || "adjustment";
    const slot = summary.byKind[kind] || (summary.byKind[kind] = { key: kind, label: TRANSACTION_KINDS[kind]?.label || kind, value: 0, count: 0 });
    slot.value += amount;
    slot.count += 1;

    if (transaction.status === "pending") {
      summary.pending += amount;
      summary.pendingCount += 1;
      continue;
    }
    if (transaction.status === "failed") summary.failedCount += 1;
    if (transaction.status !== "cleared") continue;

    if (transaction.direction === "in") summary.inflow += amount;
    else summary.outflow += amount;
  }

  summary.net = summary.inflow - summary.outflow;
  return summary;
}

/** Cleared cash in and out per month, for the cashflow chart. */
export function cashflowByMonth(transactions = [], keys = []) {
  const buckets = new Map(keys.map((key) => [key, { key, values: { inflow: 0, outflow: 0 }, value: 0 }]));
  for (const transaction of transactions) {
    if (transaction.status !== "cleared") continue;
    const date = transaction.value_date ? new Date(transaction.value_date) : null;
    if (!date || Number.isNaN(date.getTime())) continue;
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    const amount = Math.abs(Number(transaction.amount) || 0);
    if (transaction.direction === "in") bucket.values.inflow += amount;
    else bucket.values.outflow += amount;
    bucket.value = bucket.values.inflow - bucket.values.outflow;
  }
  return keys.map((key) => buckets.get(key));
}

/**
 * The default payload for settling one scheduled period, so the payout screen
 * and the placement page produce identical rows.
 */
export function payoutDraft(row, investment) {
  const isPrincipalOnly = row.profitDue <= 0 && row.principalDue > 0;
  return {
    customer_id: investment.customer_id,
    investment_id: investment.id,
    kind: isPrincipalOnly ? "principal_return" : "profit_payout",
    direction: "out",
    amount: row.outstanding,
    period_index: row.month,
    value_date: (row.date || new Date()).toISOString().slice(0, 10),
    method: "bank_transfer",
    bank_name: investment.payout_bank_name || null,
    account_name: investment.payout_account_name || null,
    account_number: investment.payout_account_number || null,
  };
}

/** Opening deposit implied by a placement, used to pre-fill the funding form. */
export function depositDraft(investment) {
  return {
    customer_id: investment.customer_id,
    investment_id: investment.id,
    kind: "deposit",
    direction: "in",
    amount: Number(investment.amount) || 0,
    value_date: (startOf(investment) || new Date()).toISOString().slice(0, 10),
    method: "bank_transfer",
  };
}
