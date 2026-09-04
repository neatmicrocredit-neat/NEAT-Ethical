"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import { VEHICLES, projectInvestment } from "@/lib/investments";
import { buttonStyles } from "@/components/dashboard/ui";

const inputClass =
  "w-full rounded-xl border border-[var(--dash-line)] bg-[var(--dash-surface)] px-3 py-2 text-sm text-[var(--dash-ink)] outline-none transition placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)]/15";

const labelClass = "block text-xs font-medium text-[var(--dash-ink-2)]";

function Field({ label, hint, children, className }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-[var(--dash-muted)]">{hint}</span> : null}
    </label>
  );
}

function isoDate(value) {
  return value ? String(value).slice(0, 10) : "";
}

/**
 * Shared by /dashboard/investments/new and the edit panel on the detail page.
 * The projection panel recomputes with the same domain function the server
 * uses, so what the operator previews is what the dashboard will report.
 */
export function InvestmentForm({ action, investment, customers = [], customerId, submitLabel = "Save placement", cancelHref }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });

  const [draft, setDraft] = useState(() => ({
    customer_id: String(customerId ?? investment?.customer_id ?? ""),
    vehicle: investment?.vehicle && VEHICLES[investment.vehicle] ? investment.vehicle : "ethical",
    amount: investment?.amount ? String(investment.amount) : "",
    start_date: isoDate(investment?.start_date) || new Date().toISOString().slice(0, 10),
    end_date: isoDate(investment?.end_date),
    payout_schedule: investment?.payout_schedule === "maturity" ? "maturity" : "monthly",
    rollover: Boolean(investment?.rollover),
  }));

  const set = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setDraft((previous) => ({ ...previous, [field]: value }));
  };

  const projection = useMemo(() => {
    const amount = Number(String(draft.amount).replace(/[^\d.]/g, ""));
    if (!amount || !draft.start_date || !draft.end_date) return null;
    return projectInvestment({ ...draft, amount });
  }, [draft]);

  return (
    <form action={formAction} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      {investment?.uuid ? <input type="hidden" name="uuid" value={investment.uuid} /> : null}
      {customerId ? <input type="hidden" name="customer_id" value={customerId} /> : null}

      <div className="space-y-5">
        {state.error ? (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#f3c9c9] bg-[#fdeced] px-3.5 py-2.5 text-sm text-[#96201f]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {state.error}
          </p>
        ) : null}
        {state.message ? (
          <p role="status" className="flex items-start gap-2 rounded-xl border border-[#c9e7c9] bg-[#eaf7ea] px-3.5 py-2.5 text-sm text-[#046004]">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            {state.message}
          </p>
        ) : null}

        <section className="rounded-2xl bg-[var(--dash-surface)] p-5 ring-1 ring-[var(--dash-line)]">
          <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Placement</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {!customerId ? (
              <Field label="Customer" className="sm:col-span-2">
                <select name="customer_id" required value={draft.customer_id} onChange={set("customer_id")} className={inputClass}>
                  <option value="">Select a customer…</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {[customer.first_name, customer.last_name].filter(Boolean).join(" ")} — {customer.email}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}

            <fieldset className="sm:col-span-2">
              <legend className={labelClass}>Investment vehicle</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {Object.values(VEHICLES).map((option) => {
                  const active = draft.vehicle === option.key;
                  return (
                    <label
                      key={option.key}
                      className={cn(
                        "cursor-pointer rounded-xl border p-3.5 transition",
                        active
                          ? "border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]"
                          : "border-[var(--dash-line)] hover:bg-[var(--dash-page)]"
                      )}
                    >
                      <input
                        type="radio"
                        name="vehicle"
                        value={option.key}
                        checked={active}
                        onChange={set("vehicle")}
                        className="sr-only"
                      />
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-[var(--dash-ink)]">{option.label}</span>
                        <span
                          className="size-2.5 rounded-[3px]"
                          style={{ background: option.key === "funding" ? "var(--series-2)" : "var(--series-1)" }}
                          aria-hidden
                        />
                      </span>
                      <span className="mt-1 block text-xs text-[var(--dash-ink-2)]">
                        {Math.round(option.monthlyRate * 100)}% monthly · {Math.round(option.annualRate * 100)}% p.a.
                      </span>
                      <span className="mt-1 block text-[11px] text-[var(--dash-muted)]">{option.note}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <Field label="Amount (₦)" hint="Principal placed by the customer.">
              <input
                name="amount"
                inputMode="numeric"
                required
                value={draft.amount}
                onChange={set("amount")}
                placeholder="1000000"
                className={inputClass}
              />
            </Field>

            <Field label="Payout schedule" hint="Rollover overrides this and settles everything at maturity.">
              <select name="payout_schedule" value={draft.payout_schedule} onChange={set("payout_schedule")} className={inputClass}>
                <option value="monthly">Monthly</option>
                <option value="maturity">At maturity</option>
              </select>
            </Field>

            <Field label="Start date">
              <input type="date" name="start_date" required value={draft.start_date} onChange={set("start_date")} className={inputClass} />
            </Field>

            <Field label="End date" hint="Leave blank to default to a 12-month term.">
              <input type="date" name="end_date" value={draft.end_date} onChange={set("end_date")} className={inputClass} />
            </Field>

            <label className="flex items-start gap-3 rounded-xl border border-[var(--dash-line)] p-3.5 sm:col-span-2">
              <input
                type="checkbox"
                name="rollover"
                checked={draft.rollover}
                onChange={set("rollover")}
                className="mt-0.5 size-4 accent-[var(--dash-accent)]"
              />
              <span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--dash-ink)]">
                  <RefreshCw className="size-3.5" />
                  Roll profit over
                </span>
                <span className="mt-0.5 block text-xs text-[var(--dash-muted)]">
                  Profit compounds month on month and is paid with the principal at maturity.
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-2xl bg-[var(--dash-surface)] p-5 ring-1 ring-[var(--dash-line)]">
          <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Payout account</h2>
          <p className="mt-1 text-xs text-[var(--dash-muted)]">Where profit and returning principal are sent.</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Bank name">
              <input name="payout_bank_name" defaultValue={investment?.payout_bank_name || ""} className={inputClass} />
            </Field>
            <Field label="Account name">
              <input name="payout_account_name" defaultValue={investment?.payout_account_name || ""} className={inputClass} />
            </Field>
            <Field label="Account number" className="sm:col-span-2">
              <input
                name="payout_account_number"
                inputMode="numeric"
                defaultValue={investment?.payout_account_number || ""}
                className={cn(inputClass, "font-mono")}
              />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <textarea
                name="other_instructions"
                rows={3}
                defaultValue={investment?.other_instructions || ""}
                placeholder="Anything the operations team should know about this placement."
                className={cn(inputClass, "resize-y")}
              />
            </Field>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={pending} className={buttonStyles.primary}>
            {pending ? "Saving…" : submitLabel}
          </button>
          {cancelHref ? (
            <Link href={cancelHref} className={buttonStyles.secondary}>
              Cancel
            </Link>
          ) : null}
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-[var(--dash-surface)] p-5 ring-1 ring-[var(--dash-line)]">
          <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Projection</h2>
          {projection ? (
            <>
              <p className="mt-4 text-2xl font-semibold leading-none tracking-tight text-[var(--dash-ink)]">
                {money(projection.totalReturned)}
              </p>
              <p className="mt-1.5 text-xs text-[var(--dash-muted)]">Total returned to the customer over the term</p>
              <dl className="mt-4 space-y-2.5 border-t border-[var(--dash-line)] pt-4 text-sm">
                <Row label="Principal" value={money(projection.principal)} />
                <Row label="Term" value={`${projection.months} months`} />
                <Row
                  label={projection.rollover ? "First month profit" : "Monthly profit"}
                  value={money(projection.monthlyProfit)}
                />
                <Row label="Total profit" value={money(projection.totalProfit)} />
                <Row
                  label="Due at maturity"
                  value={money(projection.principal + (projection.schedule === "maturity" ? projection.totalProfit : 0))}
                />
              </dl>
              <p className="mt-4 rounded-xl bg-[var(--dash-page)] px-3 py-2.5 text-[11px] leading-relaxed text-[var(--dash-ink-2)]">
                {projection.rollover
                  ? "Profit compounds each month and settles with the principal at maturity."
                  : projection.schedule === "monthly"
                    ? `${money(projection.monthlyProfit)} leaves the business every month, with the principal returning at maturity.`
                    : "Nothing leaves the business until maturity, when principal and profit settle together."}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-[var(--dash-ink-2)]">
              Enter an amount and both dates to preview the payout profile.
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-[var(--dash-muted)]">{label}</dt>
      <dd className="font-medium tabular-nums text-[var(--dash-ink)]">{value}</dd>
    </div>
  );
}
