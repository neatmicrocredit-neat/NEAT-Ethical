import { cache } from "react";

import { createSupabaseServerClient, isMissingColumn } from "@/lib/supabase-server";

const CUSTOMER_BASE =
  "id, uuid, first_name, last_name, other_names, email, phone_number, gender, date_of_birth, address, state, lga, id_type, id_number, id_front_url, id_back_url, image_url, neat_customer_id, nok_name, nok_relationship, nok_gender, nok_phone_number, nok_address, created_at";

const INVESTMENT_BASE =
  "id, uuid, customer_id, amount, start_date, end_date, rollover, payout_schedule, payout_bank_name, payout_account_name, payout_account_number, vehicle, other_instructions, created_at";

/** Columns added by supabase/migrations/0003_operations.sql. */
const CUSTOMER_OPS = "kyc_status, kyc_verified_at, kyc_verified_by, kyc_note, risk_rating, is_pep, source";
const INVESTMENT_OPS =
  "status, submitted_at, approved_at, approved_by, decision_note, funded_at, closed_at, risk_notes, reference";

const CUSTOMER_COLUMNS = `${CUSTOMER_BASE}, ${CUSTOMER_OPS}`;
const INVESTMENT_COLUMNS = `${INVESTMENT_BASE}, ${INVESTMENT_OPS}`;

/**
 * Select the operations columns, and fall back to the pre-migration set if they
 * are not there yet.
 *
 * The console is expected to run against projects where 0003 has not been
 * applied. Rather than gate every screen behind a migration check, every read
 * degrades once: ask for everything, and on a missing-column error ask again
 * for the columns that have always existed. Callers then see records without
 * the workflow fields, which every consumer already treats as a default.
 */
async function selectWithFallback(supabase, table, full, base, shape) {
  const attempt = (columns) => shape(supabase.from(table).select(columns));

  const { data, error } = await attempt(full);
  if (!error) return { data: data || [], error: null, degraded: false };
  if (!isMissingColumn(error)) return { data: [], error, degraded: false };

  const retry = await attempt(base);
  if (retry.error) return { data: [], error: retry.error, degraded: true };
  return { data: retry.data || [], error: null, degraded: true };
}

/**
 * The whole book in one place.
 *
 * Every analytic on the dashboard is a roll-up of the same two tables, so they
 * are fetched once per request and shared through React.cache rather than
 * re-queried per page section. At this book size (hundreds of records) a full
 * load is cheaper than a dozen aggregate round-trips; if the book grows past
 * the limits below, move the roll-ups into Postgres views.
 */
export const loadBook = cache(async () => {
  const supabase = createSupabaseServerClient();

  const [customersResult, investmentsResult] = await Promise.all([
    selectWithFallback(supabase, "customers", CUSTOMER_COLUMNS, CUSTOMER_BASE, (query) =>
      query.order("created_at", { ascending: false }).limit(5000)
    ),
    selectWithFallback(supabase, "investments", INVESTMENT_COLUMNS, INVESTMENT_BASE, (query) =>
      query.order("created_at", { ascending: false }).limit(5000)
    ),
  ]);

  if (customersResult.error) console.error("Failed to load customers:", customersResult.error);
  if (investmentsResult.error) console.error("Failed to load investments:", investmentsResult.error);

  return {
    customers: customersResult.data,
    investments: investmentsResult.data,
    error: customersResult.error || investmentsResult.error || null,
    // True when 0003 has not been applied, so screens can point at the migration.
    legacySchema: customersResult.degraded || investmentsResult.degraded,
  };
});

export const loadCustomerByUuid = cache(async (uuid) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await selectWithFallback(supabase, "customers", CUSTOMER_COLUMNS, CUSTOMER_BASE, (query) =>
    query.eq("uuid", uuid).limit(1)
  );
  if (error) console.error("Failed to load customer:", error);
  return data[0] || null;
});

/**
 * Placements for one customer.
 * `investments.customer_id` is a bigint foreign key to `customers.id` — not the
 * customer's uuid — so callers must resolve the customer first.
 */
export const loadInvestmentsForCustomer = cache(async (customerId) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await selectWithFallback(supabase, "investments", INVESTMENT_COLUMNS, INVESTMENT_BASE, (query) =>
    query.eq("customer_id", customerId).order("start_date", { ascending: false })
  );
  if (error) console.error("Failed to load customer investments:", error);
  return data;
});

export const loadInvestmentByUuid = cache(async (uuid) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await selectWithFallback(supabase, "investments", INVESTMENT_COLUMNS, INVESTMENT_BASE, (query) =>
    query.eq("uuid", uuid).limit(1)
  );
  if (error) console.error("Failed to load investment:", error);
  return data[0] || null;
});

export const loadCustomerById = cache(async (id) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await selectWithFallback(supabase, "customers", CUSTOMER_COLUMNS, CUSTOMER_BASE, (query) =>
    query.eq("id", id).limit(1)
  );
  if (error) console.error("Failed to load customer:", error);
  return data[0] || null;
});

/** Minimal list for the customer picker on the placement form. */
export const loadCustomerOptions = cache(async () => {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("customers")
    .select("id, uuid, first_name, last_name, email")
    .order("first_name", { ascending: true })
    .limit(5000);
  return data || [];
});
