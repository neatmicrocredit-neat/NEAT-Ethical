import { notFound } from "next/navigation";

import { hasCapability } from "@/lib/auth";
import { complianceFor, groupDocumentsByCustomer } from "@/lib/compliance";
import { loadBook } from "@/lib/dashboard-data";
import { effectiveStatus, loadDocuments } from "@/lib/documents";
import { fullName } from "@/lib/format";
import { PAYMENT_METHODS, TRANSACTION_KINDS, buildPayoutRun, groupTransactionsByInvestment, loadTransactions, settlementFor } from "@/lib/ledger";
import { endOf, projectInvestment, startOf } from "@/lib/investments";
import { loadSettings } from "@/lib/settings";
import { lifecycle } from "@/lib/workflow";
import { groupByCustomer } from "@/lib/analytics";
import { ReportBuilder } from "@/components/dashboard/report-builder";
import { PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Reports · Admin console" };

const iso = (date) => (date ? new Date(date).toISOString().slice(0, 10) : "");

export default async function ReportsPage() {
  if (!(await hasCapability("reports.export"))) notFound();

  const now = new Date();
  const [{ customers, investments }, { transactions }, { documents }, { settings }] = await Promise.all([
    loadBook(),
    loadTransactions(),
    loadDocuments(),
    loadSettings(),
  ]);

  const customersById = new Map(customers.map((customer) => [String(customer.id), customer]));
  const investmentsById = new Map(investments.map((investment) => [String(investment.id), investment]));
  const ledgerByInvestment = groupTransactionsByInvestment(transactions);
  const documentsByCustomer = groupDocumentsByCustomer(documents);
  const grouped = groupByCustomer(customers, investments, now);

  const portfolio = investments.map((investment) => {
    const projection = projectInvestment(investment);
    const customer = customersById.get(String(investment.customer_id));
    const settlement = settlementFor(investment, ledgerByInvestment.get(String(investment.id)) || [], now);

    return [
      investment.reference || investment.uuid.slice(0, 8),
      fullName(customer),
      customer?.email || "",
      projection.vehicle.label,
      Math.round(projection.principal),
      projection.months,
      iso(startOf(investment)),
      iso(endOf(investment)),
      projection.schedule === "maturity" ? "At maturity" : "Monthly",
      investment.rollover ? "Yes" : "No",
      lifecycle(investment, now).label,
      Math.round(projection.monthlyProfit),
      Math.round(projection.totalProfit),
      Math.round(settlement.paidToDate),
      Math.round(settlement.remainingObligation),
    ];
  });

  const ledger = transactions.map((transaction) => {
    const customer = customersById.get(String(transaction.customer_id));
    const investment = investmentsById.get(String(transaction.investment_id));
    return [
      iso(transaction.value_date),
      customer ? fullName(customer) : "Unattributed",
      investment ? investment.uuid.slice(0, 8) : "",
      TRANSACTION_KINDS[transaction.kind]?.label || transaction.kind,
      transaction.direction,
      Math.round(Math.abs(Number(transaction.amount) || 0)),
      transaction.status,
      PAYMENT_METHODS[transaction.method] || "",
      transaction.reference || "",
      transaction.period_index || "",
      transaction.created_by || "",
    ];
  });

  const run = buildPayoutRun(investments, transactions, now, { horizonDays: 0 });
  const arrears = run.overdue.map((row) => [
    fullName(customersById.get(String(row.customerId))),
    row.vehicle.label,
    row.month,
    iso(row.date),
    Math.round(row.profitDue),
    Math.round(row.principalDue),
    Math.round(row.paid),
    Math.round(row.outstanding),
    row.daysLate,
  ]);

  const customerRows = customers.map((customer) => {
    const entry = grouped.byId.get(String(customer.id));
    return [
      fullName(customer),
      customer.email || "",
      customer.phone_number || "",
      customer.state || "",
      customer.id_type || "",
      customer.id_number || "",
      customer.kyc_status || "unverified",
      customer.risk_rating || "unrated",
      customer.is_pep ? "Yes" : "No",
      entry?.summary.count || 0,
      Math.round(entry?.summary.principal || 0),
      iso(customer.created_at),
    ];
  });

  const maturities = investments
    .map((investment) => {
      const projection = projectInvestment(investment);
      const end = endOf(investment);
      const atMaturity = projection.schedule === "maturity" ? projection.totalProfit : 0;
      return {
        sort: end ? end.getTime() : Infinity,
        row: [
          fullName(customersById.get(String(investment.customer_id))),
          projection.vehicle.label,
          Math.round(projection.principal),
          Math.round(atMaturity),
          Math.round(projection.principal + atMaturity),
          iso(end),
          lifecycle(investment, now).label,
        ],
      };
    })
    .sort((a, b) => a.sort - b.sort)
    .map((entry) => entry.row);

  const compliance = customers.map((customer) => {
    const customerDocuments = documentsByCustomer.get(String(customer.id)) || [];
    const record = complianceFor(customer, customerDocuments, now);
    const entry = grouped.byId.get(String(customer.id));
    return [
      fullName(customer),
      customer.email || "",
      record.status.label,
      record.risk.label,
      record.isPep ? "Yes" : "No",
      record.score,
      customerDocuments.filter((document) => effectiveStatus(document, now) === "verified").length,
      record.gaps.join("; ") || "None",
      Math.round(entry?.summary.principal || 0),
    ];
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insight"
        title="Reports"
        description="Board and regulator-ready extracts of the book, built from live data and exported as CSV."
      />
      <ReportBuilder
        companyName={settings.company.name}
        datasets={{ portfolio, ledger, arrears, customers: customerRows, maturities, compliance }}
      />
    </div>
  );
}
