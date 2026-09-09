"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCapability } from "@/lib/auth";
import { recordAudit, diff } from "@/lib/audit";
import { bool, choice, date, fail, integer, number, ok, text } from "@/lib/form";
import { PAYMENT_METHODS, TRANSACTION_KINDS, TRANSACTION_STATUSES, directionOf } from "@/lib/ledger";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { money } from "@/lib/format";

/** Every screen that shows money has to be re-rendered after a ledger write. */
function revalidateLedger(uuid) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/payouts");
  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/reports");
  if (uuid) revalidatePath(`/dashboard/transactions/${uuid}`);
}

function readTransaction(formData) {
  const kind = choice(formData, "kind", TRANSACTION_KINDS, "deposit");
  const amount = number(formData, "amount");
  const errors = [];

  if (!amount || amount <= 0) errors.push("Enter an amount greater than zero.");

  // Direction is fixed by the kind except for adjustments, which the operator
  // points either way — otherwise a mis-set radio could silently invert a payout.
  const direction =
    kind === "adjustment" ? (choice(formData, "direction", ["in", "out"], "out")) : directionOf(kind);

  const periodIndex = integer(formData, "period_index");
  if (periodIndex !== null && periodIndex < 1) errors.push("The schedule period must be 1 or greater.");

  return {
    errors,
    payload: {
      kind,
      direction,
      amount: amount === null ? null : Math.abs(amount),
      status: choice(formData, "status", TRANSACTION_STATUSES, "cleared"),
      value_date: date(formData, "value_date") || new Date().toISOString().slice(0, 10),
      period_index: periodIndex,
      method: choice(formData, "method", PAYMENT_METHODS, null),
      reference: text(formData, "reference"),
      bank_name: text(formData, "bank_name"),
      account_name: text(formData, "account_name"),
      account_number: text(formData, "account_number"),
      note: text(formData, "note"),
    },
  };
}

export async function createTransaction(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("ledger.write");
  } catch (error) {
    return fail(error.message);
  }

  const investmentId = integer(formData, "investment_id");
  const customerId = integer(formData, "customer_id");
  if (!customerId && !investmentId) return fail("Attach the entry to a customer or a placement.");

  const { errors, payload } = readTransaction(formData);
  if (errors.length) return fail(errors[0]);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("transactions")
    .insert({ ...payload, customer_id: customerId, investment_id: investmentId, created_by: member.email })
    .select("uuid, id")
    .single();

  if (error) return fail(`Could not record the entry: ${error.message}`);

  await recordAudit({
    actor: member.email,
    action: "create",
    entity: "transaction",
    entityId: data.id,
    entityLabel: `${TRANSACTION_KINDS[payload.kind]?.label || payload.kind} · ${money(payload.amount)}`,
    summary: `Recorded ${payload.direction === "in" ? "an inflow" : "an outflow"} of ${money(payload.amount)}.`,
    changes: payload,
  });

  revalidateLedger(data.uuid);

  if (bool(formData, "stay")) return ok("Entry recorded.");
  redirect(`/dashboard/transactions/${data.uuid}`);
}

export async function updateTransaction(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("ledger.write");
  } catch (error) {
    return fail(error.message);
  }

  const uuid = text(formData, "uuid");
  if (!uuid) return fail("Missing the entry reference.");

  const { errors, payload } = readTransaction(formData);
  if (errors.length) return fail(errors[0]);

  const supabase = createSupabaseServerClient();
  const { data: previous } = await supabase.from("transactions").select("*").eq("uuid", uuid).maybeSingle();
  if (!previous) return fail("That entry no longer exists.");

  const { error } = await supabase.from("transactions").update(payload).eq("uuid", uuid);
  if (error) return fail(`Could not save the entry: ${error.message}`);

  await recordAudit({
    actor: member.email,
    action: "update",
    entity: "transaction",
    entityId: previous.id,
    entityLabel: `${TRANSACTION_KINDS[payload.kind]?.label || payload.kind} · ${money(payload.amount)}`,
    summary: "Ledger entry amended.",
    changes: diff(previous, payload),
  });

  revalidateLedger(uuid);
  return ok("Entry updated.");
}

/**
 * Move an entry between pending / cleared / failed / cancelled.
 *
 * Kept separate from `updateTransaction` so the common case — confirming a
 * transfer landed — is one button rather than a round trip through the form.
 */
