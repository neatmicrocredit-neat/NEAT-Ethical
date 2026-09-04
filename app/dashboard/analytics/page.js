import Link from "next/link";

import { loadBook } from "@/lib/dashboard-data";
import { money, percent } from "@/lib/format";
import { VEHICLES, summarizeBook } from "@/lib/investments";
import {
  averageTicketTrend,
  bookValueTrend,
  capitalInflow,
  concentration,
  groupByCustomer,
  kycCompleteness,
  maturityLadder,
  momChange,
  newCustomersTrend,
  payoutForecast,
  repeatInvestors,
  scheduleSplit,
  stateDistribution,
  termDistribution,
  topHolders,
  vehicleAllocation,
} from "@/lib/analytics";
import { AreaTrend, ChartCard, ColumnChart, DataTable, Legend, RankBars, SplitBar } from "@/components/dashboard/charts";
import { Amount, PageHeader, Panel, PanelHeader, StatCard } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

/**
 * Ordinal ramp for the term bands — one hue, light to dark, ordered.
 * Starts at blue step 250, the lightest step that still clears 2:1 on white.
 */
const TERM_RAMP = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#104281"];

export default async function AnalyticsPage() {
  const now = new Date();
  const { customers, investments } = await loadBook();

  const summary = summarizeBook(investments, now);
  const grouped = groupByCustomer(customers, investments, now);

  const trend = bookValueTrend(investments, 24, now);
  const inflow = capitalInflow(investments, 12, now);
  const signups = newCustomersTrend(customers, 12, now);
  const tickets = averageTicketTrend(investments, 12, now);
  const forecast = payoutForecast(investments, 12, now);
  const ladder = maturityLadder(investments, 18, now);
  const allocation = vehicleAllocation(investments, now);
  const schedules = scheduleSplit(investments, now);
  const terms = termDistribution(investments);
  const holders = topHolders(grouped, 10);
  const risk = concentration(holders);
  const states = stateDistribution(grouped, 8);
  const repeat = repeatInvestors(grouped);
  const kyc = kycCompleteness(customers);

  const liability = forecast.reduce((sum, row) => sum + row.value, 0);
  const peakMonth = forecast.reduce((peak, row) => (row.value > (peak?.value ?? 0) ? row : peak), null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insight"
        title="Advanced analytics"
        description="Growth, liability, concentration and coverage across the whole book. Every chart has a table view."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Capital under management"
          value={money(summary.underManagement)}
          delta={momChange(trend)}
          deltaLabel="vs last month"
          trend={trend.slice(-12)}
        />
        <StatCard
          label="12-month payout liability"
          value={money(liability)}
          hint={peakMonth ? `Peaks in ${peakMonth.full} at ${money(peakMonth.value)}` : undefined}
          upIsGood={false}
        />
        <StatCard
          label="Average ticket"
          value={money(summary.averageTicket)}
          delta={momChange(tickets)}
          deltaLabel="vs last month"
          trend={tickets}
          trendColor="var(--series-3)"
        />
        <StatCard
          label="Repeat investors"
          value={`${Math.round(repeat.rate)}%`}
          hint={`${repeat.repeat} of ${repeat.withBook} hold more than one placement`}
        />
      </div>

      <ChartCard
        title="Capital under management"
        subtitle="Principal held, month by month, over the last two years"
        table={<DataTable head={["Month", "Principal held", "Open placements"]} rows={trend.map((row) => [row.full, money(row.value), row.count])} />}
      >
        <AreaTrend data={trend} format="money" height={260} label="Under management" />
      </ChartCard>

      {/* Growth — capital and customers are different measures, so they get
          their own axes on their own charts rather than one dual-axis plot. */}
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Capital placed per month"
          subtitle="New money in, last 12 months"
          table={<DataTable head={["Month", "Capital", "Placements"]} rows={inflow.map((row) => [row.full, money(row.value), row.count])} />}
        >
          <ColumnChart data={inflow} series={[{ key: "value", label: "Capital placed", color: "var(--series-1)" }]} format="money" />
        </ChartCard>

        <ChartCard
          title="New customers per month"
          subtitle="Sign-ups from the public onboarding flow"
          table={<DataTable head={["Month", "Sign-ups"]} rows={signups.map((row) => [row.full, row.value])} />}
        >
          <ColumnChart data={signups} series={[{ key: "value", label: "New customers", color: "var(--series-3)" }]} format="number" />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Average ticket size"
          subtitle="Mean placement, by the month capital arrived"
          table={<DataTable head={["Month", "Average ticket", "Placements"]} rows={tickets.map((row) => [row.full, money(row.value), row.count])} />}
        >
          <ColumnChart data={tickets} series={[{ key: "value", label: "Average ticket", color: "var(--series-3)" }]} format="money" />
        </ChartCard>

        <ChartCard
          title="Payout liability forecast"
          subtitle="Cash the business must find over the next 12 months"
          legend={
            <Legend
              items={[
                { label: "Profit payments", color: "var(--series-1)" },
                { label: "Principal returning", color: "var(--series-2)" },
              ]}
            />
          }
          table={
            <DataTable
              head={["Month", "Profit", "Principal", "Total"]}
              rows={forecast.map((row) => [row.full, money(row.values.profit), money(row.values.principal), money(row.value)])}
            />
          }
        >
          <ColumnChart
            data={forecast}
            series={[
              { key: "profit", label: "Profit payments", color: "var(--series-1)" },
              { key: "principal", label: "Principal returning", color: "var(--series-2)" },
            ]}
            format="money"
            labelExtreme={false}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Maturity ladder"
        subtitle="Principal falling due over the next 18 months — the refinancing window"
        table={<DataTable head={["Month", "Principal due", "Placements"]} rows={ladder.map((row) => [row.full, money(row.value), row.count])} />}
      >
        <ColumnChart data={ladder} series={[{ key: "value", label: "Principal due", color: "var(--series-4)" }]} format="money" />
      </ChartCard>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Allocation by vehicle"
          subtitle="Principal on the active book"
          table={<DataTable head={["Vehicle", "Principal", "Placements"]} rows={allocation.map((row) => [row.label, money(row.value), row.count])} />}
        >
          <div className="pt-2">
            <SplitBar data={allocation} colors={["var(--series-1)", "var(--series-2)"]} format="money" />
          </div>
        </ChartCard>

        <ChartCard
          title="Payout arrangement"
          subtitle="How the active book takes its profit"
          table={<DataTable head={["Arrangement", "Principal"]} rows={schedules.map((row) => [row.label, money(row.value)])} />}
        >
          <div className="pt-2">
            <SplitBar data={schedules} colors={["var(--series-1)", "var(--series-3)"]} format="money" />
          </div>
        </ChartCard>

        <ChartCard
          title="Term length"
          subtitle="Capital by contracted term"
          table={<DataTable head={["Term", "Capital", "Placements"]} rows={terms.map((row) => [row.label, money(row.value), row.count])} />}
        >
          <div className="pt-2">
            <RankBars data={terms.map((row, index) => ({ ...row, color: TERM_RAMP[index] }))} format="money" />
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Concentration risk"
          subtitle={`Top 10 holders · HHI ${Math.round(risk.hhi).toLocaleString()} — ${risk.verdict}`}
          table={<DataTable head={["Customer", "Capital", "Share", "Placements"]} rows={holders.rows.map((row) => [row.name, money(row.value), percent(row.share, 1), row.count])} />}
        >
          <div className="pt-2">
            {holders.rows.length ? (
              <RankBars data={holders.rows.map((row) => ({ ...row, key: row.id }))} format="money" />
            ) : (
              <p className="px-3 text-sm text-[var(--dash-ink-2)]">No placements on the book yet.</p>
            )}
          </div>
        </ChartCard>

        <Panel>
          <PanelHeader title="Risk read-out" description="How exposed the book is to a single withdrawal" />
          <dl className="space-y-4 px-5 py-5">
            <Metric label="Largest single holder" value={percent(risk.top1Share, 1)} note="of all capital placed" />
            <Metric label="Top 5 holders" value={percent(risk.top5Share, 1)} note="of all capital placed" />
            <Metric label="Top 10 holders" value={percent(risk.top10Share, 1)} note="of all capital placed" />
            <Metric label="Herfindahl index" value={Math.round(risk.hhi).toLocaleString()} note="Under 1,500 is diversified; over 2,500 is concentrated" />
            <Metric label="Contributing holders" value={risk.holders.toLocaleString()} note="Customers with capital on the book" />
          </dl>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Where the capital comes from"
          subtitle="Principal by customer state of residence"
          table={<DataTable head={["State", "Capital", "Customers"]} rows={states.map((row) => [row.label, money(row.value), row.count])} />}
        >
          <div className="pt-2">
            {states.length ? (
              <RankBars data={states} format="money" color="var(--series-7)" />
            ) : (
              <p className="px-3 text-sm text-[var(--dash-ink-2)]">No customer locations recorded yet.</p>
            )}
          </div>
        </ChartCard>

        <Panel>
          <PanelHeader title="Vehicle performance" description="What each product contributes and costs" />
          <div className="overflow-x-auto dash-scroll">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--dash-line)] text-xs text-[var(--dash-muted)]">
                  <th scope="col" className="px-5 py-2.5 font-medium">Vehicle</th>
                  <th scope="col" className="px-5 py-2.5 text-right font-medium">Principal</th>
                  <th scope="col" className="px-5 py-2.5 text-right font-medium">Placements</th>
                  <th scope="col" className="px-5 py-2.5 text-right font-medium">Avg ticket</th>
                  <th scope="col" className="px-5 py-2.5 text-right font-medium">Profit owed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-line)]">
                {allocation.map((row) => (
                  <tr key={row.key}>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2 font-medium text-[var(--dash-ink)]">
                        <span
                          className="size-2 shrink-0 rounded-[3px]"
                          style={{ background: row.key === "funding" ? "var(--series-2)" : "var(--series-1)" }}
                          aria-hidden
                        />
                        {row.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--dash-muted)]">
                        {Math.round(VEHICLES[row.key].annualRate * 100)}% p.a.
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right"><Amount>{money(row.value)}</Amount></td>
                    <td className="px-5 py-3 text-right tabular-nums text-[var(--dash-ink-2)]">{row.count}</td>
                    <td className="px-5 py-3 text-right"><Amount>{money(row.count ? row.value / row.count : 0)}</Amount></td>
                    <td className="px-5 py-3 text-right"><Amount>{money(row.liability)}</Amount></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Customer depth" description="How much of the base is actually invested" />
          <dl className="space-y-4 px-5 py-5">
            <Metric label="Customers on file" value={customers.length.toLocaleString()} note="Everyone who completed onboarding" />
            <Metric label="With capital placed" value={repeat.withBook.toLocaleString()} note={`${percent(customers.length ? (repeat.withBook / customers.length) * 100 : 0, 0)} of the base`} />
            <Metric label="Repeat investors" value={repeat.repeat.toLocaleString()} note={`${percent(repeat.rate, 0)} of investing customers`} />
            <Metric label="Placements per investor" value={repeat.placementsPerCustomer.toFixed(2)} note="Mean across investing customers" />
          </dl>
        </Panel>

        <Panel>
          <PanelHeader title="KYC coverage" description="Documentation gaps that block compliance sign-off" />
          <dl className="space-y-4 px-5 py-5">
            <Metric label="Fully documented" value={`${Math.round(kyc.rate)}%`} note={`${kyc.complete} of ${kyc.total} customers`} />
            <Metric label="Missing ID documents" value={kyc.missing.id.toLocaleString()} note="No ID number or no uploaded image" />
            <Metric label="Missing photo" value={kyc.missing.photo.toLocaleString()} note="No portrait on file" />
            <Metric label="Missing next of kin" value={kyc.missing.nextOfKin.toLocaleString()} note="No name or phone recorded" />
            <Metric label="Missing address" value={kyc.missing.address.toLocaleString()} note="No address or state recorded" />
          </dl>
        </Panel>
      </div>

      <p className="text-center text-xs text-[var(--dash-muted)]">
        Figures are derived from placement terms and the published rates, not from settled payments.{" "}
        <Link href="/dashboard/investments" className="text-[var(--dash-accent)] hover:underline">
          Review the underlying placements
        </Link>
        .
      </p>
    </div>
  );
}

function Metric({ label, value, note }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <dt className="text-sm text-[var(--dash-ink-2)]">{label}</dt>
        {note ? <p className="mt-0.5 text-xs text-[var(--dash-muted)]">{note}</p> : null}
      </div>
      <dd className="shrink-0 text-sm font-semibold tabular-nums text-[var(--dash-ink)]">{value}</dd>
    </div>
  );
}
