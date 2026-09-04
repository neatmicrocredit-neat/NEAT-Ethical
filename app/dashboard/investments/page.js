import Link from "next/link";
import { Plus } from "lucide-react";

import { loadBook } from "@/lib/dashboard-data";
import { fullName, money } from "@/lib/format";
import { deriveStatus, endOf, projectInvestment, startOf, summarizeBook } from "@/lib/investments";
import { groupByCustomer, scheduleSplit, vehicleAllocation } from "@/lib/analytics";
import { InvestmentTable } from "@/components/dashboard/investment-table";
import { ChartCard, DataTable, SplitBar } from "@/components/dashboard/charts";
import { PageHeader, StatCard, buttonStyles } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function InvestmentsPage({ searchParams }) {
  const { status = "all", vehicle = "all" } = await searchParams;
  const now = new Date();
  const { customers, investments } = await loadBook();

  const grouped = groupByCustomer(customers, investments, now);
  const summary = summarizeBook(investments, now);
  const allocation = vehicleAllocation(investments, now);
  const schedules = scheduleSplit(investments, now);

  const rows = investments.map((investment) => {
    const projection = projectInvestment(investment);
    const entry = grouped.byId.get(String(investment.customer_id));
    return {
      uuid: investment.uuid,
      customer: fullName(entry?.customer),
      email: entry?.customer?.email || "",
      vehicle: projection.vehicle.label,
      vehicleKey: projection.vehicle.key,
      amount: projection.principal,
      months: projection.months,
      startAt: startOf(investment)?.toISOString() || null,
      endAt: endOf(investment)?.toISOString() || null,
      schedule: projection.schedule === "maturity" ? "At maturity" : "Monthly",
      rollover: Boolean(investment.rollover),
      status: deriveStatus(investment, now),
      monthlyProfit: projection.monthlyProfit,
      totalProfit: projection.totalProfit,
      bank: investment.payout_bank_name || "",
      accountName: investment.payout_account_name || "",
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Portfolio"
        title="Placements"
        description="Every investment on the book, with its term, payout arrangement and projected profit."
        actions={
          <Link href="/dashboard/investments/new" className={buttonStyles.primary}>
            <Plus className="size-4" />
            New placement
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Placements" value={investments.length.toLocaleString()} hint={`${summary.byStatus.active} active now`} />
        <StatCard label="Capital under management" value={money(summary.underManagement)} hint="Active and pending principal" />
        <StatCard label="Profit still owed" value={money(summary.outstandingProfit)} hint="Across every unmatured placement" upIsGood={false} />
        <StatCard label="Average ticket" value={money(summary.averageTicket)} hint="Mean placement size, all time" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Allocation by vehicle"
          subtitle="Principal on the active book"
          table={
            <DataTable
              head={["Vehicle", "Principal", "Placements"]}
              rows={allocation.map((row) => [row.label, money(row.value), row.count])}
            />
          }
        >
          <div className="pt-2">
            <SplitBar data={allocation} colors={["var(--series-1)", "var(--series-2)"]} format="money" />
          </div>
        </ChartCard>

        <ChartCard
          title="Payout arrangement"
          subtitle="How the active book takes its profit"
          table={
            <DataTable head={["Arrangement", "Principal"]} rows={schedules.map((row) => [row.label, money(row.value)])} />
          }
        >
          <div className="pt-2">
            <SplitBar data={schedules} colors={["var(--series-1)", "var(--series-3)"]} format="money" />
          </div>
        </ChartCard>
      </div>

      <InvestmentTable rows={rows} initialStatus={status} initialVehicle={vehicle} />
    </div>
  );
}
