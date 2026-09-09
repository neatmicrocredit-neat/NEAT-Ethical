"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The console's form vocabulary in one place, so every screen that writes to the
 * database looks and behaves the same. The classes here were previously inlined
 * per form; anything new should reach for these instead.
 */
export const inputClass =
  "w-full rounded-xl border border-[var(--dash-line)] bg-[var(--dash-surface)] px-3 py-2 text-sm text-[var(--dash-ink)] outline-none transition placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)]/15";

export const labelClass = "block text-xs font-medium text-[var(--dash-ink-2)]";

export function Field({ label, hint, children, className, required }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className={labelClass}>
        {label}
        {required ? <span className="ml-0.5 text-[var(--status-critical)]">*</span> : null}
      </span>
      {children}
      {hint ? <span className="block text-[11px] text-[var(--dash-muted)]">{hint}</span> : null}
    </label>
  );
}

/** Result banner for a Server Action's `{ ok, error, message }` state. */
export function FormBanner({ state }) {
  if (state?.error) {
    return (
      <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#f3c9c9] bg-[#fdeced] px-3.5 py-2.5 text-sm text-[#96201f]">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        {state.error}
      </p>
    );
  }
  if (state?.message) {
    return (
      <p role="status" className="flex items-start gap-2 rounded-xl border border-[#c9e7c9] bg-[#eaf7ea] px-3.5 py-2.5 text-sm text-[#046004]">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        {state.message}
      </p>
    );
  }
  return null;
}

export function Select({ options, placeholder, className, ...props }) {
  return (
    <select className={cn(inputClass, className)} {...props}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Options for a `Select` from any of the console's `{ key, label }` maps. */
export function optionsFrom(map, keys) {
  return (keys || Object.keys(map)).map((key) => ({
    value: key,
    label: map[key]?.label || map[key] || key,
  }));
}

export function Checkbox({ label, hint, className, ...props }) {
  return (
    <label className={cn("flex items-start gap-3 rounded-xl border border-[var(--dash-line)] p-3.5", className)}>
      <input type="checkbox" className="mt-0.5 size-4 accent-[var(--dash-accent)]" {...props} />
      <span>
        <span className="block text-sm font-medium text-[var(--dash-ink)]">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-[var(--dash-muted)]">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Card wrapper used to break a long form into named sections. */
export function FormSection({ title, description, children, className }) {
  return (
    <section className={cn("rounded-2xl bg-[var(--dash-surface)] p-5 ring-1 ring-[var(--dash-line)]", className)}>
      <h2 className="text-sm font-semibold text-[var(--dash-ink)]">{title}</h2>
      {description ? <p className="mt-1 text-xs text-[var(--dash-muted)]">{description}</p> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function isoDate(value) {
  return value ? String(value).slice(0, 10) : "";
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
