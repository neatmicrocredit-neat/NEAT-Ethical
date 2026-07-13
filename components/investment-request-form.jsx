"use client";
import "@/styles/register-page.css";
import { CheckCircle2, Loader2, Send, CalendarIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}





const initialState = {
  first_name: "",
  last_name: "",
  other_names: "",
  email: "",
  phone_number: "",
  gender: "",
  date_of_birth: "",
  id_type: "",
  id_number: "",
  address: "",
  state: "",
  lga: "",
  nok_name: "",
  nok_address: "",
  nok_gender: "",
  nok_relationship: "",
  nok_phone_number: "",
  vehicle: null,
  amount: "100000",
  start_date: "",
  end_date: "",
  rollover: "false",
  payout_schedule: "monthly",
  payout_bank_name: "",
  payout_account_name: "",
  payout_account_number: "",
  other_instructions: "",
};

const inputClass = "mt-2 w-full rounded-lg border border-[color:var(--line)] \
bg-white px-4 py-3 text-sm font-bold text-[var(--ink)] outline-none transition \
focus:border-[var(--brand)]";


function SelectField({ label, name, value, onChange, options }) {
  return (
    <Select onValueChange={(val) => onChange({ target: { name, value: val } })} value={value}>
      <SelectTrigger className={inputClass}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem key={label} value={null}>
            {label}
          </SelectItem>
          {options.map((option) => typeof(option) === "object" ? (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ) : (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

// function Field({ label, children }) {
//   return (
//     <label className="block">
//       <span className="text-xs font-black uppercase text-[var(--muted-ink)]">{label}</span>
//       {children}
//     </label>
//   );
// }



export function DOBField({ label, defaultValue, onChange }) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(
    new Date(defaultValue || "2025-06-01")
  )
  const [month, setMonth] = useState(date)
  const [value, setValue] = useState(formatDate(date))

  return (
    <Field className="mx-auto w-48">
      <FieldLabel htmlFor="date-required">{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="date-required"
          value={value}
          placeholder="June 01, 2025"
          onChange={(e) => {
            const date = new Date(e.target.value)
            setValue(e.target.value)
            if (isValidDate(date)) {
              setDate(date)
              setMonth(date)
              onChange({ target: { name: "date_of_birth", value: date.toISOString().split("T")[0] } })
              console.log("Valid date selected:", date.toISOString().split("T")[0])
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
             render={
              <InputGroupButton id="date-picker" variant="ghost" size="icon-xs" aria-label="Select date">
                <CalendarIcon /><span className="sr-only">Select date</span>
              </InputGroupButton>
             }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  setDate(date)
                  setValue(formatDate(date))
                  setOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}




export default function InvestmentRequestForm() {
  const searchParams = useSearchParams();
  const preferredVehicle = searchParams.get("vehicle");
  const seededState = useMemo(() => ({ ...initialState, vehicle: preferredVehicle === "funding" ? "funding" : "ethical" }), [preferredVehicle]);
  const [form, setForm] = useState(seededState);
  const [files, setFiles] = useState({});
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateFile(event) {
    const { name, files: selectedFiles } = event.target;
    setFiles((current) => ({ ...current, [name]: selectedFiles?.[0] || null }));
  }

  async function submitRequest(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    Object.entries(files).forEach(([key, file]) => {
      if (file) payload.append(key, file);
    });

    const response = await fetch("/api/investment-requests", {
      method: "POST",
      body: payload,
    });
    const result = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(result.error || "We could not submit your request. Please try again.");
      return;
    }

    setStatus("success");
    setMessage("Request submitted. The NEAT team will contact you for processing.");
    setForm(seededState);
    setFiles({});
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={submitRequest} className="rounded-lg bg-white p-6 shadow-[0_20px_60px_rgb(33_21_95_/_0.08)] ring-1 ring-[var(--line)] sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Investment vehicle </FieldLabel>
          <SelectField name="vehicle" value={form.vehicle} onChange={updateField} className={inputClass} label={"Select a vehicle"}
           options={[
            // { value: null, label: "Neat Ethical - 24% p.a." },
            { value: "ethical", label: "Neat Ethical - 24% p.a." },
            { value: "funding", label: "Neat Funding - 60% p.a." }
          ]}
          />
        </Field>
        <Field>
          <FieldLabel> Amount </FieldLabel>
          <input name="amount" type="number" min="100000" step="1000" required value={form.amount} onChange={updateField} className={inputClass} />
        </Field>
        <Field>
          <FieldLabel>Start date </FieldLabel>

          <input name="start_date" type="date" value={form.start_date} onChange={updateField} className={inputClass} />
        </Field>
        <Field>
          <FieldLabel>End date </FieldLabel>

          <input name="end_date" type="date" value={form.end_date} onChange={updateField} className={inputClass} />
        </Field>
        <Field>
          <FieldLabel>Rollover </FieldLabel>

          <SelectField name="rollover" label={'Rollover'} value={form.rollover} onChange={updateField} className={inputClass} options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} />
        </Field>
        <Field>
          <FieldLabel>Payout schedule </FieldLabel>

          <SelectField label="Payout schedule" name="payout_schedule" value={form.payout_schedule} onChange={updateField} className={inputClass} options={["monthly", "maturity"]} />
        </Field>
      </div>

      <h2 className="mt-10 text-3xl leading-tight">Personal details</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>First name </FieldLabel>
          <input name="first_name" required value={form.first_name} onChange={updateField} className={inputClass} />
        </Field>
        <Field>
          <FieldLabel>Last name </FieldLabel>
          <input name="last_name" required value={form.last_name} onChange={updateField} className={inputClass} />
        </Field>
        
        <Field>
          <FieldLabel>Other names </FieldLabel>
          <input name="other_names" value={form.other_names} onChange={updateField} className={inputClass} />
        </Field>
        
        <Field>
          <FieldLabel>Email</FieldLabel>
          <input name="email" type="email" required value={form.email} onChange={updateField} className={inputClass} />
        </Field>
        
        <Field>
          <FieldLabel>Phone number </FieldLabel>
          <input name="phone_number" required value={form.phone_number} onChange={updateField} placeholder="e.g 070x xxx xxxx" className={inputClass} />
        </Field>

        <Field>
          <FieldLabel>Gender </FieldLabel>
          <SelectField name="gender" value={form.gender} label={'Gender'} onChange={updateField} className={inputClass} options={["", "Female", "Male"]} />
        </Field>

        <Field>
          {/* <FieldLabel>Date of birth </FieldLabel> */}
          <DOBField label="Date of birth" value={form.date_of_birth} onChange={updateField} />
          {/* <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={updateField} className={inputClass} /> */}
        </Field>
        
        <Field>
          <FieldLabel>ID type </FieldLabel>
          <SelectField
           name="id_type"
           value={form.id_type}
           onChange={updateField}
           className={inputClass}
           label={"NIN, Passport, Driver's License"}
           placeholder="NIN, Passport, Driver's License"
           options={
            [{ value: "NIN", label: "NIN" }, { value: "Passport", label: "Passport" }, { value: "Driver's License", label: "Driver's License" }]}
          />
          </Field>
        <Field>
          <FieldLabel>ID number </FieldLabel>
          <input name="id_number" value={form.id_number} onChange={updateField} className={inputClass} />
        </Field>
        
        <Field>
          <FieldLabel>State</FieldLabel>
          <input name="state" value={form.state} onChange={updateField} className={inputClass} />
        </Field>
        
        <Field>
          <FieldLabel>LGA</FieldLabel>
          <input name="lga" value={form.lga} onChange={updateField} className={inputClass} />
        </Field>
        
        <Field>
          <FieldLabel>Address</FieldLabel>
          <textarea name="address" value={form.address} onChange={updateField} className={`${inputClass} min-h-28`} /></Field>
      </div>

      <h2 className="mt-10 text-3xl leading-tight">Documents and next of kin</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Passport photo</FieldLabel>
          <input name="image" type="file" accept="image/*" onChange={updateFile} className={inputClass} />
        </Field>
        
        <Field>
          <FieldLabel>ID front </FieldLabel>
          <input name="id_front" type="file" accept="image/*,.pdf" onChange={updateFile} className={inputClass} />
        </Field>
        
        <Field>
          <FieldLabel>ID back </FieldLabel>
          <input name="id_back" type="file" accept="image/*,.pdf" onChange={updateFile} className={inputClass} />
        </Field>
        
        <Field>
          <FieldLabel>Next of kin name </FieldLabel>
          <input name="nok_name" value={form.nok_name} onChange={updateField} className={inputClass} />
        </Field>
        
        <Field>
          <FieldLabel>Next of kin phone </FieldLabel>
          <input name="nok_phone_number" value={form.nok_phone_number} onChange={updateField} className={inputClass} />
        </Field>
      
        <Field>
          <FieldLabel>Relationship </FieldLabel>
          <SelectField name="nok_relationship" label={'Next of kin relationship'} value={form.nok_relationship} onChange={updateField} className={inputClass} options={["", "Father", "Mother", "Spouse", "Sibling", "Friend"]} />
        </Field>
        
        <Field>
          <FieldLabel>Next of kin gender </FieldLabel>
          <SelectField name="nok_gender" label={'Next of kin gender'} value={form.nok_gender} onChange={updateField} className={inputClass} options={["Female", "Male"]} />
        </Field>
        
        <Field>
          <FieldLabel>Next of kin address</FieldLabel>
          <textarea name="nok_address" value={form.nok_address} onChange={updateField} className={`${inputClass} min-h-28`} />
        </Field>
      </div>

      <h2 className="mt-10 text-3xl leading-tight">Payout account</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel>Payout bank name</FieldLabel>
          <input name="payout_bank_name" value={form.payout_bank_name} onChange={updateField} className={inputClass} />
        </Field>
        
        <Field>
          <FieldLabel>Payout account name</FieldLabel>
          <input name="payout_account_name" value={form.payout_account_name} onChange={updateField} className={inputClass} />
        </Field>
        
        <Field>
          <FieldLabel>Payout account number</FieldLabel>
          <input name="payout_account_number" value={form.payout_account_number} onChange={updateField} className={inputClass} />
        </Field>
      </div>
      <Field>
        <FieldLabel>Other instructions</FieldLabel>
        <textarea name="other_instructions" value={form.other_instructions} onChange={updateField} className={`${inputClass} mt-5 min-h-28`} />
      </Field>

      {message ? (
        <p className={`mt-6 flex items-center gap-2 rounded-lg p-4 text-sm font-bold ${status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {status === "success" ? <CheckCircle2 className="size-5" /> : null}
          {message}
        </p>
      ) : null}

      <button type="submit" disabled={status === "loading"} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-black text-white transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70">
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Submit request
      </button>
    </form>
  );
}


