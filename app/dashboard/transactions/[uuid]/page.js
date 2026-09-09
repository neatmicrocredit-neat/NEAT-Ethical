import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, User } from "lucide-react";

import { hasCapability } from "@/lib/auth";
import { loadAuditFor } from "@/lib/audit";
import { loadCustomerById, loadInvestmentByUuid } from "@/lib/dashboard-data";
import { dateTime, fullName, money, shortDate } from "@/lib/format";
import { PAYMENT_METHODS, TRANSACTION_KINDS, TRANSACTION_STATUSES, loadTransactionByUuid } from "@/lib/ledger";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { resolveVehicle } from "@/lib/investments";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { Field, Panel, PanelHeader, PageHeader, StatusPill, buttonStyles } from "@/components/dashboard/ui";
import { deleteTransaction, setTransactionStatus } from "@/app/dashboard/transactions/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { uuid } = await params;
  const transaction = await loadTransactionByUuid(uuid);
  return { title: transaction ? `${money(transaction.amount)} entry · Admin console` : "Entry · Admin console" };
}

/** The placement a ledger entry points at, resolved by its numeric id. */
async function loadInvestmentById(id) {
  if (!id) return null;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("investments").select("uuid, amount, vehicle, customer_id").eq("id", id).maybeSingle();
  return data || null;
}

export default async function TransactionPage({ params }) {
  const { uuid } = await params;
  const transaction = await loadTransactionByUuid(uuid);
  if (!transaction) notFound();

  const [customer, investment, activity, canWrite] = await Promise.all([
    loadCustomerById(transaction.customer_id),
    loadInvestmentById(transaction.investment_id),
    loadAuditFor("transaction", transaction.id),
    hasCapability("ledger.write"),
  ]);

  const kind = TRANSACTION_KINDS[transaction.kind];
  const amount = Math.abs(Number(transaction.amount) || 0);
  const inbound = transaction.direction === "in";

  return (
    <div className="space-y-6">
      <Link href="/dashboard/transactions" className="inline-flex items-center gap-1.5 text-sm text-[var(--dash-ink-2)] hover:text-[var(--dash-ink)]">
        <ArrowLeft className="size-4" />
        Ledger
      </Link>

      <PageHeader
        eyebrow={kind?.label || transaction.kind}
        title={`${inbound ? "+" : "−"}${money(amount)}`}
        description={kind?.note}
        actions={
          canWrite ? (
            <div className="flex flex-wrap items-center gap-2">
              {transaction.status !== "cleared" ? (
                <form action={setTransactionStatus}>
                  <input type="hidden" name="uuid" value={transaction.uuid} />
                  <input type="hidden" name="status" value="cleared" />
                  <button type="submit" className={buttonStyles.primary}>Mark cleared</button>
                </form>
              ) : null}
              {transaction.status === "cleared" ? (
                <form action={setTransactionStatus}>
                  <input type="hidden" name="uuid" value={transaction.uuid} />
                  <input type="hidden" name="status" value="pending" />
                  <button type="submit" className={buttonStyles.secondary}>Reopen</button>
                </form>
              ) : null}
              <ConfirmDelete
                action={deleteTransaction}
                hiddenFields={{ uuid: transaction.uuid }}
                label="Delete entry"
                description="Removed from every balance that counts it. The audit trail keeps a record."
              />
            </div>
          ) : null
        }
      >
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusPill status={transaction.status} />
          <StatusPill status={transaction.direction} label={inbound ? "Money in" : "Money out"} />
          {transaction.period_index ? (
            <span className="rounded-full bg-[var(--dash-page)] px-2.5 py-0.5 text-[11px] text-[var(--dash-ink-2)]">
              Settles month {transaction.period_index}
            </span>
          ) : null}
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel>
          <PanelHeader title="Entry" description={TRANSACTION_STATUSES[transaction.status]?.note} />
          <dl className="grid gap-5 p-5 sm:grid-cols-2">
            <Field label="Amount" value={money(amount)} />
            <Field label="Value date" value={shortDate(transaction.value_date)} />
            <Field label="Method" value={PAYMENT_METHODS[transaction.method] || "—"} />
            <Field label="Reference" value={transaction.reference} mono />
            <Field label="Bank" value={transaction.bank_name} />
            <Field label="Account name" value={transaction.account_name} />
            <Field label="Account number" value={transaction.account_number} mono />
            <Field label="Recorded by" value={transaction.created_by} />
            <Field label="Recorded" value={dateTime(transaction.created_at)} />
            <Field label="Cleared" value={transaction.cleared_at ? dateTime(transaction.cleared_at) : "—"} />
            {transaction.note ? <Field label="Note" value={transaction.note} className="sm:col-span-2" /> : null}
          </dl>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Attributed to" />
            <div className="space-y-2 p-5">
              {customer ? (
                <Link
                  href={`/dashboard/customers/${customer.uuid}`}
                  className="flex items-center gap-3 rounded-xl border border-[var(--dash-line)] p-3.5 transition hover:bg-[var(--dash-page)]"
                >
                  <User className="size-4 text-[var(--dash-muted)]" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[var(--dash-ink)]">{fullName(customer)}</span>
                    <span className="block truncate text-xs text-[var(--dash-muted)]">{customer.email}</span>
                  </span>
                </Link>
              ) : (
                <p className="text-sm text-[var(--dash-muted)]">Not attributed to a customer.</p>
              )}

              {investment ? (
                <Link
                  href={`/dashboard/investments/${investment.uuid}`}
                  className="flex items-center gap-3 rounded-xl border border-[var(--dash-line)] p-3.5 transition hover:bg-[var(--dash-page)]"
                >
                  <Briefcase className="size-4 text-[var(--dash-muted)]" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[var(--dash-ink)]">{money(investment.amount)} placement</span>
                    <span className="block truncate text-xs text-[var(--dash-muted)]">{resolveVehicle(investment).label}</span>
                  </span>
                </Link>
              ) : (
                <p className="text-sm text-[var(--dash-muted)]">Not tied to a specific placement.</p>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="History" description="Every change to this entry." />
            <ActivityFeed entries={activity} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
