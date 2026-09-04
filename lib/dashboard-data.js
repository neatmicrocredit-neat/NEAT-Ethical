import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase-server";

const CUSTOMER_COLUMNS =
  "id, uuid, first_name, last_name, other_names, email, phone_number, gender, date_of_birth, address, state, lga, id_type, id_number, id_front_url, id_back_url, image_url, neat_customer_id, nok_name, nok_relationship, nok_gender, nok_phone_number, nok_address, created_at";

const INVESTMENT_COLUMNS =
  "id, uuid, customer_id, amount, start_date, end_date, rollover, payout_schedule, payout_bank_name, payout_account_name, payout_account_number, vehicle, other_instructions, created_at";

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
    supabase.from("customers").select(CUSTOMER_COLUMNS).order("created_at", { ascending: false }).limit(5000),
    supabase.from("investments").select(INVESTMENT_COLUMNS).order("created_at", { ascending: false }).limit(5000),
  ]);

  if (customersResult.error) console.error("Failed to load customers:", customersResult.error);
  if (investmentsResult.error) console.error("Failed to load investments:", investmentsResult.error);

  return {
    customers: customersResult.data || [],
    investments: investmentsResult.data || [],
    error: customersResult.error || investmentsResult.error || null,
  };
});

export const loadCustomerByUuid = cache(async (uuid) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("customers").select(CUSTOMER_COLUMNS).eq("uuid", uuid).maybeSingle();
  if (error) console.error("Failed to load customer:", error);
  return data || null;
});

/**
 * Placements for one customer.
 * `investments.customer_id` is a bigint foreign key to `customers.id` — not the
 * customer's uuid — so callers must resolve the customer first.
 */
export const loadInvestmentsForCustomer = cache(async (customerId) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("investments")
    .select(INVESTMENT_COLUMNS)
    .eq("customer_id", customerId)
    .order("start_date", { ascending: false });
  if (error) console.error("Failed to load customer investments:", error);
  return data || [];
});

export const loadInvestmentByUuid = cache(async (uuid) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("investments").select(INVESTMENT_COLUMNS).eq("uuid", uuid).maybeSingle();
  if (error) console.error("Failed to load investment:", error);
  return data || null;
});

export const loadCustomerById = cache(async (id) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("customers").select(CUSTOMER_COLUMNS).eq("id", id).maybeSingle();
  if (error) console.error("Failed to load customer:", error);
  return data || null;
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
