import { notFound } from "next/navigation";

import { loadBook } from "@/lib/dashboard-data";
import { fullName, money, shortDate } from "@/lib/format";
import { resolveVehicle, startOf } from "@/lib/investments";
import { hasCapability } from "@/lib/auth";
import { TransactionForm } from "@/components/dashboard/transaction-form";
import { PageHeader } from "@/components/dashboard/ui";
import { createTransaction } from "@/app/dashboard/transactions/actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Record entry · Admin console" };

export default async function NewTransactionPage({ searchParams }) {
  const { customer, investment } = await searchParams;

  if (!(await hasCapability("ledger.write"))) notFound();

  const { customers, investments } = await loadBook();
  const customersById = new Map(customers.map((entry) => [String(entry.id), entry]));

  const options = investments.map((entry) => ({
    id: entry.id,
    customer_id: entry.customer_id,
    label: `${money(entry.amount)} · ${resolveVehicle(entry).label} · from ${shortDate(startOf(entry))} · ${fullName(
      customersById.get(String(entry.customer_id))
    )}`,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ledger"
        title="Record an entry"
        description="Log money that has moved — capital received, a profit payout, a fee or a correction."
      />
      <TransactionForm
        action={createTransaction}
        customers={customers}
        investments={options}
        lockedCustomerId={customer ? Number(customer) : undefined}
        lockedInvestmentId={investment ? Number(investment) : undefined}
        cancelHref="/dashboard/transactions"
      />
    </div>
  );
}
