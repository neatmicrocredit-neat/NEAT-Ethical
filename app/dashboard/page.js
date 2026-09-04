import Link from "next/link";
import { ArrowRight, CalendarClock, Inbox, Plus, ShieldCheck, TriangleAlert } from "lucide-react";

import { loadBook } from "@/lib/dashboard-data";
import { dayMonth, fullName, money, percent, relativeTime, shortDate } from "@/lib/format";
import { deriveStatus, endOf, projectInvestment, summarizeBook } from "@/lib/investments";
import {
  bookValueTrend,
  capitalInflow,
  concentration,
  groupByCustomer,
  kycCompleteness,
  maturityLadder,
  momChange,
  newCustomersTrend,
  payoutForecast,
  topHolders,
  vehicleAllocation,
} from "@/lib/analytics";
import { AreaTrend, ChartCard, ColumnChart, DataTable, Legend, RankBars, SplitBar } from "@/components/dashboard/charts";
import { Amount, Avatar, Delta, EmptyState, Panel, PanelHeader, StatCard, StatusPill, buttonStyles } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const now = new Date();
  const { customers, investments } = await loadBook();

  const summary = summarizeBook(investments, now);
  const grouped = groupByCustomer(customers, investments, now);
  const trend = bookValueTrend(investments, 12, now);
  const inflow = capitalInflow(investments, 12, now);
  const signups = newCustomersTrend(customers, 12, now);
  const forecast = payoutForecast(investments, 12, now);
  const ladder = maturityLadder(investments, 12, now);
  const allocation = vehicleAllocation(investments, now);
  const holders = topHolders(grouped, 6);
  const risk = concentration(holders);
  const kyc = kycCompleteness(customers);

  const activeCustomers = [...grouped.byId.values()].filter((entry) => entry.status === "active").length;
  const maturingSoon = summary.maturingSoon
    .map((investment) => ({ investment, entry: grouped.byId.get(String(investment.customer_id)) }))
    .sort((a, b) => (endOf(a.investment)?.getTime() ?? 0) - (endOf(b.investment)?.getTime() ?? 0));

  const recentCustomers = customers.slice(0, 5);
  const recentInvestments = investments.slice(0, 5);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dash-muted)]">Overview</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[var(--dash-ink)] sm:text-[1.75rem]">
            The book at a glance
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/analytics" className={buttonStyles.secondary}>
            Advanced analytics
          </Link>
          <Link href="/dashboard/investments/new" className={buttonStyles.primary}>
            <Plus className="size-4" />
            New placement
          </Link>
        </div>
      </header>

      {/* Hero band — the one number the console leads with. */}
      <Panel className="overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col justify-center gap-4 px-6 py-7">
            <p className="text-xs font-medium text-[var(--dash-muted)]">Capital under management</p>
            <p className="text-[3rem] font-semibold leading-none tracking-tight text-[var(--dash-ink)]">
              {money(summary.underManagement)}
            </p>
            <Delta value={momChange(trend)} label="vs last month" />
            <dl className="mt-1 grid grid-cols-2 gap-4 border-t border-[var(--dash-line)] pt-4">
              <div>
                <dt className="text-xs text-[var(--dash-muted)]">Lifetime capital placed</dt>
                <dd className="mt-1 text-sm font-semibold text-[var(--dash-ink)]">{money(summary.principal)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--dash-muted)]">Profit still owed</dt>
                <dd className="mt-1 text-sm font-semibold text-[var(--dash-ink)]">{money(summary.outstandingProfit)}</dd>
              </div>
            </dl>
          </div>
          <div className="border-t border-[var(--dash-line)] px-2 pb-4 pt-5 lg:border-l lg:border-t-0">
            <p className="px-4 text-xs font-medium text-[var(--dash-muted)]">Book value, last 12 months</p>
            <AreaTrend data={trend} format="money" height={200} label="Under management" />
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active placements"
          value={summary.byStatus.active.toLocaleString()}
          hint={`${summary.byStatus.pending} pending · ${summary.byStatus.matured} matured`}
          href="/dashboard/investments?status=active"
        />
        <StatCard
          label="Investing customers"
          value={activeCustomers.toLocaleString()}
          hint={`${customers.length} on file`}
          delta={momChange(signups)}
          deltaLabel="new sign-ups"
          trend={signups}
          href="/dashboard/customers"
        />
        <StatCard
          label="Monthly payout obligation"
          value={money(summary.monthlyObligation)}
          hint="Profit due each month on the active book"
          upIsGood={false}
        />
        <StatCard
          label="Maturing in 30 days"
          value={money(summary.maturingSoonValue)}
          hint={`${summary.maturingSoon.length} placement${summary.maturingSoon.length === 1 ? "" : "s"} coming due`}
          tone={summary.maturingSoon.length ? "pending" : undefined}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Capital placed per month"
          subtitle="New money in, by the month the placement starts"
          table={
            <DataTable
              head={["Month", "Capital", "Placements"]}
              rows={inflow.map((row) => [row.full, money(row.value), row.count])}
            />
          }
        >
          <ColumnChart data={inflow} series={[{ key: "value", label: "Capital placed", color: "var(--series-1)" }]} format="money" />
        </ChartCard>

        <ChartCard
          title="Payout forecast"
          subtitle="Cash leaving the business over the next 12 months"
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

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Allocation by vehicle"
          subtitle="Principal on the active book"
          table={
            <DataTable
              head={["Vehicle", "Principal", "Placements", "Share"]}
              rows={allocation.map((row) => [row.label, money(row.value), row.count, percent(row.share, 0)])}
            />
          }
        >
          <div className="pt-2">
            <SplitBar data={allocation} colors={["var(--series-1)", "var(--series-2)"]} format="money" />
          </div>
        </ChartCard>

        <ChartCard
          title="Maturity ladder"
          subtitle="Principal coming due, next 12 months"
          table={
            <DataTable
              head={["Month", "Principal", "Placements"]}
              rows={ladder.map((row) => [row.full, money(row.value), row.count])}
            />
          }
        >
          <ColumnChart data={ladder} series={[{ key: "value", label: "Principal due", color: "var(--series-3)" }]} format="money" />
        </ChartCard>

        <ChartCard
          title="Largest holders"
          subtitle={`Top ${holders.rows.length} by capital placed · HHI ${Math.round(risk.hhi).toLocaleString()} (${risk.verdict})`}
          action={
            <Link href="/dashboard/analytics" className="text-xs font-medium text-[var(--dash-accent)] hover:underline">
              Risk detail
            </Link>
          }
          table={
            <DataTable
              head={["Customer", "Capital", "Share"]}
              rows={holders.rows.map((row) => [row.name, money(row.value), percent(row.share, 1)])}
            />
          }
        >
          <div className="pt-2">
            {holders.rows.length ? (
              <RankBars data={holders.rows.map((row) => ({ ...row, key: row.id }))} format="money" />
            ) : (
              <EmptyState title="No placements yet" description="Capital concentration appears once the first placement is recorded." />
            )}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Needs attention"
            description="Placements maturing within 30 days — confirm rollover or payout"
            action={
              <Link href="/dashboard/investments?status=active" className="text-xs font-medium text-[var(--dash-accent)] hover:underline">
                All placements
              </Link>
            }
          />
          {maturingSoon.length ? (
            <ul className="divide-y divide-[var(--dash-line)]">
              {maturingSoon.slice(0, 6).map(({ investment, entry }) => {
                const projection = projectInvestment(investment);
                const end = endOf(investment);
                return (
                  <li key={investment.uuid}>
                    <Link
                      href={`/dashboard/investments/${investment.uuid}`}
                      className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-[var(--dash-page)]"
                    >
                      <Avatar customer={entry?.customer} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--dash-ink)]">{fullName(entry?.customer)}</p>
                        <p className="truncate text-xs text-[var(--dash-muted)]">
                          {projection.vehicle.label} · {investment.rollover ? "Rollover requested" : "No rollover on file"}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-xs text-[var(--dash-muted)]">Matures</p>
                        <p className="text-sm font-medium text-[var(--dash-ink)]">{shortDate(end)}</p>
                      </div>
                      <div className="text-right">
                        <Amount>{money(projection.principal)}</Amount>
                        <p className="text-xs text-[var(--dash-muted)]">{relativeTime(end)}</p>
                      </div>
                      <ArrowRight className="hidden size-4 shrink-0 text-[var(--dash-muted)] sm:block" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="Nothing maturing in the next 30 days"
              description="Placements coming due will surface here so you can start the rollover conversation early."
            />
          )}
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Compliance" description="KYC completeness across the customer file" />
            <div className="space-y-4 px-5 py-5">
              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-[var(--dash-ink-2)]">Fully documented</p>
                  <p className="text-sm font-semibold tabular-nums text-[var(--dash-ink)]">
                    {kyc.complete}/{kyc.total}
                  </p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--dash-grid)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(kyc.rate, 1)}%`,
                      background: kyc.rate >= 80 ? "var(--status-good)" : kyc.rate >= 50 ? "var(--status-warning)" : "var(--status-critical)",
                    }}
                  />
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  ["Missing ID documents", kyc.missing.id],
                  ["Missing photo", kyc.missing.photo],
                  ["Missing next of kin", kyc.missing.nextOfKin],
                  ["Missing address", kyc.missing.address],
                ].map(([label, count]) => (
                  <li key={label} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[var(--dash-ink-2)]">
                      {count > 0 ? (
                        <TriangleAlert className="size-3.5 text-[var(--status-warning)]" />
                      ) : (
                        <ShieldCheck className="size-3.5 text-[var(--status-good)]" />
                      )}
                      {label}
                    </span>
                    <span className="font-medium tabular-nums text-[var(--dash-ink)]">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Newest customers"
              action={
                <Link href="/dashboard/customers" className="text-xs font-medium text-[var(--dash-accent)] hover:underline">
                  Directory
                </Link>
              }
            />
            {recentCustomers.length ? (
              <ul className="divide-y divide-[var(--dash-line)]">
                {recentCustomers.map((customer) => (
                  <li key={customer.uuid}>
                    <Link
                      href={`/dashboard/customers/${customer.uuid}`}
                      className="flex items-center gap-3 px-5 py-3 transition hover:bg-[var(--dash-page)]"
                    >
                      <Avatar customer={customer} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--dash-ink)]">{fullName(customer)}</p>
                        <p className="truncate text-xs text-[var(--dash-muted)]">{customer.email}</p>
                      </div>
                      <span className="shrink-0 text-xs text-[var(--dash-muted)]">{relativeTime(customer.created_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Inbox} title="No customers yet" description="Sign-ups from the public site land here." />
            )}
          </Panel>
        </div>
      </div>

      <Panel>
        <PanelHeader
          title="Latest placements"
          description="Most recently recorded investments"
          action={
            <Link href="/dashboard/investments" className="text-xs font-medium text-[var(--dash-accent)] hover:underline">
              All placements
            </Link>
          }
        />
        {recentInvestments.length ? (
          <div className="overflow-x-auto dash-scroll">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--dash-muted)]">
                  <th scope="col" className="px-5 py-2.5 font-medium">Customer</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">Vehicle</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">Term</th>
                  <th scope="col" className="px-5 py-2.5 text-right font-medium">Amount</th>
                  <th scope="col" className="px-5 py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-line)]">
                {recentInvestments.map((investment) => {
                  const projection = projectInvestment(investment);
                  const entry = grouped.byId.get(String(investment.customer_id));
                  return (
                    <tr key={investment.uuid} className="transition hover:bg-[var(--dash-page)]">
                      <td className="px-5 py-3">
                        <Link href={`/dashboard/investments/${investment.uuid}`} className="font-medium text-[var(--dash-ink)] hover:underline">
                          {fullName(entry?.customer)}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-[var(--dash-ink-2)]">{projection.vehicle.label}</td>
                      <td className="px-5 py-3 text-[var(--dash-ink-2)]">
                        {projection.months} mo · {dayMonth(investment.start_date)}
                      </td>
                      <td className="px-5 py-3 text-right"><Amount>{money(projection.principal)}</Amount></td>
                      <td className="px-5 py-3 text-right">
                        <StatusPill status={deriveStatus(investment, now)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No placements recorded"
            description="Record the first one to start tracking capital, payouts and maturities."
            action={
              <Link href="/dashboard/investments/new" className={buttonStyles.primary}>
                <Plus className="size-4" />
                New placement
              </Link>
            }
          />
        )}
      </Panel>

      <p className="text-center text-xs text-[var(--dash-muted)]">
        Projections apply the published rates — Neat Ethical 2%/month, Neat Funding 5%/month — over each placement&apos;s term.
      </p>
    </div>
  );
}
