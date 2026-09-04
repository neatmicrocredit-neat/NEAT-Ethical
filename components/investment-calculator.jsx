"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowRight, Banknote, CalendarRange, Info, RefreshCw, ShieldCheck, Wallet } from "lucide-react";

const vehicles = {
  ethical: {
    name: "Ethical Investments",
    short: "Neat Ethical",
    rate: 0.24,
    monthlyRate: 0.02,
    summary: "A steady placement into Neat products with a flat 24% annual profit margin.",
    note: "Lower-risk product placement compared with the lending pool.",
  },
  funding: {
    name: "Ethical Funding",
    short: "Neat Funding",
    rate: 0.6,
    monthlyRate: 0.05,
    summary: "Capital placed into Neat Microfinance lending pools for SME loans, with added lending risk.",
    note: "Includes SME lending exposure and related repayment risk.",
  },
};

const TERMS = [3, 6, 9, 12, 24];
const QUICK_AMOUNTS = [100000, 500000, 1000000, 5000000];
const MIN_AMOUNT = 100000;
const MAX_AMOUNT = 50000000;

function money(value, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

function compactMoney(value) {
  if (!Number.isFinite(value)) return "₦0";
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}m`;
  if (value >= 1000) return `₦${Math.round(value / 1000)}k`;
  return `₦${Math.round(value)}`;
}

function groupDigits(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("en-NG") : "";
}

export default function InvestmentCalculator() {
  const [vehicleKey, setVehicleKey] = useState("ethical");
  const [amount, setAmount] = useState(1000000);
  const [months, setMonths] = useState(12);
  const [rollover, setRollover] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const vehicle = vehicles[vehicleKey];
  const amountFieldId = useId();
  const belowMinimum = Number(amount) > 0 && Number(amount) < MIN_AMOUNT;

  const projection = useMemo(() => {
    const principal = Number(amount) || 0;
    const term = Number(months) || 0;
    const rate = vehicle.monthlyRate;
    const schedule = [];

    let balance = principal;
    let paidOut = 0;

    for (let month = 1; month <= term; month += 1) {
      const opening = balance;
      const profit = opening * rate;

      if (rollover) {
        balance = opening + profit;
      } else {
        paidOut += profit;
      }

      schedule.push({
        month,
        opening,
        profit,
        closing: rollover ? balance : opening,
        cumulativeProfit: rollover ? balance - principal : paidOut,
      });
    }

    const totalProfit = rollover ? balance - principal : paidOut;

    return {
      principal,
      term,
      schedule,
      totalProfit,
      firstMonthProfit: principal * rate,
      maturityValue: principal + totalProfit,
    };
  }, [amount, months, rollover, vehicle]);

  const visibleSchedule = showFullSchedule ? projection.schedule : projection.schedule.slice(0, 6);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
      {/* ---------------------------------------------------------------- inputs */}
      <section className="min-w-0 rounded-lg bg-[var(--brand)] p-6 text-white shadow-[0_30px_80px_color-mix(in_oklab,var(--brand)_28%,transparent)] sm:p-8 lg:p-10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-white/70 sm:text-sm">Return model</p>
            <h2 className="mt-2 text-3xl leading-none sm:text-4xl lg:text-5xl">Plan with the real NEAT vehicles.</h2>
          </div>
          <Wallet aria-hidden="true" className="hidden size-14 shrink-0 rounded-full bg-white/14 p-3.5 sm:block" />
        </div>

        {/* vehicle */}
        <fieldset className="mt-8 min-w-0">
          <legend className="text-xs font-black uppercase tracking-wide text-white/70">Investment vehicle</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {Object.entries(vehicles).map(([key, option]) => {
              const active = vehicleKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setVehicleKey(key)}
                  className={`min-w-0 rounded-lg border p-4 text-left transition ${
                    active
                      ? "border-[var(--brand-2)] bg-white text-[var(--ink)] shadow-lg"
                      : "border-white/25 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <span className="block text-sm font-black">{option.name}</span>
                  <span className="mt-2 block text-2xl font-black sm:text-3xl">
                    {Math.round(option.rate * 100)}% <span className="text-base font-black">p.a.</span>
                  </span>
                  <span className="mt-1 block text-xs font-bold opacity-75">
                    {Math.round(option.monthlyRate * 100)}% monthly flat profit
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* capital */}
        <div className="mt-8 min-w-0">
          <label htmlFor={amountFieldId} className="text-xs font-black uppercase tracking-wide text-white/70">
            Capital amount
          </label>
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-white px-4 py-3">
            <span className="text-lg font-black text-[var(--muted-ink)]">₦</span>
            <input
              id={amountFieldId}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={groupDigits(amount)}
              onChange={(event) => setAmount(Number(event.target.value.replace(/\D/g, "")) || 0)}
              className="w-full min-w-0 bg-transparent text-xl font-black tabular-nums text-[var(--ink)] outline-none sm:text-2xl"
            />
          </div>

          <input
            type="range"
            aria-label="Capital amount slider"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step={50000}
            value={Math.min(Math.max(Number(amount) || MIN_AMOUNT, MIN_AMOUNT), MAX_AMOUNT)}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-[var(--brand-2)]"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setAmount(quick)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-black transition ${
                  Number(amount) === quick ? "bg-[var(--brand-2)] text-white" : "bg-white/14 text-white hover:bg-white/24"
                }`}
              >
                {compactMoney(quick)}
              </button>
            ))}
          </div>

          {belowMinimum ? (
            <p className="mt-3 flex items-start gap-2 text-xs font-bold text-[var(--brand-2)]">
              <Info aria-hidden="true" className="mt-px size-4 shrink-0" />
              Placements start at {money(MIN_AMOUNT)}. You can still model smaller figures here.
            </p>
          ) : null}
        </div>

        {/* term */}
        <fieldset className="mt-8 min-w-0">
          <legend className="text-xs font-black uppercase tracking-wide text-white/70">Investment term</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {TERMS.map((term) => {
              const active = Number(months) === term;
              return (
                <button
                  key={term}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMonths(term)}
                  className={`min-w-[4.5rem] flex-1 rounded-lg px-3 py-2.5 text-sm font-black transition sm:flex-none ${
                    active ? "bg-white text-[var(--ink)]" : "bg-white/12 text-white hover:bg-white/22"
                  }`}
                >
                  {term} mo
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* payout */}
        <fieldset className="mt-8 min-w-0">
          <legend className="text-xs font-black uppercase tracking-wide text-white/70">Profit handling</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              aria-pressed={!rollover}
              onClick={() => setRollover(false)}
              className={`flex items-start gap-3 rounded-lg border p-4 text-left transition ${
                !rollover ? "border-[var(--brand-2)] bg-white/95 text-[var(--ink)]" : "border-white/25 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Banknote aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-black">Take profit monthly</span>
                <span className="mt-1 block text-xs font-semibold opacity-75">Flat profit paid out each month</span>
              </span>
            </button>
            <button
              type="button"
              aria-pressed={rollover}
              onClick={() => setRollover(true)}
              className={`flex items-start gap-3 rounded-lg border p-4 text-left transition ${
                rollover ? "border-[var(--brand-2)] bg-white/95 text-[var(--ink)]" : "border-white/25 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <RefreshCw aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-black">Roll profit over</span>
                <span className="mt-1 block text-xs font-semibold opacity-75">Profit compounds into your capital</span>
              </span>
            </button>
          </div>
        </fieldset>

        {/* results */}
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Stat
            label={rollover ? "First month profit" : "Monthly profit"}
            value={money(projection.firstMonthProfit)}
          />
          <Stat label="Total profit" value={money(projection.totalProfit)} />
          <Stat label="Maturity value" value={money(projection.maturityValue)} highlight />
        </div>

        <BalanceChart projection={projection} rollover={rollover} />

        <p className="mt-6 text-xs font-semibold leading-5 text-white/65">
          {rollover
            ? "Compounded projection at a flat monthly rate. "
            : "Flat projection only. "}
          Final approval, dates, and documentation are confirmed by the NEAT team.
        </p>
      </section>

      {/* ------------------------------------------------------------- summary */}
      <div className="min-w-0 space-y-5 lg:sticky lg:top-24">
        <section className="landing-panel min-w-0 p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_oklab,var(--brand)_10%,white)] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[var(--brand)] ring-1 ring-[color:var(--line)]">
            <ShieldCheck aria-hidden="true" className="size-4" />
            {vehicle.short}
          </span>
          <h3 className="mt-5 text-2xl leading-tight sm:text-3xl">{vehicle.name}</h3>
          <p className="mt-4 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{vehicle.summary}</p>

          <dl className="mt-6 space-y-3 border-t border-dashed border-[color:var(--line)] pt-5">
            <SummaryRow label="Capital" value={money(projection.principal)} />
            <SummaryRow label="Term" value={`${projection.term} months`} />
            <SummaryRow label="Monthly rate" value={`${Math.round(vehicle.monthlyRate * 100)}% flat`} />
            <SummaryRow label="Profit handling" value={rollover ? "Rolled over" : "Paid monthly"} />
            <SummaryRow label="Maturity value" value={money(projection.maturityValue)} emphasis />
          </dl>

          <p className="mt-6 flex items-start gap-3 rounded-lg bg-[var(--soft)] p-4 text-xs font-bold leading-5 text-[var(--ink)]">
            <Info aria-hidden="true" className="mt-px size-4 shrink-0 text-[var(--brand)]" />
            {vehicle.note}
          </p>

          <Link
            href={`/investment-request?vehicle=${vehicleKey}&amount=${Math.max(Math.round(Number(amount) || 0), MIN_AMOUNT)}`}
            className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5"
          >
            Make this investment
            <ArrowRight aria-hidden="true" className="size-4 transition group-hover:translate-x-1" />
          </Link>
          <p className="mt-3 text-center text-xs font-semibold text-[var(--muted-ink)]">
            The team confirms your details before funding.
          </p>
        </section>

        <section className="landing-panel min-w-0 overflow-hidden p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <CalendarRange aria-hidden="true" className="size-5 text-[var(--brand)]" />
            <h3 className="text-lg font-black text-[var(--ink)]">Payout schedule</h3>
          </div>

          <div className="-mx-2 mt-5 overflow-x-auto">
            <table className="w-full min-w-[19rem] border-collapse text-left">
              <thead>
                <tr className="text-[11px] font-black uppercase tracking-wide text-[var(--muted-ink)]">
                  <th scope="col" className="px-2 pb-3">Month</th>
                  <th scope="col" className="px-2 pb-3 text-right">Profit</th>
                  <th scope="col" className="px-2 pb-3 text-right">{rollover ? "Balance" : "Cumulative"}</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold tabular-nums text-[var(--ink)]">
                {visibleSchedule.map((row) => (
                  <tr key={row.month} className="border-t border-dashed border-[color:var(--line)]">
                    <td className="px-2 py-2.5 text-[var(--muted-ink)]">{row.month}</td>
                    <td className="px-2 py-2.5 text-right">{money(row.profit)}</td>
                    <td className="px-2 py-2.5 text-right text-[var(--brand)]">
                      {money(rollover ? row.closing : row.cumulativeProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {projection.schedule.length > 6 ? (
            <button
              type="button"
              onClick={() => setShowFullSchedule((open) => !open)}
              className="mt-4 text-sm font-black text-[var(--brand)] underline-offset-4 hover:underline"
            >
              {showFullSchedule ? "Show first 6 months" : `Show all ${projection.schedule.length} months`}
            </button>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }) {
  return (
    <div className={`min-w-0 rounded-lg p-4 backdrop-blur sm:p-5 ${highlight ? "bg-[var(--brand-2)] text-white" : "bg-white/14 text-white"}`}>
      <p className={`text-xs font-bold ${highlight ? "text-white" : "text-white/65"}`}>{label}</p>
      <p className="mt-6 break-words text-xl font-black tabular-nums sm:text-2xl">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, emphasis = false }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted-ink)]">{label}</dt>
      <dd className={`text-right tabular-nums ${emphasis ? "text-lg font-black text-[var(--brand)]" : "text-sm font-black text-[var(--ink)]"}`}>
        {value}
      </dd>
    </div>
  );
}

function BalanceChart({ projection, rollover }) {
  const { schedule, principal } = projection;
  if (!schedule.length || principal <= 0) return null;

  const width = 640;
  const height = 200;
  const maxValue = principal + schedule[schedule.length - 1].cumulativeProfit;
  const gap = schedule.length > 12 ? 3 : 6;
  const barWidth = (width - gap * (schedule.length - 1)) / schedule.length;

  return (
    <figure className="mt-8 min-w-0">
      <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-white/70">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-white/45" />
          Capital
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[var(--brand-2)]" />
          {rollover ? "Compounded profit" : "Profit received"}
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Projected value over ${schedule.length} months, ending at ${money(projection.maturityValue)}`}
        className="mt-4 h-auto w-full"
      >
        {schedule.map((row, index) => {
          const total = principal + row.cumulativeProfit;
          const totalHeight = (total / maxValue) * height;
          const capitalHeight = (principal / maxValue) * height;
          const x = index * (barWidth + gap);

          return (
            <g key={row.month}>
              <rect
                x={x}
                y={height - totalHeight}
                width={barWidth}
                height={totalHeight}
                rx="3"
                fill="var(--brand-2)"
              />
              <rect
                x={x}
                y={height - capitalHeight}
                width={barWidth}
                height={capitalHeight}
                rx="3"
                fill="rgba(255,255,255,0.45)"
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex justify-between text-[11px] font-bold text-white/60">
        <span>Month 1</span>
        <span>{compactMoney(projection.maturityValue)} by month {schedule.length}</span>
      </div>
    </figure>
  );
}
