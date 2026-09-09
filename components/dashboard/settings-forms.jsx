"use client";

import { useActionState } from "react";

import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import { ratePercent } from "@/lib/settings";
import { buttonStyles } from "@/components/dashboard/ui";
import { Checkbox, Field, FormBanner, inputClass } from "@/components/dashboard/form-kit";

export function SettingsForms({ settings, meta, readOnly, vehicleKeys, companyAction, vehicleAction, policyAction }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <CompanyForm action={companyAction} value={settings.company} meta={meta.company} readOnly={readOnly} />
      <PolicyForm action={policyAction} value={settings.policy} meta={meta.policy} readOnly={readOnly} />
      <VehicleForm action={vehicleAction} value={settings.vehicles} meta={meta.vehicles} keys={vehicleKeys} readOnly={readOnly} className="xl:col-span-2" />
    </div>
  );
}

function Card({ title, description, meta, children, className }) {
  return (
    <section className={cn("rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]", className)}>
      <div className="border-b border-[var(--dash-line)] px-5 py-4">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">{title}</h2>
        <p className="mt-1 text-xs text-[var(--dash-muted)]">{description}</p>
        {meta?.updatedBy ? <p className="mt-1 text-[11px] text-[var(--dash-muted)]">Last changed by {meta.updatedBy}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function CompanyForm({ action, value, meta, readOnly }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });

  return (
    <Card title="Company profile" description="Used on statements, exports and outbound mail." meta={meta}>
      <form action={formAction} className="space-y-4">
        <FormBanner state={state} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Trading name" className="sm:col-span-2">
            <input name="name" defaultValue={value.name} className={inputClass} />
          </Field>
          <Field label="Contact email">
            <input name="email" type="email" defaultValue={value.email} className={inputClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" defaultValue={value.phone} className={inputClass} />
          </Field>
          <Field label="Website">
            <input name="website" type="url" defaultValue={value.website} className={inputClass} />
          </Field>
          <Field label="Registration number">
            <input name="registration" defaultValue={value.registration} className={inputClass} />
          </Field>
          <Field label="Registered address" className="sm:col-span-2">
            <textarea name="address" rows={2} defaultValue={value.address} className={cn(inputClass, "resize-y")} />
          </Field>
        </div>
        <button type="submit" disabled={pending || readOnly} className={buttonStyles.primary}>
          {pending ? "Saving…" : "Save company details"}
        </button>
      </form>
    </Card>
  );
}

function PolicyForm({ action, value, meta, readOnly }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });

  return (
    <Card title="Operating policy" description="The rules the console enforces when placements are approved." meta={meta}>
      <form action={formAction} className="space-y-4">
        <FormBanner state={state} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Minimum placement (₦)" hint={money(value.minAmount)}>
            <input name="minAmount" inputMode="numeric" defaultValue={value.minAmount} className={inputClass} />
          </Field>
          <Field label="Maximum placement (₦)" hint={money(value.maxAmount)}>
            <input name="maxAmount" inputMode="numeric" defaultValue={value.maxAmount} className={inputClass} />
          </Field>
          <Field label="Default term (months)">
            <input name="defaultTermMonths" inputMode="numeric" defaultValue={value.defaultTermMonths} className={inputClass} />
          </Field>
          <Field label="Payout grace (days)" hint="How long after the due date before a payout counts as late.">
            <input name="payoutGraceDays" inputMode="numeric" defaultValue={value.payoutGraceDays} className={inputClass} />
          </Field>

          <Checkbox
            name="requireKycToApprove"
            defaultChecked={value.requireKycToApprove}
            label="Require a complete KYC file to approve"
            hint="Blocks approval until the customer is verified and their documents are on file."
            className="sm:col-span-2"
          />
          <Checkbox
            name="autoCloseOnFullSettlement"
            defaultChecked={value.autoCloseOnFullSettlement}
            label="Close placements once fully settled"
            hint="Moves a matured placement to closed when the ledger shows nothing outstanding."
            className="sm:col-span-2"
          />
        </div>
        <button type="submit" disabled={pending || readOnly} className={buttonStyles.primary}>
          {pending ? "Saving…" : "Save policy"}
        </button>
      </form>
    </Card>
  );
}

function VehicleForm({ action, value, meta, keys, readOnly, className }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });

  return (
    <Card
      title="Vehicle rates"
      description="The published monthly rate for each vehicle, recorded for reporting."
      meta={meta}
      className={className}
    >
      <form action={formAction} className="space-y-4">
        <FormBanner state={state} />

        <p className="rounded-xl bg-[var(--dash-page)] px-3.5 py-3 text-xs leading-relaxed text-[var(--dash-ink-2)]">
          Changing a rate here does not re-price placements already on the book — each one keeps the rate it was written
          at, so historic projections stay truthful. Update the vehicle definitions in{" "}
          <code className="rounded bg-[var(--dash-line)] px-1 py-0.5 font-mono text-[11px]">lib/investments.js</code> to change
          how new placements are modelled.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {keys.map((key) => (
            <div key={key} className="rounded-xl border border-[var(--dash-line)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Label">
                  <input name={`${key}_label`} defaultValue={value[key]?.label || ""} className={inputClass} />
                </Field>
                <Field
                  label="Monthly rate (%)"
                  hint={`${(ratePercent(value[key]?.monthlyRate) * 12).toFixed(1)}% a year`}
                >
                  <input
                    name={`${key}_rate`}
                    inputMode="decimal"
                    defaultValue={ratePercent(value[key]?.monthlyRate)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={pending || readOnly} className={buttonStyles.primary}>
          {pending ? "Saving…" : "Save rates"}
        </button>
      </form>
    </Card>
  );
}
