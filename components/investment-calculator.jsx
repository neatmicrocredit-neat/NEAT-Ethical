"use client";

import Link from "next/link";
import { ArrowRight, Calculator, CircleDollarSign, Info, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

const vehicles = {
  ethical: {
    name: "Ethical Investments",
    rate: 0.24,
    monthlyRate: 0.02,
    summary: "A steady placement into Neat products with a flat 24% annual profit margin.",
  },
  funding: {
    name: "Ethical Funding",
    rate: 0.6,
    monthlyRate: 0.05,
    summary: "Capital placed into Neat Microfinance lending pools for SME loans, with added lending risk.",
  },
};

function money(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export default function InvestmentCalculator() {
  const [vehicleKey, setVehicleKey] = useState("ethical");
  const [amount, setAmount] = useState(1000000);
  const [months, setMonths] = useState(12);
  const vehicle = vehicles[vehicleKey];

  const projection = useMemo(() => {
    const principal = Number(amount) || 0;
    const term = Number(months) || 0;
    const monthlyProfit = principal * vehicle.monthlyRate;
    const totalProfit = monthlyProfit * term;

    return {
      monthlyProfit,
      totalProfit,
      maturityValue: principal + totalProfit,
    };
  }, [amount, months, vehicle]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <section className="rounded-lg bg-[var(--brand)] p-7 text-white shadow-[0_30px_80px_rgb(44_22_182_/_0.22)] sm:p-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-white/70">Return model</p>
            <h2 className="mt-3 text-4xl leading-none sm:text-5xl">Plan with the real NEAT vehicles.</h2>
          </div>
          <Calculator className="hidden size-16 rounded-full bg-white/14 p-4 sm:block" />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {Object.entries(vehicles).map(([key, option]) => (
            <button
              key={key}
              type="button"
              onClick={() => setVehicleKey(key)}
              className={`rounded-lg border p-4 text-left transition ${
                vehicleKey === key ? "border-[var(--brand-2)] bg-white text-[var(--ink)]" : "border-white/20 bg-white/10 text-white hover:bg-white/16"
              }`}
            >
              <span className="text-sm font-black">{option.name}</span>
              <span className="mt-2 block text-2xl font-black">{Math.round(option.rate * 100)}% p.a.</span>
              <span className="mt-1 block text-xs font-bold opacity-75">{Math.round(option.monthlyRate * 100)}% monthly flat profit</span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-white/75">Capital amount</span>
            <input
              type="number"
              min="0"
              step="50000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/20 bg-white px-4 py-3 text-base font-black text-[var(--ink)] outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black text-white/75">Investment term</span>
            <select
              value={months}
              onChange={(event) => setMonths(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/20 bg-white px-4 py-3 text-base font-black text-[var(--ink)] outline-none"
            >
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="9">9 months</option>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
            </select>
          </label>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white/14 p-5 backdrop-blur">
            <p className="text-xs font-bold text-white/65">Monthly profit</p>
            <p className="mt-8 text-2xl font-black sm:text-3xl">{money(projection.monthlyProfit)}</p>
          </div>
          <div className="rounded-lg bg-white/14 p-5 backdrop-blur">
            <p className="text-xs font-bold text-white/65">Total profit</p>
            <p className="mt-8 text-2xl font-black sm:text-3xl">{money(projection.totalProfit)}</p>
          </div>
          <div className="rounded-lg bg-white/14 p-5 backdrop-blur">
            <p className="text-xs font-bold text-white/65">Maturity value</p>
            <p className="mt-8 text-2xl font-black sm:text-3xl">{money(projection.maturityValue)}</p>
          </div>
        </div>
        <p className="mt-6 text-xs font-semibold text-white/65">Flat projection only. Final approval, dates, and documentation are confirmed by the NEAT team.</p>
      </section>

      <section className="landing-panel p-7 sm:p-10">
        <CircleDollarSign className="size-12 rounded-full bg-[var(--brand-2)] p-2.5 text-[var(--ink)]" />
        <h3 className="mt-8 text-3xl leading-tight">{vehicle.name}</h3>
        <p className="mt-5 text-sm font-semibold leading-6 text-[var(--muted-ink)]">{vehicle.summary}</p>
        <div className="mt-8 space-y-4 text-sm font-bold text-[var(--muted-ink)]">
          <p className="flex items-center gap-3"><TrendingUp className="size-4 text-[var(--brand)]" /> {Math.round(vehicle.monthlyRate * 100)}% monthly flat profit</p>
          <p className="flex items-center gap-3"><Info className="size-4 text-[var(--brand)]" /> {vehicleKey === "funding" ? "Includes SME lending exposure and related repayment risk." : "Lower-risk product placement compared with the lending pool."}</p>
        </div>
        <Link href={`/get-started?vehicle=${vehicleKey}`} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1">
          Request this investment <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