export async function setTransactionStatus(formData) {
  const member = await requireCapability("ledger.write");

  const uuid = String(formData.get("uuid") || "");
  const status = String(formData.get("status") || "");
  if (!uuid || !TRANSACTION_STATUSES[status]) return;

  const supabase = createSupabaseServerClient();
  const { data: previous } = await supabase.from("transactions").select("id, status, amount").eq("uuid", uuid).maybeSingle();
  if (!previous) return;

  await supabase.from("transactions").update({ status }).eq("uuid", uuid);

  await recordAudit({
    actor: member.email,
    action: "update",
    entity: "transaction",
    entityId: previous.id,
    entityLabel: money(previous.amount),
    summary: `Marked ${TRANSACTION_STATUSES[status].label.toLowerCase()}.`,
    changes: { status: { from: previous.status, to: status } },
  });

  revalidateLedger(uuid);
}

export async function deleteTransaction(formData) {
  const member = await requireCapability("ledger.write");

  const uuid = String(formData.get("uuid") || "");
  if (!uuid) return;

  const supabase = createSupabaseServerClient();
  const { data: previous } = await supabase.from("transactions").select("*").eq("uuid", uuid).maybeSingle();
  await supabase.from("transactions").delete().eq("uuid", uuid);

  if (previous) {
    await recordAudit({
      actor: member.email,
      action: "delete",
      entity: "transaction",
      entityId: previous.id,
      entityLabel: money(previous.amount),
      summary: "Ledger entry deleted.",
      changes: previous,
    });
  }

  revalidateLedger();
  redirect("/dashboard/transactions");
}

/**
 * Settle a batch of scheduled periods in one go.
 *
 * The payouts screen posts `selection` as repeated `investmentId:month:amount`
 * values. Writing them as a single insert keeps the run atomic from the
 * operator's point of view: either the batch lands or nothing does.
 */
export async function recordPayoutRun(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("ledger.write");
  } catch (error) {
    return fail(error.message);
  }

  const selection = formData.getAll("selection").map(String).filter(Boolean);
  if (!selection.length) return fail("Select at least one payout to record.");

  const valueDate = date(formData, "value_date") || new Date().toISOString().slice(0, 10);
  const status = choice(formData, "status", TRANSACTION_STATUSES, "cleared");
  const method = choice(formData, "method", PAYMENT_METHODS, "bank_transfer");

  const supabase = createSupabaseServerClient();

  const ids = [...new Set(selection.map((entry) => entry.split(":")[0]))].map(Number).filter(Boolean);
  const { data: investments, error: loadError } = await supabase
    .from("investments")
    .select("id, customer_id, payout_bank_name, payout_account_name, payout_account_number")
    .in("id", ids);
  if (loadError) return fail(`Could not load the selected placements: ${loadError.message}`);

  const byId = new Map((investments || []).map((investment) => [String(investment.id), investment]));
  const rows = [];

  for (const entry of selection) {
    const [rawId, rawMonth, rawAmount, rawKind] = entry.split(":");
    const investment = byId.get(rawId);
    const amount = Number(rawAmount);
    if (!investment || !Number.isFinite(amount) || amount <= 0) continue;

    rows.push({
      customer_id: investment.customer_id,
      investment_id: investment.id,
      kind: rawKind === "principal_return" ? "principal_return" : "profit_payout",
      direction: "out",
      amount: Math.abs(amount),
      status,
      value_date: valueDate,
      period_index: Number(rawMonth) || null,
      method,
      bank_name: investment.payout_bank_name || null,
      account_name: investment.payout_account_name || null,
      account_number: investment.payout_account_number || null,
      note: text(formData, "note"),
      created_by: member.email,
    });
  }

  if (!rows.length) return fail("None of the selected payouts could be matched to a placement.");

  const { error } = await supabase.from("transactions").insert(rows);
  if (error) return fail(`Could not record the run: ${error.message}`);

  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  await recordAudit({
    actor: member.email,
    action: "create",
    entity: "transaction",
    entityId: null,
    entityLabel: `Payout run · ${rows.length} payment${rows.length === 1 ? "" : "s"}`,
    summary: `Recorded ${rows.length} payout${rows.length === 1 ? "" : "s"} totalling ${money(total)}.`,
    changes: { count: rows.length, total, value_date: valueDate, status },
  });

  revalidateLedger();
  return ok(`Recorded ${rows.length} payout${rows.length === 1 ? "" : "s"} totalling ${money(total)}.`);
}
