"use client";
import "@/styles/register-page.css";
import { ArrowLeft, ArrowRight, CalendarIcon, CheckCircle2, Loader2, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

const steps = [
  {
    id: "personal",
    eyebrow: "Step 1 of 4",
    title: "Personal details",
    description: "Tell us who you are, how to reach you, and the identification details needed to open the request.",
    requiredFields: ["first_name", "last_name", "email", "phone_number"],
  },
  {
    id: "documents",
    eyebrow: "Step 2 of 4",
    title: "Documents and next of kin",
    description: "Upload your passport photo and ID files, then add the next of kin contact details for the record.",
    requiredFields: ["nok_name", "nok_phone_number", "nok_relationship"],
  },
  {
    id: "investment",
    eyebrow: "Step 3 of 4",
    title: "Investment details",
    description: "Choose the investment vehicle, amount, dates, payout schedule, and preferred bank account.",
    requiredFields: ["vehicle", "amount"],
  },
  {
    id: "review",
    eyebrow: "Step 4 of 4",
    title: "Review and submit",
    description: "Review the details before sending the request to the NEAT team.",
    requiredFields: [],
  },
];

const fieldLabels = {
  first_name: "First name",
  last_name: "Last name",
  email: "Email",
  phone_number: "Phone number",
  vehicle: "Investment vehicle",
  amount: "Amount",
  nok_name: "Next of kin name",
  nok_phone_number: "Next of kin phone",
  nok_relationship: "Next of kin relationship",
};

const inputClass = "mt-2 w-full rounded-lg border border-[color:var(--line)] bg-white px-4 py-3 text-sm font-bold text-[var(--ink)] outline-none transition focus:border-[var(--brand)]";
const navButtonClass = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60";

function SelectField({ label, name, value, onChange, options }) {
  return (
    <Select onValueChange={(val) => onChange({ target: { name, value: val } })} value={value || ""}>
      <SelectTrigger className={inputClass}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => typeof option === "object" ? (
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

function formatDate(date) {
  if (!date) return "";

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date) {
  return date ? !isNaN(date.getTime()) : false;
}

function DOBField({ label, value, onChange }) {
  const initialDate = value ? new Date(value) : undefined;
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(initialDate);
  const [month, setMonth] = useState(initialDate || new Date());
  const [inputValue, setInputValue] = useState(formatDate(initialDate));

  function commitDate(nextDate) {
    if (!nextDate) return;
    setDate(nextDate);
    setMonth(nextDate);
    setInputValue(formatDate(nextDate));
    onChange({ target: { name: "date_of_birth", value: nextDate.toISOString().split("T")[0] } });
  }

  return (
    <Field className="w-full">
      <FieldLabel htmlFor="date-of-birth">{label}</FieldLabel>
      <InputGroup className="mt-2">
        <InputGroupInput
          id="date-of-birth"
          value={inputValue}
          placeholder="June 01, 1990"
          onChange={(event) => {
            const nextDate = new Date(event.target.value);
            setInputValue(event.target.value);
            if (isValidDate(nextDate)) commitDate(nextDate);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
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
            <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(nextDate) => {
                  commitDate(nextDate);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

function formatMoney(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return value || "Not provided";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);
}

function displayValue(value, fallback = "Not provided") {
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  return value || fallback;
}

function ReviewRow({ label, value }) {
  return (
    <div className="rounded-lg border border-[color:var(--line)] bg-white px-4 py-3">
      <p className="text-[0.7rem] font-black uppercase text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-[var(--ink)]">{value}</p>
    </div>
  );
}

export default function InvestmentRequestForm() {
  const searchParams = useSearchParams();
  const preferredVehicle = searchParams.get("vehicle");
  const seededState = useMemo(() => ({ ...initialState, vehicle: preferredVehicle === "funding" ? "funding" : "ethical" }), [preferredVehicle]);
  const [form, setForm] = useState(seededState);
  const [files, setFiles] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateFile(event) {
    const { name, files: selectedFiles } = event.target;
    setFiles((current) => ({ ...current, [name]: selectedFiles?.[0] || null }));
  }

  function getMissingFields(stepIndex = currentStep) {
    return steps[stepIndex].requiredFields.filter((fieldName) => !String(form[fieldName] || "").trim());
  }

  function goToStep(nextStep) {
    setMessage("");
    setCurrentStep(nextStep);
  }

  function goNext() {
    const missingFields = getMissingFields();
    if (missingFields.length) {
      setStatus("error");
      setMessage(`Please complete ${missingFields.map((fieldName) => fieldLabels[fieldName]).join(", ")} before continuing.`);
      return;
    }

    goToStep(Math.min(currentStep + 1, steps.length - 1));
  }

  function findFirstIncompleteStep() {
    return steps.findIndex((candidate) => candidate.requiredFields.some((fieldName) => !String(form[fieldName] || "").trim()));
  }

  async function submitRequest(event) {
    event.preventDefault();

    const incompleteStep = findFirstIncompleteStep();
    if (incompleteStep !== -1) {
      setStatus("error");
      setCurrentStep(incompleteStep);
      const missingFields = steps[incompleteStep].requiredFields.filter((fieldName) => !String(form[fieldName] || "").trim());
      setMessage(`Please complete ${missingFields.map((fieldName) => fieldLabels[fieldName]).join(", ")} before submitting.`);
      return;
    }

    setStatus("loading");
    setMessage("");

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value ?? ""));
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
    setCurrentStep(0);
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={submitRequest} className="rounded-lg bg-white p-4 shadow-[0_20px_60px_rgb(33_21_95_/_0.08)] ring-1 ring-[var(--line)] sm:p-6">
      <div className="grid gap-2 sm:grid-cols-4">
        {steps.map((item, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goToStep(index)}
              className={`rounded-lg border px-3 py-3 text-left transition ${isActive ? "border-[var(--brand)] bg-[var(--soft)] text-[var(--brand)]" : "border-[color:var(--line)] bg-white text-[var(--muted-ink)] hover:border-[var(--brand)]"}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="flex items-center gap-2 text-[0.68rem] font-black uppercase">
                <span className={`grid size-6 place-items-center rounded-full ${isComplete ? "bg-emerald-600 text-white" : isActive ? "bg-[var(--brand)] text-white" : "bg-[var(--soft)] text-[var(--brand)]"}`}>
                  {isComplete ? <CheckCircle2 className="size-4" /> : index + 1}
                </span>
                {item.eyebrow}
              </span>
              <span className="mt-2 block text-sm font-black text-[var(--ink)]">{item.title}</span>
            </button>
          );
        })}
      </div>

      <Card className="mt-5 rounded-lg border border-[color:var(--line)] shadow-none ring-0">
        <CardHeader>
          <p className="text-xs font-black uppercase text-[var(--brand)]">{step.eyebrow}</p>
          <CardTitle className="text-2xl normal-case tracking-normal text-[var(--ink)]">{step.title}</CardTitle>
          <CardDescription className="font-semibold text-[var(--muted-ink)]">{step.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {step.id === "personal" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>First name</FieldLabel>
                <input name="first_name" required value={form.first_name} onChange={updateField} className={inputClass} />
              </Field>
              <Field>
                <FieldLabel>Last name</FieldLabel>
                <input name="last_name" required value={form.last_name} onChange={updateField} className={inputClass} />
              </Field>
              <Field>
                <FieldLabel>Other names</FieldLabel>
                <input name="other_names" value={form.other_names} onChange={updateField} className={inputClass} />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <input name="email" type="email" required value={form.email} onChange={updateField} className={inputClass} />
              </Field>
              <Field>
                <FieldLabel>Phone number</FieldLabel>
                <input name="phone_number" required value={form.phone_number} onChange={updateField} placeholder="e.g 070x xxx xxxx" className={inputClass} />
              </Field>
              <Field>
                <FieldLabel>Gender</FieldLabel>
                <SelectField name="gender" value={form.gender} label="Gender" onChange={updateField} options={["Female", "Male"]} />
              </Field>
              <DOBField label="Date of birth" value={form.date_of_birth} onChange={updateField} />
              <Field>
                <FieldLabel>ID type</FieldLabel>
                <SelectField
                  name="id_type"
                  value={form.id_type}
                  onChange={updateField}
                  label="NIN, Passport, Driver's License"
                  options={[
                    { value: "NIN", label: "NIN" },
                    { value: "Passport", label: "Passport" },
                    { value: "Driver's License", label: "Driver's License" },
                  ]}
                />
              </Field>
              <Field>
                <FieldLabel>ID number</FieldLabel>
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
                <textarea name="address" value={form.address} onChange={updateField} className={`${inputClass} min-h-28`} />
              </Field>
            </div>
          ) : null}

          {step.id === "documents" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Passport photo</FieldLabel>
                <input name="image" type="file" accept="image/*" onChange={updateFile} className={inputClass} />
              </Field>
              <Field>
                <FieldLabel>ID front</FieldLabel>
                <input name="id_front" type="file" accept="image/*,.pdf" onChange={updateFile} className={inputClass} />
              </Field>
              <Field>
                <FieldLabel>ID back</FieldLabel>
                <input name="id_back" type="file" accept="image/*,.pdf" onChange={updateFile} className={inputClass} />
              </Field>
              <Field>
                <FieldLabel>Next of kin name</FieldLabel>
                <input name="nok_name" value={form.nok_name} onChange={updateField} className={inputClass} />
              </Field>
              <Field>
                <FieldLabel>Next of kin phone</FieldLabel>
                <input name="nok_phone_number" value={form.nok_phone_number} onChange={updateField} className={inputClass} />
              </Field>
              <Field>
                <FieldLabel>Relationship</FieldLabel>
                <SelectField name="nok_relationship" label="Next of kin relationship" value={form.nok_relationship} onChange={updateField} options={["Father", "Mother", "Spouse", "Sibling", "Friend"]} />
              </Field>
              <Field>
                <FieldLabel>Next of kin gender</FieldLabel>
                <SelectField name="nok_gender" label="Next of kin gender" value={form.nok_gender} onChange={updateField} options={["Female", "Male"]} />
              </Field>
              <Field>
                <FieldLabel>Next of kin address</FieldLabel>
                <textarea name="nok_address" value={form.nok_address} onChange={updateField} className={`${inputClass} min-h-28`} />
              </Field>
            </div>
          ) : null}

          {step.id === "investment" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Investment vehicle</FieldLabel>
                  <SelectField
                    name="vehicle"
                    value={form.vehicle}
                    onChange={updateField}
                    label="Select a vehicle"
                    options={[
                      { value: "ethical", label: "Neat Ethical - 24% p.a." },
                      { value: "funding", label: "Neat Funding - 60% p.a." },
                    ]}
                  />
                </Field>
                <Field>
                  <FieldLabel>Amount</FieldLabel>
                  <input name="amount" type="number" min="100000" step="1000" required value={form.amount} onChange={updateField} className={inputClass} />
                </Field>
                <Field>
                  <FieldLabel>Start date</FieldLabel>
                  <input name="start_date" type="date" value={form.start_date} onChange={updateField} className={inputClass} />
                </Field>
                <Field>
                  <FieldLabel>End date</FieldLabel>
                  <input name="end_date" type="date" value={form.end_date} onChange={updateField} className={inputClass} />
                </Field>
                <Field>
                  <FieldLabel>Rollover</FieldLabel>
                  <SelectField name="rollover" label="Rollover" value={form.rollover} onChange={updateField} options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]} />
                </Field>
                <Field>
                  <FieldLabel>Payout schedule</FieldLabel>
                  <SelectField label="Payout schedule" name="payout_schedule" value={form.payout_schedule} onChange={updateField} options={[{ value: "monthly", label: "Monthly" }, { value: "maturity", label: "At maturity" }]} />
                </Field>
              </div>
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
              <Field className="mt-5">
                <FieldLabel>Other instructions</FieldLabel>
                <textarea name="other_instructions" value={form.other_instructions} onChange={updateField} className={`${inputClass} min-h-28`} />
              </Field>
            </>
          ) : null}

          {step.id === "review" ? (
            <Accordion defaultValue={["personal"]} className="rounded-lg border border-[color:var(--line)] px-4">
              <AccordionItem value="personal">
                <AccordionTrigger>Personal details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ReviewRow label="Name" value={`${form.first_name} ${form.other_names} ${form.last_name}`.replace(/\s+/g, " ").trim() || "Not provided"} />
                    <ReviewRow label="Email" value={displayValue(form.email)} />
                    <ReviewRow label="Phone" value={displayValue(form.phone_number)} />
                    <ReviewRow label="Gender" value={displayValue(form.gender)} />
                    <ReviewRow label="Date of birth" value={displayValue(form.date_of_birth)} />
                    <ReviewRow label="ID" value={`${displayValue(form.id_type)} ${displayValue(form.id_number, "")}`.trim()} />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="documents">
                <AccordionTrigger>Documents and next of kin</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ReviewRow label="Passport photo" value={files.image?.name || "Not attached"} />
                    <ReviewRow label="ID front" value={files.id_front?.name || "Not attached"} />
                    <ReviewRow label="ID back" value={files.id_back?.name || "Not attached"} />
                    <ReviewRow label="Next of kin" value={displayValue(form.nok_name)} />
                    <ReviewRow label="Next of kin phone" value={displayValue(form.nok_phone_number)} />
                    <ReviewRow label="Relationship" value={displayValue(form.nok_relationship)} />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="investment">
                <AccordionTrigger>Investment details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ReviewRow label="Vehicle" value={form.vehicle === "funding" ? "Neat Funding" : "Neat Ethical"} />
                    <ReviewRow label="Amount" value={formatMoney(form.amount)} />
                    <ReviewRow label="Start date" value={displayValue(form.start_date)} />
                    <ReviewRow label="End date" value={displayValue(form.end_date)} />
                    <ReviewRow label="Rollover" value={displayValue(form.rollover)} />
                    <ReviewRow label="Payout schedule" value={form.payout_schedule === "maturity" ? "At maturity" : "Monthly"} />
                    <ReviewRow label="Bank" value={displayValue(form.payout_bank_name)} />
                    <ReviewRow label="Account" value={`${displayValue(form.payout_account_name)} ${displayValue(form.payout_account_number, "")}`.trim()} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
        </CardContent>
      </Card>

      {message ? (
        <p className={`mt-6 flex items-center gap-2 rounded-lg p-4 text-sm font-bold ${status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {status === "success" ? <CheckCircle2 className="size-5" /> : null}
          {message}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          disabled={isFirstStep || status === "loading"}
          onClick={() => goToStep(Math.max(currentStep - 1, 0))}
          className={`${navButtonClass} border border-[color:var(--line)] bg-white text-[var(--ink)] hover:border-[var(--brand)]`}
        >
          <ArrowLeft className="size-4" /> Back
        </button>

        {isLastStep ? (
          <button type="submit" disabled={status === "loading"} className={`${navButtonClass} bg-[var(--brand)] text-white hover:-translate-y-1`}>
            {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Submit request
          </button>
        ) : (
          <button type="button" disabled={status === "loading"} onClick={goNext} className={`${navButtonClass} bg-[var(--brand)] text-white hover:-translate-y-1`}>
            Continue <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </form>
  );
}
