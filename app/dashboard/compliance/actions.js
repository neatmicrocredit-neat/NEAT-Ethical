"use server";

import { revalidatePath } from "next/cache";

import { requireCapability } from "@/lib/auth";
import { recordAudit, diff } from "@/lib/audit";
import { KYC_STATUSES, RISK_RATINGS } from "@/lib/compliance";
import { bool, choice, fail, ok, text } from "@/lib/form";
import { fullName } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function setComplianceStatus(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("customers.verify");
  } catch (error) {
    return fail(error.message);
  }

  const uuid = text(formData, "uuid");
  if (!uuid) return fail("Missing the customer reference.");

  const supabase = createSupabaseServerClient();
  const { data: customer } = await supabase.from("customers").select("*").eq("uuid", uuid).maybeSingle();
  if (!customer) return fail("That customer no longer exists.");

  const status = choice(formData, "kyc_status", KYC_STATUSES, customer.kyc_status || "unverified");
  const verified = status === "verified";

  const payload = {
    kyc_status: status,
    risk_rating: choice(formData, "risk_rating", RISK_RATINGS, customer.risk_rating || "unrated"),
    is_pep: bool(formData, "is_pep"),
    kyc_note: text(formData, "kyc_note"),
    // Only a verified file carries a verifier — clearing it on any other status
    // stops a rejected record from still showing who once signed it off.
    kyc_verified_at: verified ? new Date().toISOString() : null,
    kyc_verified_by: verified ? member.email : null,
  };

  const { error } = await supabase.from("customers").update(payload).eq("uuid", uuid);
  if (error) return fail(`Could not save the review: ${error.message}`);

  await recordAudit({
    actor: member.email,
    action: verified ? "verify" : "update",
    entity: "customer",
    entityId: customer.id,
    entityLabel: fullName(customer),
    summary: `KYC marked ${KYC_STATUSES[status].label.toLowerCase()}, risk ${RISK_RATINGS[payload.risk_rating].label.toLowerCase()}.`,
    changes: diff(customer, payload),
  });

  revalidatePath("/dashboard/compliance");
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${uuid}`);
  return ok(`${fullName(customer)} marked ${KYC_STATUSES[status].label.toLowerCase()}.`);
}
