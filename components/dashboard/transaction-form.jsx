"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import { PAYMENT_METHODS, TRANSACTION_KINDS, TRANSACTION_STATUSES, directionOf } from "@/lib/ledger";
import { buttonStyles } from "@/components/dashboard/ui";
import { Field, FormBanner, FormSection, Select, inputClass, isoDate, optionsFrom, today } from "@/components/dashboard/form-kit";

const KIND_OPTIONS = Object.values(TRANSACTION_KINDS).map((kind) => ({ value: kind.key, label: kind.label }));
const STATUS_OPTIONS = optionsFrom(TRANSACTION_STATUSES);
const METHOD_OPTIONS = Object.entries(PAYMENT_METHODS).map(([value, label]) => ({ value, label }));

/**
 * One entry in the cash ledger.
 *
 * Direction follows the kind automatically and is only editable for an
 * adjustment — an operator recording a payout should not be able to book it as
 * money coming in by leaving a radio on its default.
 */
export function TransactionForm({
  action,
  transaction,
  customers = [],
  investments = [],
  lockedCustomerId,
  lockedInvestmentId,
  submitLabel = "Record entry",
  cancelHref,
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });

  const [draft, setDraft] = useState(() => ({
    kind: transaction?.kind || "deposit",
    direction: transaction?.direction || directionOf(transaction?.kind || "deposit"),
    amount: transaction?.amount ? String(transaction.amount) : "",
    customer_id: String(lockedCustomerId ?? transaction?.customer_id ?? ""),
    investment_id: String(lockedInvestmentId ?? transaction?.investment_id ?? ""),
  }));

  const set = (field) => (event) => setDraft((previous) => ({ ...previous, [field]: event.target.value }));

  const onKind = (event) => {
    const kind = event.target.value;
    setDraft((previous) => ({ ...previous, kind, direction: directionOf(kind, previous.direction) }));
  };

  const isAdjustment = draft.kind === "adjustment";
  const amount = Number(String(draft.amount).replace(/[^\d.]/g, "")) || 0;

  // Placements narrow to the chosen customer, so a payout can never be booked
  // against someone else's placement by scrolling too far in a long list.
  const relevant = draft.customer_id
    ? investments.filter((investment) => String(investment.customer_id) === String(draft.customer_id))
    : investments;

  return (
    <form action={formAction} className="space-y-5">
      {transaction?.uuid ? <input type="hidden" name="uuid" value={transaction.uuid} /> : null}
      {lockedCustomerId ? <input type="hidden" name="customer_id" value={lockedCustomerId} /> : null}
      {lockedInvestmentId ? <input type="hidden" name="investment_id" value={lockedInvestmentId} /> : null}
      {!isAdjustment ? <input type="hidden" name="direction" value={draft.direction} /> : null}

      <FormBanner state={state} />

      <FormSection title="Entry" description={TRANSACTION_KINDS[draft.kind]?.note}>
        <Field label="Kind" required>
          <Select options={KIND_OPTIONS} name="kind" value={draft.kind} onChange={onKind} />
        </Field>

        <Field label="Amount (₦)" required hint={amount ? money(amount) : "Always a positive figure — the kind sets the direction."}>
          <input name="amount" inputMode="numeric" required value={draft.amount} onChange={set("amount")} placeholder="250000" className={inputClass} />
        </Field>

        {isAdjustment ? (
          <fieldset className="sm:col-span-2">
            <legend className="block text-xs font-medium text-[var(--dash-ink-2)]">Direction</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {[
                { value: "in", label: "Money in", note: "Increases what the business holds." },
                { value: "out", label: "Money out", note: "Reduces what the business holds." },
              ].map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3.5 transition",
                    draft.direction === option.value
                      ? "border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]"
                      : "border-[var(--dash-line)] hover:bg-[var(--dash-page)]"
                  )}
                >
                  <input
                    type="radio"
                    name="direction"
                    value={option.value}
                    checked={draft.direction === option.value}
                    onChange={set("direction")}
                    className="sr-only"
                  />
                  <span className="block text-sm font-medium text-[var(--dash-ink)]">{option.label}</span>
                  <span className="mt-0.5 block text-xs text-[var(--dash-muted)]">{option.note}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <Field label="Value date" required hint="The day the money actually moved.">
          <input type="date" name="value_date" required defaultValue={isoDate(transaction?.value_date) || today()} className={inputClass} />
        </Field>

        <Field label="Status" hint={TRANSACTION_STATUSES[transaction?.status || "cleared"]?.note}>
          <Select options={STATUS_OPTIONS} name="status" defaultValue={transaction?.status || "cleared"} />
        </Field>
      </FormSection>

      <FormSection title="Attribution" description="Which customer and placement this entry belongs to.">
        {!lockedCustomerId ? (
          <Field label="Customer" required={!draft.investment_id}>
            <Select
              name="customer_id"
              placeholder="Select a customer…"
              value={draft.customer_id}
              onChange={set("customer_id")}
              options={customers.map((customer) => ({
                value: String(customer.id),
                label: `${[customer.first_name, customer.last_name].filter(Boolean).join(" ")} — ${customer.email}`,
              }))}
            />
          </Field>
        ) : null}

        {!lockedInvestmentId ? (
          <Field label="Placement" hint="Leave blank for an entry that is not tied to one placement.">
            <Select
              name="investment_id"
              placeholder="Not placement-specific"
              value={draft.investment_id}
              onChange={set("investment_id")}
              options={relevant.map((investment) => ({
                value: String(investment.id),
                label: investment.label,
              }))}
            />
          </Field>
        ) : null}

        <Field
          label="Schedule period"
          hint="The month of the payout schedule this settles. Leave blank if it does not settle a specific month."
        >
          <input
            name="period_index"
            inputMode="numeric"
            defaultValue={transaction?.period_index ?? ""}
            placeholder="e.g. 4"
            className={inputClass}
          />
        </Field>

        <Field label="Method">
          <Select options={METHOD_OPTIONS} name="method" placeholder="Not recorded" defaultValue={transaction?.method || "bank_transfer"} />
        </Field>
      </FormSection>

      <FormSection title="Settlement detail" description="Recorded on the entry so a statement can be reconstructed later.">
        <Field label="Reference">
          <input name="reference" defaultValue={transaction?.reference || ""} placeholder="Bank narration or receipt number" className={cn(inputClass, "font-mono")} />
        </Field>
        <Field label="Bank name">
          <input name="bank_name" defaultValue={transaction?.bank_name || ""} className={inputClass} />
        </Field>
        <Field label="Account name">
          <input name="account_name" defaultValue={transaction?.account_name || ""} className={inputClass} />
        </Field>
        <Field label="Account number">
          <input name="account_number" inputMode="numeric" defaultValue={transaction?.account_number || ""} className={cn(inputClass, "font-mono")} />
        </Field>
        <Field label="Note" className="sm:col-span-2">
          <textarea name="note" rows={3} defaultValue={transaction?.note || ""} placeholder="Anything a reviewer would need to understand this entry." className={cn(inputClass, "resize-y")} />
        </Field>
      </FormSection>

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {!transaction ? (
          <button type="submit" name="stay" value="true" disabled={pending} className={buttonStyles.secondary}>
            Save and add another
          </button>
        ) : null}
        {cancelHref ? (
          <Link href={cancelHref} className={buttonStyles.ghost}>
            Cancel
          </Link>
        ) : null}
      </div>
    </form>
  );
}
