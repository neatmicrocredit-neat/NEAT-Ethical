import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, MessageSquarePlus, Pencil, RefreshCw } from "lucide-react";

import { deleteInvestment, updateInvestment } from "@/app/dashboard/actions";
import { transitionInvestment } from "@/app/dashboard/approvals/actions";
import { createTask, deleteTask, setTaskStatus } from "@/app/dashboard/tasks/actions";
import { deleteDocument, reviewDocument, uploadCustomerDocument } from "@/app/dashboard/documents/actions";
import { hasCapability } from "@/lib/auth";
import { loadAuditFor } from "@/lib/audit";
import { approvalBlockers } from "@/lib/compliance";
import { loadCustomerById, loadInvestmentByUuid } from "@/lib/dashboard-data";
import { DOCUMENT_KINDS, effectiveStatus, loadDocumentsForCustomer, loadDocumentsForInvestment } from "@/lib/documents";
import { dateTime, fullName, money, relativeTime, shortDate } from "@/lib/format";
import { endOf, projectInvestment, startOf } from "@/lib/investments";
import { PAYMENT_METHODS, TRANSACTION_KINDS, loadTransactionsForInvestment, settlementFor } from "@/lib/ledger";
import { loadSettings } from "@/lib/settings";
import { isOverdue, loadTasksForInvestment, sortForWork } from "@/lib/tasks";
import { lifecycle, transitionsFor } from "@/lib/workflow";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ChartCard, ColumnChart, DataTable } from "@/components/dashboard/charts";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { DocumentVault } from "@/components/dashboard/document-vault";
import { InvestmentForm } from "@/components/dashboard/investment-form";
import { SettlementPanel, WorkflowControl } from "@/components/dashboard/settlement-panel";
import { TaskBoard } from "@/components/dashboard/task-board";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { Amount, Avatar, Field, PageHeader, Panel, PanelHeader, StatCard, StatusPill, buttonStyles } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const investment = await loadInvestmentByUuid(id);
  return { title: investment ? `${money(investment.amount)} placement · Admin console` : "Placement · Admin console" };
}

