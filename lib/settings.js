import { cache } from "react";

import { createSupabaseServerClient, isMissingTable } from "@/lib/supabase-server";

export const SETTINGS_TABLE = "app_settings";

/**
 * Defaults are the source of truth for *shape*; the table only overrides values.
 * That way a project with no settings row, or one written before a field
 * existed, still reads a complete object.
 */
export const SETTING_DEFAULTS = {
  company: {
    name: "NEAT Ethical Investments",
    email: "info@neatethical.com",
    phone: "+2349096852944",
    address: "",
    website: "https://neatethical.com",
    registration: "",
  },
  vehicles: {
    ethical: { label: "Ethical Investments", monthlyRate: 0.02 },
    funding: { label: "Ethical Funding", monthlyRate: 0.05 },
  },
  policy: {
    minAmount: 100000,
    maxAmount: 50000000,
    defaultTermMonths: 12,
    requireKycToApprove: true,
    payoutGraceDays: 3,
    autoCloseOnFullSettlement: false,
  },
};

export const SETTING_KEYS = Object.keys(SETTING_DEFAULTS);

function merge(defaults, stored) {
  if (!stored || typeof stored !== "object") return { ...defaults };
  const out = { ...defaults };
  for (const [key, value] of Object.entries(stored)) {
    const fallback = defaults[key];
    out[key] =
      fallback && typeof fallback === "object" && !Array.isArray(fallback) && value && typeof value === "object"
        ? merge(fallback, value)
        : value;
  }
  return out;
}

export const loadSettings = cache(async () => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from(SETTINGS_TABLE).select("key, value, updated_by, updated_at");

  if (error) {
    if (isMissingTable(error)) return { settings: { ...SETTING_DEFAULTS }, meta: {}, missing: true };
    console.error("Failed to load settings:", error);
    return { settings: { ...SETTING_DEFAULTS }, meta: {}, missing: false };
  }

  const settings = {};
  const meta = {};
  for (const key of SETTING_KEYS) {
    const row = (data || []).find((entry) => entry.key === key);
    settings[key] = merge(SETTING_DEFAULTS[key], row?.value);
    if (row) meta[key] = { updatedBy: row.updated_by, updatedAt: row.updated_at };
  }
  return { settings, meta, missing: false };
});

export async function writeSetting(key, value, actor) {
  if (!SETTING_KEYS.includes(key)) return { error: new Error(`Unknown settings group: ${key}`) };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from(SETTINGS_TABLE).upsert(
    { key, value, updated_by: actor || null, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  return { error };
}

/** Percent in the form the operator types (2 = 2%/month) <-> the stored rate. */
export function ratePercent(rate) {
  return Number(((Number(rate) || 0) * 100).toFixed(4));
}

export function percentToRate(percent) {
  const parsed = Number(percent);
  return Number.isFinite(parsed) ? parsed / 100 : 0;
}
