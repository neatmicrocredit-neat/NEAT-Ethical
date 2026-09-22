"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

const fields = [
  ["first_name", "First name"], ["last_name", "Last name"], ["other_names", "Other names"],
  ["email", "Email"], ["phone_number", "Phone number"], ["gender", "Gender"],
  ["date_of_birth", "Date of birth"], ["id_type", "ID type"], ["id_number", "ID number"],
  ["state", "State"], ["lga", "LGA"], ["address", "Address"],
  ["nok_name", "Next of kin name"], ["nok_phone_number", "Next of kin phone"],
  ["nok_relationship", "Next of kin relationship"], ["nok_gender", "Next of kin gender"],
  ["nok_address", "Next of kin address"], ["amount", "Investment amount"],
  ["start_date", "Start date"], ["end_date", "End date"],
  ["payout_bank_name", "Payout bank name"], ["payout_account_name", "Payout account name"],
  ["payout_account_number", "Payout account number"], ["other_instructions", "Other instructions"],
];

const required = new Set(["first_name", "last_name", "email", "phone_number", "nok_name", "nok_phone_number", "nok_relationship", "amount"]);
const wide = new Set(["address", "nok_address", "other_instructions"]);
const inputClass = "mt-2 w-full rounded-xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-blue-100";

export default function InvestmentRequestForm() {
  const params = useSearchParams();
  const [form, setForm] = useState({ vehicle: params.get("vehicle") === "funding" ? "funding" : "ethical", amount: params.get("amount") || "100000", rollover: "false", payout_schedule: "monthly" });
  const [files, setFiles] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }

  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage(""); setError(false);
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value || ""));
    Object.entries(files).forEach(([key, file]) => { if (file) payload.append(key, file); });
    try {
      const response = await fetch("/api/investment-requests/onboard", { method: "POST", body: payload });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not submit your request.");
      setMessage("Your investment request was received. Check your email for your account details and one-time password.");
      setForm({ vehicle: "ethical", amount: "100000", rollover: "false", payout_schedule: "monthly" }); setFiles({}); event.currentTarget.reset();
    } catch (submitError) { setError(true); setMessage(submitError.message); }
    setBusy(false);
  }

  return <form onSubmit={submit} className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-[var(--line)] sm:p-7">
    <div className="mb-7 rounded-2xl bg-blue-50 p-4 text-sm font-semibold leading-6 text-slate-600">Complete your profile once. These details and your next-of-kin information will be saved to your NEAT customer account for future requests.</div>
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map(([name, label]) => {
        const isDate = name === "date_of_birth" || name === "start_date" || name === "end_date";
        const isEmail = name === "email";
        const isNumber = name === "amount" || name === "phone_number" || name === "nok_phone_number" || name === "payout_account_number";
        const isLong = wide.has(name);
        return <label key={name} className={`text-xs font-black uppercase tracking-wider text-slate-500 ${isLong ? "sm:col-span-2" : ""}`}>{label}<input required={required.has(name)} type={isDate ? "date" : isEmail ? "email" : isNumber ? "text" : "text"} name={name} value={form[name] || ""} onChange={update} className={inputClass} /></label>;
      })}
      <label className="text-xs font-black uppercase tracking-wider text-slate-500">Investment vehicle<select name="vehicle" value={form.vehicle} onChange={update} className={inputClass}><option value="ethical">Ethical Investments</option><option value="funding">Ethical Funding</option></select></label>
      <label className="text-xs font-black uppercase tracking-wider text-slate-500">Payout schedule<select name="payout_schedule" value={form.payout_schedule} onChange={update} className={inputClass}><option value="monthly">Monthly</option><option value="maturity">At maturity</option></select></label>
      <label className="text-xs font-black uppercase tracking-wider text-slate-500">Rollover<select name="rollover" value={form.rollover} onChange={update} className={inputClass}><option value="false">No</option><option value="true">Yes</option></select></label>
      <label className="text-xs font-black uppercase tracking-wider text-slate-500 sm:col-span-2">Identity documents<input type="file" multiple accept="image/*,.pdf" onChange={(event) => setFiles({ id_documents: event.target.files?.[0] })} className={inputClass} /></label>
    </div>
    {message ? <p role="status" className={`mt-6 rounded-xl px-4 py-3 text-sm font-bold ${error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{message}</p> : null}
    <button type="submit" disabled={busy} className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[var(--brand)] px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Submitting request..." : "Submit investment request"}</button>
  </form>;
}