export default async function InvestmentDetailPage({ params, searchParams }) {
  const { id } = await params;
  const { edit } = await searchParams;
  const now = new Date();

  const investment = await loadInvestmentByUuid(id);
  if (!investment) notFound();

  const [customer, transactions, placementDocuments, tasks, activity, { settings }, canWriteLedger, canApprove, canWriteDocs, canVerifyDocs, canWriteTasks] =
    await Promise.all([
      investment.customer_id ? loadCustomerById(investment.customer_id) : null,
      loadTransactionsForInvestment(investment.id),
      loadDocumentsForInvestment(investment.id),
      loadTasksForInvestment(investment.id),
      loadAuditFor("investment", investment.id),
      loadSettings(),
      hasCapability("ledger.write"),
      hasCapability("investments.approve"),
      hasCapability("documents.write"),
      hasCapability("documents.verify"),
      hasCapability("tasks.write"),
    ]);

  const customerDocuments = investment.customer_id ? await loadDocumentsForCustomer(investment.customer_id) : [];
  const projection = projectInvestment(investment);
  const settlement = settlementFor(investment, transactions, now);
  const state = lifecycle(investment, now);
  const gate = approvalBlockers(customer, customerDocuments, { requireKyc: settings.policy.requireKycToApprove }, now);
  const editing = edit === "1";

  const cashflow = projection.rows.map((row) => ({
    key: `m${row.month}`,
    label: `M${row.month}`,
    full: row.date ? shortDate(row.date) : `Month ${row.month}`,
    values: { profit: row.profitPaid, principal: row.principalPaid },
  }));

  const ledgerRows = transactions.map((transaction) => ({
    uuid: transaction.uuid,
    valueDate: transaction.value_date,
    customer: customer ? fullName(customer) : "Unattributed",
    vehicleLabel: projection.vehicle.label,
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
  }));

  const documentRows = placementDocuments.map((document) => ({
    uuid: document.uuid,
    title: document.title,
    kindLabel: DOCUMENT_KINDS[document.kind]?.label || document.kind,
    status: effectiveStatus(document, now),
    customer: customer ? fullName(customer) : "",
    customerUuid: customer?.uuid || null,
    fileUrl: document.file_url,
    note: document.note,
    expiresOn: document.expires_on,
    createdAt: document.created_at,
    uploadedBy: document.uploaded_by,
    reviewedBy: document.reviewed_by,
    reviewedAt: document.reviewed_at,
  }));

  const taskRows = sortForWork(tasks, now).map((task) => ({
    uuid: task.uuid,
    title: task.title,
    detail: task.detail,
    status: task.status,
    priority: task.priority,
    dueOn: task.due_on,
    assignee: task.assignee,
    customer: customer ? fullName(customer) : null,
    customerUuid: customer?.uuid || null,
    overdue: isOverdue(task, now),
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

      <PageHeader
        eyebrow="Placement"
        title={`${money(projection.principal)} · ${projection.vehicle.label}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {customer ? (
              <Link href={`/dashboard/messages/new?customer=${customer.id}`} className={buttonStyles.secondary}>
                <MessageSquarePlus className="size-4" />
                Message
              </Link>
            ) : null}
            {canWriteLedger ? (
              <Link href={`/dashboard/transactions/new?investment=${investment.id}`} className={buttonStyles.secondary}>
                <Banknote className="size-4" />
                Record payment
              </Link>
            ) : null}
            <Link href={editing ? `/dashboard/investments/${id}` : `/dashboard/investments/${id}?edit=1`} className={buttonStyles.secondary}>
              <Pencil className="size-4" />
              {editing ? "Stop editing" : "Edit"}
            </Link>
          </div>
        }
      >
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <StatusPill status={state.tone} label={state.label} />
          {settlement.arrears > 0.5 ? <StatusPill status="arrears" label={`${money(settlement.arrears)} in arrears`} /> : null}
          {investment.rollover ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--dash-accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--dash-accent)]">
              <RefreshCw className="size-3" />
              Rolls over
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-[var(--dash-ink-2)]">
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
      </PageHeader>

      {canApprove ? (
        <div className="flex flex-wrap items-start gap-3">
          <WorkflowControl
            investment={investment}
            transitions={transitionsFor(investment)}
            action={transitionInvestment}
            blockers={gate.blockers}
          />
          {investment.decision_note ? (
            <p className="rounded-xl bg-[var(--dash-page)] px-3.5 py-2.5 text-xs text-[var(--dash-ink-2)]">
              “{investment.decision_note}”
              {investment.approved_by ? <span className="text-[var(--dash-muted)]"> — {investment.approved_by}</span> : null}
            </p>
          ) : null}
        </div>
      ) : null}

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
        <StatCard
          label="Principal"
          value={money(projection.principal)}
          hint={
            settlement.funding.funded
              ? "Fully funded on the ledger"
              : `${money(settlement.funding.received)} received of ${money(settlement.funding.expected)}`
          }
          tone={settlement.funding.funded ? undefined : "pending"}
        />
        <StatCard
          label={projection.rollover ? "First month profit" : "Monthly profit"}
          value={money(projection.monthlyProfit)}
          hint={projection.schedule === "monthly" ? "Paid out every month" : "Retained until maturity"}
        />
        <StatCard
          label="Paid to the customer"
          value={money(settlement.paidToDate)}
          hint={`${money(settlement.dueToDate)} due to date`}
        />
        <StatCard
          label="Still owed"
          value={money(settlement.remainingObligation)}
          hint={state.key === "matured" ? `Matured ${relativeTime(endOf(investment))}` : `Matures ${relativeTime(endOf(investment))}`}
          upIsGood={false}
        />
      </div>

      <SettlementPanel settlement={settlement} investmentId={investment.id} canRecord={canWriteLedger} />

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
                  <Field label="KYC" value={gate.compliance.status.label} />
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

      {ledgerRows.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Ledger for this placement</h2>
          <TransactionTable rows={ledgerRows} kinds={Object.values(TRANSACTION_KINDS)} />
        </section>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Documents</h2>
          <DocumentVault
            rows={documentRows}
            uploadAction={uploadCustomerDocument}
            reviewAction={reviewDocument}
            deleteAction={deleteDocument}
            canUpload={canWriteDocs}
            canVerify={canVerifyDocs}
            lockedCustomerId={investment.customer_id}
            lockedCustomerUuid={customer?.uuid}
            lockedInvestmentId={investment.id}
            compact
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Follow-ups</h2>
          <TaskBoard
            rows={taskRows}
            createAction={createTask}
            statusAction={setTaskStatus}
            deleteAction={deleteTask}
            canWrite={canWriteTasks}
            lockedCustomerId={investment.customer_id}
            lockedCustomerUuid={customer?.uuid}
            lockedInvestmentId={investment.id}
            compact
          />
        </section>
      </div>

      {investment.other_instructions || investment.risk_notes ? (
        <Panel>
          <PanelHeader title="Notes" />
          <div className="space-y-4 px-5 py-5">
            {investment.other_instructions ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--dash-ink-2)]">{investment.other_instructions}</p>
            ) : null}
            {investment.risk_notes ? (
              <p className="whitespace-pre-wrap rounded-xl bg-[var(--dash-page)] px-3.5 py-3 text-sm leading-relaxed text-[var(--dash-ink-2)]">
                <span className="font-medium text-[var(--dash-ink)]">Risk: </span>
                {investment.risk_notes}
              </p>
            ) : null}
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <PanelHeader title="History" description="Every change made to this placement." />
          <ActivityFeed entries={activity} />
        </Panel>

        <Panel>
          <PanelHeader title="Record" description={`Created ${dateTime(investment.created_at)}`} />
          <div className="space-y-5 px-5 py-5">
            <dl className="grid gap-6 sm:grid-cols-2">
              <Field label="Reference" value={investment.reference || investment.uuid?.slice(0, 8)} mono />
              <Field label="Internal id" value={String(investment.id)} mono />
              <Field label="Submitted" value={investment.submitted_at ? dateTime(investment.submitted_at) : "—"} />
              <Field label="Approved" value={investment.approved_at ? `${dateTime(investment.approved_at)} by ${investment.approved_by || "—"}` : "—"} />
              <Field label="Funded" value={investment.funded_at ? dateTime(investment.funded_at) : "—"} />
              <Field
                label="Total returned over term"
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
    </div>
  );
}
