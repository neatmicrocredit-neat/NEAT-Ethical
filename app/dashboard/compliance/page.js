import { hasCapability } from "@/lib/auth";
import { complianceFor, complianceSummary, groupDocumentsByCustomer } from "@/lib/compliance";
import { loadBook } from "@/lib/dashboard-data";
import { loadDocuments } from "@/lib/documents";
import { fullName, money, percent } from "@/lib/format";
import { groupByCustomer } from "@/lib/analytics";
import { ComplianceTable } from "@/components/dashboard/compliance-table";
import { ChartCard, DataTable, SplitBar } from "@/components/dashboard/charts";
import { PageHeader, SetupNotice, StatCard } from "@/components/dashboard/ui";
import { setComplianceStatus } from "@/app/dashboard/compliance/actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Compliance · Admin console" };

export default async function CompliancePage() {
  const now = new Date();
  const [{ customers, investments, legacySchema }, { documents }, canVerify] = await Promise.all([
    loadBook(),
    loadDocuments(),
    hasCapability("customers.verify"),
  ]);

  if (legacySchema) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Governance" title="Compliance" description="KYC status and risk rating for every customer." />
        <SetupNotice
          feature="Compliance tracking"
          migration="supabase/migrations/0003_operations.sql"
          tables={["customers.kyc_status", "documents"]}
        />
      </div>
    );
  }

  const documentsByCustomer = groupDocumentsByCustomer(documents);
  const grouped = groupByCustomer(customers, investments, now);
  const summary = complianceSummary(customers, documentsByCustomer, now);

  const rows = customers.map((customer) => {
    const compliance = complianceFor(customer, documentsByCustomer.get(String(customer.id)) || [], now);
    const entry = grouped.byId.get(String(customer.id));

    return {
      uuid: customer.uuid,
      name: fullName(customer),
      email: customer.email || "",
      phone: customer.phone_number || "",
      avatar: { first_name: customer.first_name, last_name: customer.last_name, image_url: customer.image_url },
      kycStatus: compliance.status.key,
      riskRating: compliance.risk.key,
      isPep: compliance.isPep,
      kycNote: customer.kyc_note || "",
      score: compliance.score,
      gaps: compliance.gaps,
      checklist: [...compliance.profile.items.map((item) => ({ label: item.label, satisfied: item.satisfied })), ...compliance.kyc.items],
      principal: entry?.summary.principal || 0,
    };
  });

  // Capital sitting behind an incomplete file is the number that matters more
  // than the headcount — one unverified whale outweighs fifty clean small files.
  const exposure = rows.reduce(
    (acc, row) => {
      if (row.kycStatus === "verified" && !row.gaps.length) acc.cleared += row.principal;
      else acc.atRisk += row.principal;
      return acc;
    },
    { cleared: 0, atRisk: 0 }
  );

  const statusSplit = [
    { key: "verified", label: "Verified", value: summary.verified },
    { key: "in_review", label: "In review", value: summary.inReview },
    { key: "unverified", label: "Unverified", value: summary.unverified },
    { key: "rejected", label: "Rejected", value: summary.rejected },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Compliance"
        description="KYC status, risk rating and document completeness for every customer on the book."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Verified" value={summary.verified.toLocaleString()} hint={`${percent(summary.rate, 0)} of all customers`} />
        <StatCard
          label="Awaiting review"
          value={(summary.inReview + summary.unverified).toLocaleString()}
          hint="Unverified or in review"
          tone={summary.inReview + summary.unverified ? "pending" : undefined}
          upIsGood={false}
        />
        <StatCard
          label="High risk or PEP"
          value={(summary.highRisk + summary.pep).toLocaleString()}
          hint="Files needing enhanced due diligence"
          upIsGood={false}
        />
        <StatCard label="Files complete" value={summary.complete.toLocaleString()} hint="Profile and documents both satisfied" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Register by status"
          subtitle="Customers in each KYC state"
          table={<DataTable head={["Status", "Customers"]} rows={statusSplit.map((row) => [row.label, row.value])} />}
        >
          <div className="pt-2">
            <SplitBar
              data={statusSplit}
              colors={["var(--status-good)", "var(--status-warning)", "var(--series-1)", "var(--status-critical)"]}
              format="number"
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Capital by file state"
          subtitle="Principal behind a clean file, against principal that is not"
          table={
            <DataTable
              head={["File state", "Capital"]}
              rows={[
                ["Verified and complete", money(exposure.cleared)],
                ["Incomplete or unverified", money(exposure.atRisk)],
              ]}
            />
          }
        >
          <div className="pt-2">
            <SplitBar
              data={[
                { key: "cleared", label: "Verified", value: exposure.cleared },
                { key: "atRisk", label: "Incomplete", value: exposure.atRisk },
              ]}
              colors={["var(--status-good)", "var(--status-warning)"]}
              format="money"
            />
          </div>
        </ChartCard>
      </div>

      <ComplianceTable rows={rows} action={setComplianceStatus} canVerify={canVerify} />
    </div>
  );
}
