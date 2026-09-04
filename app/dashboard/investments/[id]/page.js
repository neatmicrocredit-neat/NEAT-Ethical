import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, MessageSquarePlus, Pencil, RefreshCw } from "lucide-react";

import { deleteInvestment, updateInvestment } from "@/app/dashboard/actions";
import { loadCustomerById, loadInvestmentByUuid } from "@/lib/dashboard-data";
import { dateTime, fullName, money, relativeTime, shortDate } from "@/lib/format";
import { deriveStatus, endOf, projectInvestment, startOf } from "@/lib/investments";
import { ChartCard, ColumnChart, DataTable } from "@/components/dashboard/charts";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { InvestmentForm } from "@/components/dashboard/investment-form";
import { Amount, Avatar, Field, Panel, PanelHeader, StatCard, StatusPill, buttonStyles } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function InvestmentDetailPage({ params, searchParams }) {
  const { id } = await params;
  const { edit } = await searchParams;

  const investment = await loadInvestmentByUuid(id);
  if (!investment) notFound();

  const customer = investment.customer_id ? await loadCustomerById(investment.customer_id) : null;
  const projection = projectInvestment(investment);
  const status = deriveStatus(investment);
  const editing = edit === "1";

  const cashflow = projection.rows.map((row) => ({
    key: `m${row.month}`,
    label: `M${row.month}`,
    full: row.date ? shortDate(row.date) : `Month ${row.month}`,
    values: { profit: row.profitPaid, principal: row.principalPaid },
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/investments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-ink-2)] transition hover:text-[var(--dash-ink)]"
      >
        <ArrowLeft className="size-4" />
        Back to placements
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dash-muted)]">Placement</p>
            <StatusPill status={status} />
            {investment.rollover ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--dash-accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--dash-accent)]">
                <RefreshCw className="size-3" />
                Rolls over
              </span>
            ) : null}
          </div>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[var(--dash-ink)]">
            {money(projection.principal)} · {projection.vehicle.label}
          </h1>
          <p className="mt-1.5 text-sm text-[var(--dash-ink-2)]">
            {customer ? (
              <>
                Held by{" "}
                <Link href={`/dashboard/customers/${customer.uuid}`} className="font-medium text-[var(--dash-accent)] hover:underline">
                  {fullName(customer)}
                </Link>
                {" · "}
              </>
            ) : null}
            {shortDate(startOf(investment))} – {shortDate(endOf(investment))} ({projection.months} months)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {customer ? (
            <Link href={`/dashboard/messages/new?customer=${customer.id}`} className={buttonStyles.secondary}>
              <MessageSquarePlus className="size-4" />
              Message
            </Link>
          ) : null}
          <Link href={editing ? `/dashboard/investments/${id}` : `/dashboard/investments/${id}?edit=1`} className={buttonStyles.secondary}>
            <Pencil className="size-4" />
            {editing ? "Stop editing" : "Edit"}
          </Link>
        </div>
      </header>

      {editing ? (
        <InvestmentForm
          action={updateInvestment}
          investment={investment}
          customerId={investment.customer_id}
          submitLabel="Save changes"
          cancelHref={`/dashboard/investments/${id}`}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Principal" value={money(projection.principal)} hint={`${projection.vehicle.label} · ${Math.round(projection.vehicle.monthlyRate * 100)}% monthly`} />
        <StatCard
          label={projection.rollover ? "First month profit" : "Monthly profit"}
          value={money(projection.monthlyProfit)}
          hint={projection.schedule === "monthly" ? "Paid out every month" : "Retained until maturity"}
        />
        <StatCard label="Total profit over term" value={money(projection.totalProfit)} hint={`${projection.months} months at ${Math.round(projection.vehicle.annualRate * 100)}% p.a.`} />
        <StatCard
          label="Due at maturity"
          value={money(projection.principal + (projection.schedule === "maturity" ? projection.totalProfit : 0))}
          hint={status === "matured" ? `Matured ${relativeTime(endOf(investment))}` : `Matures ${relativeTime(endOf(investment))}`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ChartCard
          title="Cash out by month"
          subtitle="What this placement pays the customer over its term"
          table={
            <DataTable
              head={["Month", "Profit paid", "Principal returned", "Balance held"]}
              rows={projection.rows.map((row) => [
                row.date ? shortDate(row.date) : `Month ${row.month}`,
                money(row.profitPaid),
                money(row.principalPaid),
                money(row.balance),
              ])}
            />
          }
        >
          <ColumnChart
            data={cashflow}
            series={[
              { key: "profit", label: "Profit paid", color: "var(--series-1)" },
              { key: "principal", label: "Principal returned", color: "var(--series-2)" },
            ]}
            format="money"
            labelExtreme={false}
          />
        </ChartCard>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Payout account" />
            <dl className="space-y-4 px-5 py-5">
              <Field label="Bank" value={investment.payout_bank_name} />
              <Field label="Account name" value={investment.payout_account_name} />
              <Field label="Account number" value={investment.payout_account_number} mono />
              <Field label="Arrangement" value={projection.schedule === "maturity" ? "Settled at maturity" : "Paid monthly"} />
            </dl>
          </Panel>

          {customer ? (
            <Panel>
              <PanelHeader title="Customer" />
              <div className="px-5 py-5">
                <Link href={`/dashboard/customers/${customer.uuid}`} className="flex items-center gap-3">
                  <Avatar customer={customer} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[var(--dash-ink)]">{fullName(customer)}</span>
                    <span className="block truncate text-xs text-[var(--dash-muted)]">{customer.email}</span>
                  </span>
                </Link>
                <dl className="mt-5 space-y-4 border-t border-[var(--dash-line)] pt-5">
                  <Field label="Phone" value={customer.phone_number} />
                  <Field label="Location" value={[customer.lga, customer.state].filter(Boolean).join(", ")} />
                  <Field label="Customer since" value={shortDate(customer.created_at)} />
                </dl>
              </div>
            </Panel>
          ) : (
            <Panel>
              <PanelHeader title="Customer" />
              <p className="px-5 py-5 text-sm text-[var(--dash-ink-2)]">
                This placement has no linked customer record (customer_id {String(investment.customer_id)}).
              </p>
            </Panel>
          )}
        </div>
      </div>

      {investment.other_instructions ? (
        <Panel>
          <PanelHeader title="Notes" />
          <p className="whitespace-pre-wrap px-5 py-5 text-sm leading-relaxed text-[var(--dash-ink-2)]">
            {investment.other_instructions}
          </p>
        </Panel>
      ) : null}

      <Panel>
        <PanelHeader title="Record" description={`Created ${dateTime(investment.created_at)}`} />
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
          <dl className="grid gap-6 sm:grid-cols-3">
            <Field label="Reference" value={investment.uuid?.slice(0, 8)} mono />
            <Field label="Internal id" value={String(investment.id)} mono />
            <Field
              label="Total returned"
              value={<Amount><Banknote className="mr-1 inline size-3.5 text-[var(--dash-muted)]" />{money(projection.totalReturned)}</Amount>}
            />
          </dl>

          <ConfirmDelete
            action={deleteInvestment}
            name="uuid"
            value={investment.uuid}
            label="Delete placement"
            confirmLabel="Delete permanently"
            warning="This cannot be undone."
          />
        </div>
      </Panel>
    </div>
  );
}
