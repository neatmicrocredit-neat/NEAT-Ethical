"use server";

import { revalidatePath } from "next/cache";

import { requireCapability } from "@/lib/auth";
import { recordAudit, diff } from "@/lib/audit";
import { bool, fail, number, ok, text } from "@/lib/form";
import { SETTING_DEFAULTS, loadSettings, percentToRate, writeSetting } from "@/lib/settings";

export async function saveCompanySettings(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("settings.write");
  } catch (error) {
    return fail(error.message);
  }

  const { settings } = await loadSettings();
  const value = {
    name: text(formData, "name") || SETTING_DEFAULTS.company.name,
    email: text(formData, "email") || "",
    phone: text(formData, "phone") || "",
    address: text(formData, "address") || "",
    website: text(formData, "website") || "",
    registration: text(formData, "registration") || "",
  };

  const { error } = await writeSetting("company", value, member.email);
  if (error) return fail(`Could not save: ${error.message}`);

  await recordAudit({
    actor: member.email,
    action: "update",
    entity: "settings",
    entityId: "company",
    entityLabel: "Company profile",
    summary: "Company details updated.",
    changes: diff(settings.company, value),
  });

  revalidatePath("/dashboard/settings");
  return ok("Company details saved.");
}

/**
 * Vehicle rates.
 *
 * These are stored for reporting and for the operator's own reference. The
 * projection maths still reads `VEHICLES` in lib/investments.js, so changing a
 * rate here does not silently re-price the existing book — a warning on the
 * settings page says so explicitly.
 */
export async function saveVehicleSettings(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("settings.write");
  } catch (error) {
    return fail(error.message);
  }

  const { settings } = await loadSettings();
  const value = {};

  for (const key of Object.keys(SETTING_DEFAULTS.vehicles)) {
    const percent = number(formData, `${key}_rate`);
    if (percent !== null && (percent < 0 || percent > 100)) {
      return fail("Monthly rates must be between 0 and 100 percent.");
    }
    value[key] = {
      label: text(formData, `${key}_label`) || SETTING_DEFAULTS.vehicles[key].label,
      monthlyRate: percent === null ? settings.vehicles[key].monthlyRate : percentToRate(percent),
    };
  }

  const { error } = await writeSetting("vehicles", value, member.email);
  if (error) return fail(`Could not save: ${error.message}`);

  await recordAudit({
    actor: member.email,
    action: "update",
    entity: "settings",
    entityId: "vehicles",
    entityLabel: "Vehicle rates",
    summary: "Published vehicle rates updated.",
    changes: diff(settings.vehicles, value),
  });

  revalidatePath("/dashboard/settings");
  return ok("Vehicle rates saved.");
}

export async function savePolicySettings(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("settings.write");
  } catch (error) {
    return fail(error.message);
  }

  const { settings } = await loadSettings();
  const minAmount = number(formData, "minAmount") ?? settings.policy.minAmount;
  const maxAmount = number(formData, "maxAmount") ?? settings.policy.maxAmount;
  if (minAmount >= maxAmount) return fail("The maximum placement must be larger than the minimum.");

  const value = {
    minAmount,
    maxAmount,
    defaultTermMonths: number(formData, "defaultTermMonths") ?? settings.policy.defaultTermMonths,
    payoutGraceDays: number(formData, "payoutGraceDays") ?? settings.policy.payoutGraceDays,
    requireKycToApprove: bool(formData, "requireKycToApprove"),
    autoCloseOnFullSettlement: bool(formData, "autoCloseOnFullSettlement"),
  };

  const { error } = await writeSetting("policy", value, member.email);
  if (error) return fail(`Could not save: ${error.message}`);

  await recordAudit({
    actor: member.email,
    action: "update",
    entity: "settings",
    entityId: "policy",
    entityLabel: "Operating policy",
    summary: "Operating policy updated.",
    changes: diff(settings.policy, value),
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/approvals");
  return ok("Policy saved.");
}
