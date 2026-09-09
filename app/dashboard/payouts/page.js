import { hasCapability } from "@/lib/auth";
import { loadBook } from "@/lib/dashboard-data";
import { fullName, money } from "@/lib/format";
import { monthLabel, monthLabelLong, forwardMonths, monthKey, resolveVehicle } from "@/lib/investments";
import { buildPayoutRun, loadTransactions } from "@/lib/ledger";
import { ChartCard, ColumnChart, DataTable } from "@/components/dashboard/charts";
import { PayoutRun } from "@/components/dashboard/payout-run";
import { PageHeader, SetupNotice, StatCard } from "@/components/dashboard/ui";
import { recordPayoutRun } from "@/app/dashboard/transactions/actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Payouts · Admin console" };

const HORIZON_DAYS = 45;

export default async function PayoutsPage() {
  const now = new Date();
  const [{ customers, investments }, { transactions, missing }, canRecord] = await Promise.all([
    loadBook(),
    loadTransactions(),
    hasCapability("ledger.write"),
  ]);

  if (missing) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Money" title="Payouts" description="What the book owes, and what has been settled." />
        <SetupNotice
          feature="Payout tracking"
          migration="supabase/migrations/0003_operations.sql"
          tables={["transactions"]}
        />
      </div>
    );
  }

  const customersById = new Map(customers.map((customer) => [String(customer.id), customer]));
  const run = buildPayoutRun(investments, transactions, now, { horizonDays: HORIZON_DAYS });

  const rows = run.rows.map((row) => ({
    // One stable id per placement-month, which is also what the checkbox keys on.
    id: `${row.investmentId}-${row.month}`,
    investmentId: row.investmentId,
    investmentUuid: row.investmentUuid,
    customer: fullName(customersById.get(String(row.customerId))),
    vehicleLabel: row.vehicle.label,
    month: row.month,
    date: row.date ? row.date.toISOString() : null,
    profitDue: row.profitDue,
    principalDue: row.principalDue,
    paid: row.paid,
    outstanding: row.outstanding,
    overdue: row.overdue,
    daysLate: row.daysLate,
    kind: row.profitDue <= 0 && row.principalDue > 0 ? "principal_return" : "profit_payout",
    bank: row.investment.payout_bank_name || "",
    accountName: row.investment.payout_account_name || "",
    accountNumber: row.investment.payout_account_number || "",
  }));

  // Forward view of what still has to be found, month by month.
  const keys = forwardMonths(now, 6);
  const forecast = keys.map((key) => ({
    key,
    label: monthLabel(key),
    full: monthLabelLong(key),
    values: { profit: 0, principal: 0 },
    value: 0,
  }));
  const forecastByKey = new Map(forecast.map((bucket) => [bucket.key, bucket]));
  for (const row of run.rows) {
    const bucket = row.date ? forecastByKey.get(monthKey(row.date)) : null;
    if (!bucket) continue;
    const share = row.outstanding / (row.expected || row.outstanding || 1);
    bucket.values.profit += row.profitDue * share;
    bucket.values.principal += row.principalDue * share;
    bucket.value += row.outstanding;
  }

  const worstOffenders = [...run.overdue]
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 8)
    .map((row) => [
      fullName(customersById.get(String(row.customerId))),
      resolveVehicle(row.investment).short,
      `${row.daysLate}d`,
      money(row.outstanding),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Money"
        title="Payouts"
        description={`Everything the schedule says is owed, checked against the ledger. Upcoming covers the next ${HORIZON_DAYS} days.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Overdue"
          value={money(run.overdueValue)}
          hint={`${run.overdue.length} payment${run.overdue.length === 1 ? "" : "s"} past their date`}
          tone={run.overdue.length ? "pending" : undefined}
          upIsGood={false}
        />
        <StatCard label="Due in the window" value={money(run.upcomingValue)} hint={`${run.upcoming.length} scheduled`} />
        <StatCard label="Total to find" value={money(run.overdueValue + run.upcomingValue)} hint="Overdue plus upcoming" />
        <StatCard
          label="Oldest arrear"
          value={run.overdue.length ? `${Math.max(...run.overdue.map((row) => row.daysLate))} days` : "None"}
          hint={run.overdue.length ? "Longest a payment has been outstanding" : "Nothing past due"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <ChartCard
          title="Obligation ahead"
          subtitle="Outstanding profit and principal, by month due"
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
              { key: "profit", label: "Profit", color: "var(--series-1)" },
              { key: "principal", label: "Principal", color: "var(--series-3)" },
            ]}
            format="money"
          />
        </ChartCard>

        <ChartCard
          title="Largest arrears"
          subtitle="Where the overdue money is concentrated"
          table={<DataTable head={["Customer", "Vehicle", "Late", "Outstanding"]} rows={worstOffenders} />}
        />
      </div>

      <PayoutRun rows={rows} action={recordPayoutRun} canRecord={canRecord} />
    </div>
  );
}
