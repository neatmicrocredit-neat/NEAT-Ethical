"use server";

import { revalidatePath } from "next/cache";

import { requireCapability } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { approvalBlockers } from "@/lib/compliance";
import { loadDocumentsForCustomer } from "@/lib/documents";
import { fail, ok, text } from "@/lib/form";
import { money } from "@/lib/format";
import { loadSettings } from "@/lib/settings";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { WORKFLOW, canTransition, transitionPatch, workflowOf } from "@/lib/workflow";

function revalidateWorkflow(uuid) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard/payouts");
  revalidatePath("/dashboard/analytics");
  if (uuid) revalidatePath(`/dashboard/investments/${uuid}`);
}

/**
 * Move a placement through its lifecycle.
 *
 * Three things are checked before the write, in order of cost: that the
 * operator may approve, that the transition is legal from where the record
 * actually is (not from where the button was rendered), and — only when
 * approving — that the customer's KYC file clears policy. The middle check is
 * what stops a stale tab from approving something a colleague already rejected.
 */
export async function transitionInvestment(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("investments.approve");
  } catch (error) {
    return fail(error.message);
  }

  const uuid = text(formData, "uuid");
  const to = text(formData, "to");
  if (!uuid || !to || !WORKFLOW[to]) return fail("Choose a valid status.");

  const supabase = createSupabaseServerClient();
  const { data: investment, error: loadError } = await supabase
    .from("investments")
    .select("id, uuid, customer_id, amount, status")
    .eq("uuid", uuid)
    .maybeSingle();
  if (loadError || !investment) return fail("That placement no longer exists.");

  const from = workflowOf(investment).key;
  if (from === to) return ok(`Already ${WORKFLOW[to].label.toLowerCase()}.`);
  if (!canTransition(from, to)) {
    return fail(`A ${WORKFLOW[from].label.toLowerCase()} placement cannot move straight to ${WORKFLOW[to].label.toLowerCase()}.`);
  }

  if (to === "approved") {
    const [{ settings }, customer] = await Promise.all([
      loadSettings(),
      supabase.from("customers").select("*").eq("id", investment.customer_id).maybeSingle().then((r) => r.data),
    ]);
    const documents = await loadDocumentsForCustomer(investment.customer_id);
    const gate = approvalBlockers(customer, documents, { requireKyc: settings.policy.requireKycToApprove });
    if (!gate.clear) return fail(gate.blockers[0]);
  }

  const note = text(formData, "note");
  const patch = transitionPatch(to, member.email, note);

  const { error } = await supabase.from("investments").update(patch).eq("uuid", uuid);
  if (error) return fail(`Could not update the placement: ${error.message}`);

  await recordAudit({
    actor: member.email,
    action: to === "approved" ? "approve" : to === "rejected" ? "reject" : "transition",
    entity: "investment",
    entityId: investment.id,
    entityLabel: `${money(investment.amount)} placement`,
    summary: `${WORKFLOW[from].label} → ${WORKFLOW[to].label}${note ? `: ${note}` : "."}`,
    changes: { status: { from, to }, note },
  });

  revalidateWorkflow(uuid);
  return ok(`Placement moved to ${WORKFLOW[to].label.toLowerCase()}.`);
}

/**
 * Approve several queued placements at once.
 *
 * Each one is still gated individually, and the result reports what went
 * through and what did not, rather than failing the whole batch on one blocked
 * record — an operator clearing a morning queue wants the other nine to land.
 */
export async function bulkApprove(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("investments.approve");
  } catch (error) {
    return fail(error.message);
  }

  const uuids = formData.getAll("selection").map(String).filter(Boolean);
  if (!uuids.length) return fail("Select at least one placement.");

  const supabase = createSupabaseServerClient();
  const { settings } = await loadSettings();
  const { data: investments, error: loadError } = await supabase
    .from("investments")
    .select("id, uuid, customer_id, amount, status")
    .in("uuid", uuids);
  if (loadError) return fail(`Could not load the selection: ${loadError.message}`);

  const approved = [];
  const blocked = [];

  for (const investment of investments || []) {
    if (!canTransition(workflowOf(investment).key, "approved")) {
      blocked.push("not awaiting approval");
      continue;
    }

    const { data: customer } = await supabase.from("customers").select("*").eq("id", investment.customer_id).maybeSingle();
    const documents = await loadDocumentsForCustomer(investment.customer_id);
    const gate = approvalBlockers(customer, documents, { requireKyc: settings.policy.requireKycToApprove });
    if (!gate.clear) {
      blocked.push(gate.blockers[0]);
      continue;
    }

    const { error } = await supabase
      .from("investments")
      .update(transitionPatch("approved", member.email, "Approved in a batch review."))
      .eq("uuid", investment.uuid);
    if (error) {
      blocked.push(error.message);
      continue;
    }

    approved.push(investment);
    await recordAudit({
      actor: member.email,
      action: "approve",
      entity: "investment",
      entityId: investment.id,
      entityLabel: `${money(investment.amount)} placement`,
      summary: "Approved in a batch review.",
      changes: { status: { from: investment.status, to: "approved" } },
    });
  }

  revalidateWorkflow();

  if (!approved.length) return fail(`Nothing was approved. First blocker: ${blocked[0] || "unknown"}.`);
  return ok(
    blocked.length
      ? `Approved ${approved.length}. ${blocked.length} still blocked — first: ${blocked[0]}`
      : `Approved ${approved.length} placement${approved.length === 1 ? "" : "s"}.`
  );
}
