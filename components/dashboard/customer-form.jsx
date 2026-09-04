"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonStyles } from "@/components/dashboard/ui";

const inputClass =
  "w-full rounded-xl border border-[var(--dash-line)] bg-[var(--dash-surface)] px-3 py-2 text-sm text-[var(--dash-ink)] outline-none transition placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)]/15";

function Text({ label, name, defaultValue, type = "text", required, className, options }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="block text-xs font-medium text-[var(--dash-ink-2)]">{label}</span>
      {options ? (
        <select name={name} defaultValue={defaultValue || ""} className={inputClass}>
          <option value="">Not specified</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} name={name} defaultValue={defaultValue || ""} required={required} className={inputClass} />
      )}
    </label>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-2xl bg-[var(--dash-surface)] p-5 ring-1 ring-[var(--dash-line)]">
      <h2 className="text-sm font-semibold text-[var(--dash-ink)]">{title}</h2>
      {description ? <p className="mt-1 text-xs text-[var(--dash-muted)]">{description}</p> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/**
 * Edits the profile fields only. Uploaded documents come from the public
 * onboarding flow (app/api/investment-requests) and are replaced there.
 */
export function CustomerForm({ action, customer, cancelHref }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="uuid" value={customer.uuid} />

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

      <Section title="Identity">
        <Text label="First name" name="first_name" defaultValue={customer.first_name} required />
        <Text label="Last name" name="last_name" defaultValue={customer.last_name} required />
        <Text label="Other names" name="other_names" defaultValue={customer.other_names} />
        <Text label="Gender" name="gender" defaultValue={customer.gender} options={["Male", "Female", "Other"]} />
        <Text label="Date of birth" name="date_of_birth" type="date" defaultValue={customer.date_of_birth?.slice(0, 10)} />
        <Text label="Customer reference" name="neat_customer_id" defaultValue={customer.neat_customer_id} />
      </Section>

      <Section title="Contact">
        <Text label="Email" name="email" type="email" defaultValue={customer.email} required />
        <Text label="Phone number" name="phone_number" defaultValue={customer.phone_number} required />
        <Text label="Address" name="address" defaultValue={customer.address} className="sm:col-span-2" />
        <Text label="State" name="state" defaultValue={customer.state} />
        <Text label="LGA" name="lga" defaultValue={customer.lga} />
      </Section>

      <Section title="Identification" description="Document images are captured during onboarding and cannot be replaced here.">
        <Text label="ID type" name="id_type" defaultValue={customer.id_type} options={["NIN", "Voter's card", "Driver's licence", "International passport"]} />
        <Text label="ID number" name="id_number" defaultValue={customer.id_number} />
      </Section>

      <Section title="Next of kin">
        <Text label="Name" name="nok_name" defaultValue={customer.nok_name} />
        <Text label="Relationship" name="nok_relationship" defaultValue={customer.nok_relationship} />
        <Text label="Gender" name="nok_gender" defaultValue={customer.nok_gender} options={["Male", "Female", "Other"]} />
        <Text label="Phone number" name="nok_phone_number" defaultValue={customer.nok_phone_number} />
        <Text label="Address" name="nok_address" defaultValue={customer.nok_address} className="sm:col-span-2" />
      </Section>

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          {pending ? "Saving…" : "Save customer"}
        </button>
        {cancelHref ? (
          <Link href={cancelHref} className={buttonStyles.secondary}>
            Cancel
          </Link>
        ) : null}
      </div>
    </form>
  );
}
