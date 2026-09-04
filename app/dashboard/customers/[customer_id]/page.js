import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, IdCard, Pencil, Plus } from "lucide-react";

import { sendMessage, updateCustomer } from "@/app/dashboard/actions";
import { loadCustomerByUuid, loadInvestmentsForCustomer } from "@/lib/dashboard-data";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getThreadsForCustomer } from "@/lib/messaging";
import { dayMonth, fullName, money, relativeTime, shortDate } from "@/lib/format";
import { deriveStatus, endOf, projectInvestment, startOf, summarizeBook } from "@/lib/investments";
import { bookValueTrend, payoutForecast, vehicleAllocation } from "@/lib/analytics";
import { AreaTrend, ChartCard, ColumnChart, DataTable, Legend, SplitBar } from "@/components/dashboard/charts";
import { CustomerForm } from "@/components/dashboard/customer-form";
import { MessageComposer } from "@/components/dashboard/message-composer";
import { Amount, Avatar, EmptyState, Field, MessagingSetupNotice, Panel, PanelHeader, StatCard, StatusPill, buttonStyles } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params, searchParams }) {
  const { customer_id } = await params;
  const { edit } = await searchParams;

  const customer = await loadCustomerByUuid(customer_id);
  if (!customer) notFound();

  // investments.customer_id is the bigint customers.id, never the uuid.
  const investments = await loadInvestmentsForCustomer(customer.id);
  const { threads, missing: messagingMissing } = await getThreadsForCustomer(createSupabaseServerClient(), customer.id, { channel: "email" });

  const now = new Date();
  const summary = summarizeBook(investments, now);
  const trend = bookValueTrend(investments, 12, now);
  const forecast = payoutForecast(investments, 12, now);
  const allocation = vehicleAllocation(investments, now).filter((row) => row.value > 0);
  const editing = edit === "1";

  const nextMaturity = investments
    .filter((investment) => deriveStatus(investment, now) !== "matured")
    .map((investment) => endOf(investment))
    .filter(Boolean)
    .sort((a, b) => a - b)[0];

  const portfolioStatus = summary.count
    ? summary.byStatus.active
      ? "active"
      : summary.byStatus.pending
        ? "pending"
        : "matured"
    : "none";

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-ink-2)] transition hover:text-[var(--dash-ink)]"
      >
        <ArrowLeft className="size-4" />
        Back to directory
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar customer={customer} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--dash-ink)]">{fullName(customer)}</h1>
              <StatusPill status={portfolioStatus} />
            </div>
            <p className="mt-1 truncate text-sm text-[var(--dash-ink-2)]">
              {customer.email} · {customer.phone_number || "no phone on file"}
            </p>
            <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
              Customer since {shortDate(customer.created_at)}
              {customer.neat_customer_id ? ` · ${customer.neat_customer_id}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={editing ? `/dashboard/customers/${customer_id}` : `/dashboard/customers/${customer_id}?edit=1`} className={buttonStyles.secondary}>
            <Pencil className="size-4" />
            {editing ? "Stop editing" : "Edit details"}
          </Link>
          <Link href={`/dashboard/investments/new?customer=${customer.id}`} className={buttonStyles.primary}>
            <Plus className="size-4" />
            New placement
          </Link>
        </div>
      </header>

      {editing ? <CustomerForm action={updateCustomer} customer={customer} cancelHref={`/dashboard/customers/${customer_id}`} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Capital placed" value={money(summary.principal)} hint={`${summary.count} placement${summary.count === 1 ? "" : "s"} all time`} />
        <StatCard label="Under management" value={money(summary.underManagement)} hint={`${summary.byStatus.active} active · ${summary.byStatus.pending} pending`} />
        <StatCard label="Profit still owed" value={money(summary.outstandingProfit)} hint="Across unmatured placements" upIsGood={false} />
        <StatCard
          label="Next maturity"
          value={nextMaturity ? shortDate(nextMaturity) : "—"}
          hint={nextMaturity ? relativeTime(nextMaturity) : "No open placements"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {summary.count ? (
            <>
              <ChartCard
                title="Portfolio value"
                subtitle="Principal held with NEAT over the last 12 months"
                table={<DataTable head={["Month", "Principal held"]} rows={trend.map((row) => [row.full, money(row.value)])} />}
              >
                <AreaTrend data={trend} format="money" height={200} label="Principal held" />
              </ChartCard>

              <ChartCard
                title="What this customer is owed"
                subtitle="Scheduled payments over the next 12 months"
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

              {allocation.length > 1 ? (
                <ChartCard
                  title="Vehicle mix"
                  subtitle="How this customer's open capital is spread"
                  table={<DataTable head={["Vehicle", "Principal", "Placements"]} rows={allocation.map((row) => [row.label, money(row.value), row.count])} />}
                >
                  <div className="pt-2">
                    <SplitBar data={allocation} colors={["var(--series-1)", "var(--series-2)"]} format="money" />
                  </div>
                </ChartCard>
              ) : null}
            </>
          ) : null}

          <Panel>
            <PanelHeader
              title="Placements"
              description={summary.count ? `${summary.count} on record` : undefined}
              action={
                <Link href={`/dashboard/investments/new?customer=${customer.id}`} className="text-xs font-medium text-[var(--dash-accent)] hover:underline">
                  Add
                </Link>
              }
            />
            {investments.length ? (
              <div className="overflow-x-auto dash-scroll">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--dash-line)] text-xs text-[var(--dash-muted)]">
                      <th scope="col" className="px-5 py-2.5 font-medium">Vehicle</th>
                      <th scope="col" className="px-5 py-2.5 font-medium">Term</th>
                      <th scope="col" className="px-5 py-2.5 text-right font-medium">Amount</th>
                      <th scope="col" className="px-5 py-2.5 text-right font-medium">Monthly profit</th>
                      <th scope="col" className="px-5 py-2.5 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--dash-line)]">
                    {investments.map((investment) => {
                      const projection = projectInvestment(investment);
                      return (
                        <tr key={investment.uuid} className="transition hover:bg-[var(--dash-page)]">
                          <td className="px-5 py-3">
                            <Link href={`/dashboard/investments/${investment.uuid}`} className="flex items-center gap-2 font-medium text-[var(--dash-ink)] hover:underline">
                              <span
                                className="size-2 shrink-0 rounded-[3px]"
                                style={{ background: projection.vehicle.key === "funding" ? "var(--series-2)" : "var(--series-1)" }}
                                aria-hidden
                              />
                              {projection.vehicle.label}
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-xs text-[var(--dash-ink-2)]">
                            {dayMonth(startOf(investment))} – {dayMonth(endOf(investment))} · {projection.months} mo
                          </td>
                          <td className="px-5 py-3 text-right"><Amount>{money(projection.principal)}</Amount></td>
                          <td className="px-5 py-3 text-right"><Amount>{money(projection.monthlyProfit)}</Amount></td>
                          <td className="px-5 py-3 text-right"><StatusPill status={deriveStatus(investment, now)} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No placements yet"
                description="Record this customer's first investment to start tracking their portfolio."
                action={
                  <Link href={`/dashboard/investments/new?customer=${customer.id}`} className={buttonStyles.primary}>
                    <Plus className="size-4" />
                    New placement
                  </Link>
                }
              />
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Profile" />
            <dl className="grid gap-5 px-5 py-5 sm:grid-cols-2">
              <Field label="Full name" value={[customer.first_name, customer.other_names, customer.last_name].filter(Boolean).join(" ")} />
              <Field label="Gender" value={customer.gender} />
              <Field label="Date of birth" value={customer.date_of_birth ? shortDate(customer.date_of_birth) : null} />
              <Field label="Phone" value={customer.phone_number} />
              <Field label="Email" value={customer.email} className="sm:col-span-2" />
              <Field label="Address" value={customer.address} className="sm:col-span-2" />
              <Field label="State" value={customer.state} />
              <Field label="LGA" value={customer.lga} />
            </dl>
          </Panel>

          <Panel>
            <PanelHeader title="Next of kin" />
            <dl className="grid gap-5 px-5 py-5 sm:grid-cols-2">
              <Field label="Name" value={customer.nok_name} />
              <Field label="Relationship" value={customer.nok_relationship} />
              <Field label="Gender" value={customer.nok_gender} />
              <Field label="Phone" value={customer.nok_phone_number} />
              <Field label="Address" value={customer.nok_address} className="sm:col-span-2" />
            </dl>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader
              title="Conversations"
              description="Email messages with this customer"
              action={<Link href="/dashboard/notes" className={buttonStyles.ghost}>Open notes</Link>}
            />
            {messagingMissing ? (
              <MessagingSetupNotice />
            ) : (
              <>
                {threads.length ? (
                  <ul className="divide-y divide-[var(--dash-line)]">
                    {threads.slice(0, 4).map((thread) => (
                      <li key={thread.uuid}>
                        <Link href={`/dashboard/messages/${thread.uuid}`} className="block px-5 py-3.5 transition hover:bg-[var(--dash-page)]">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-medium text-[var(--dash-ink)]">{thread.subject}</p>
                            <StatusPill status={thread.status} />
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-[var(--dash-muted)]">{thread.last_preview || "No messages yet"}</p>
                          <p className="mt-1 text-[11px] text-[var(--dash-muted)]">{relativeTime(thread.last_message_at)}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 pt-4 text-sm text-[var(--dash-ink-2)]">No conversations yet. Start one below.</p>
                )}
                <div className="border-t border-[var(--dash-line)]">
                  <MessageComposer
                    action={sendMessage}
                    customerId={customer.id}
                    customerName={customer.first_name}
                    defaultSubject={`Your NEAT portfolio`}
                    redirectToThread
                    compact
                  />
                </div>
              </>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Identification" />
            <dl className="grid gap-5 px-5 py-5 sm:grid-cols-2">
              <Field label="ID type" value={customer.id_type} />
              <Field label="ID number" value={customer.id_number} mono />
            </dl>
            {customer.id_front_url || customer.id_back_url ? (
              <div className="grid gap-3 border-t border-[var(--dash-line)] px-5 py-5 sm:grid-cols-2">
                <DocumentThumb label="ID front" url={customer.id_front_url} />
                <DocumentThumb label="ID back" url={customer.id_back_url} />
              </div>
            ) : (
              <p className="border-t border-[var(--dash-line)] px-5 py-4 text-xs text-[var(--dash-muted)]">
                <IdCard className="mr-1.5 inline size-3.5" />
                No identity documents uploaded.
              </p>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Photo" />
            <div className="px-5 py-5">
              {customer.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customer.image_url} alt={fullName(customer)} className="h-56 w-full rounded-xl object-cover ring-1 ring-[var(--dash-line)]" />
              ) : (
                <div className="grid h-56 w-full place-items-center rounded-xl bg-[var(--dash-page)] text-sm text-[var(--dash-muted)]">
                  No photo on file
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function DocumentThumb({ label, url }) {
  return (
    <figure className="m-0">
      <figcaption className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--dash-muted)]">{label}</figcaption>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} className="h-32 w-full rounded-xl object-cover ring-1 ring-[var(--dash-line)] transition hover:opacity-90" />
        </a>
      ) : (
        <div className="grid h-32 w-full place-items-center rounded-xl bg-[var(--dash-page)] text-xs text-[var(--dash-muted)]">Not uploaded</div>
      )}
    </figure>
  );
}
