import Link from "next/link";
import { Plus } from "lucide-react";

import { loadBook } from "@/lib/dashboard-data";
import { fullName, money } from "@/lib/format";
import { PAYMENT_METHODS, TRANSACTION_KINDS, cashflowByMonth, ledgerSummary, loadTransactions } from "@/lib/ledger";
import { monthLabel, monthLabelLong, monthRange, resolveVehicle } from "@/lib/investments";
import { ChartCard, ColumnChart, DataTable } from "@/components/dashboard/charts";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { PageHeader, SetupNotice, StatCard, buttonStyles } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ledger · Admin console" };

export default async function TransactionsPage({ searchParams }) {
  const { direction = "all", status = "all", kind = "all" } = await searchParams;
  const [{ customers, investments }, { transactions, missing }] = await Promise.all([loadBook(), loadTransactions()]);

  if (missing) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Money" title="Ledger" description="Every naira in and out, recorded against a placement." />
        <SetupNotice
          feature="The cash ledger"
          migration="supabase/migrations/0003_operations.sql"
          tables={["transactions"]}
        />
      </div>
    );
  }

  const customersById = new Map(customers.map((customer) => [String(customer.id), customer]));
  const investmentsById = new Map(investments.map((investment) => [String(investment.id), investment]));

  const rows = transactions.map((transaction) => {
    const customer = customersById.get(String(transaction.customer_id));
    const investment = investmentsById.get(String(transaction.investment_id));
    return {
      uuid: transaction.uuid,
      valueDate: transaction.value_date,
      customer: customer ? fullName(customer) : "Unattributed",
      vehicleLabel: investment ? resolveVehicle(investment).label : null,
      kind: transaction.kind,
      kindLabel: TRANSACTION_KINDS[transaction.kind]?.label || transaction.kind,
      direction: transaction.direction,
      amount: Math.abs(Number(transaction.amount) || 0),
      status: transaction.status,
      methodLabel: PAYMENT_METHODS[transaction.method] || "",
      reference: transaction.reference,
      periodIndex: transaction.period_index,
      note: transaction.note,
      bank: transaction.bank_name,
      accountName: transaction.account_name,
    };
  });

  const summary = ledgerSummary(transactions);
  const keys = monthRange(new Date(), 12);
  const cashflow = cashflowByMonth(transactions, keys).map((bucket) => ({
    ...bucket,
    label: monthLabel(bucket.key),
    full: monthLabelLong(bucket.key),
  }));

  const byKind = Object.values(summary.byKind).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Money"
        title="Ledger"
        description="Every naira in and out, recorded against a placement. This is the record the projections are checked against."
        actions={
          <Link href="/dashboard/transactions/new" className={buttonStyles.primary}>
            <Plus className="size-4" />
            Record entry
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Capital received" value={money(summary.inflow)} hint="Cleared inflows, all time" />
        <StatCard label="Paid out" value={money(summary.outflow)} hint="Cleared outflows, all time" upIsGood={false} />
        <StatCard label="Net position" value={money(summary.net)} hint="Received less paid out" />
        <StatCard
          label="Unsettled"
          value={money(summary.pending)}
          hint={`${summary.pendingCount} pending · ${summary.failedCount} failed`}
          tone={summary.pendingCount ? "pending" : undefined}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <ChartCard
          title="Cashflow"
          subtitle="Cleared money in and out, by month"
          table={
            <DataTable
              head={["Month", "In", "Out", "Net"]}
              rows={cashflow.map((row) => [row.full, money(row.values.inflow), money(row.values.outflow), money(row.value)])}
            />
          }
        >
          <ColumnChart
            data={cashflow}
            series={[
              { key: "inflow", label: "Received", color: "var(--series-1)" },
              { key: "outflow", label: "Paid out", color: "var(--series-2)" },
            ]}
            format="money"
          />
        </ChartCard>

        <ChartCard
          title="By entry type"
          subtitle="Value recorded per kind, all statuses"
          table={<DataTable head={["Kind", "Value", "Entries"]} rows={byKind.map((row) => [row.label, money(row.value), row.count])} />}
        />
      </div>

      <TransactionTable
        rows={rows}
        initialDirection={direction}
        initialStatus={status}
        initialKind={kind}
        kinds={Object.values(TRANSACTION_KINDS)}
      />
    </div>
  );
}
