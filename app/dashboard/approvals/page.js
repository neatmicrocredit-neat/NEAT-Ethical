import { hasCapability } from "@/lib/auth";
import { approvalBlockers, groupDocumentsByCustomer, kycStatusOf, riskOf } from "@/lib/compliance";
import { loadBook } from "@/lib/dashboard-data";
import { loadDocuments } from "@/lib/documents";
import { fullName, money } from "@/lib/format";
import { projectInvestment, startOf } from "@/lib/investments";
import { loadSettings } from "@/lib/settings";
import { NEEDS_REVIEW, canTransition, workflowOf } from "@/lib/workflow";
import { ApprovalQueue } from "@/components/dashboard/approval-queue";
import { PageHeader, SetupNotice, StatCard } from "@/components/dashboard/ui";
import { bulkApprove, transitionInvestment } from "@/app/dashboard/approvals/actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Approvals · Admin console" };

export default async function ApprovalsPage() {
  const now = new Date();
  const [{ customers, investments, legacySchema }, { documents }, { settings }, canApprove] = await Promise.all([
    loadBook(),
    loadDocuments(),
    loadSettings(),
    hasCapability("investments.approve"),
  ]);

  if (legacySchema) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Pipeline" title="Approvals" description="Placements waiting on a decision." />
        <SetupNotice
          feature="The approvals pipeline"
          migration="supabase/migrations/0003_operations.sql"
          tables={["investments.status", "documents"]}
        />
      </div>
    );
  }

  const customersById = new Map(customers.map((customer) => [String(customer.id), customer]));
  const documentsByCustomer = groupDocumentsByCustomer(documents);
  const requireKyc = settings.policy.requireKycToApprove;

  const queue = investments
    .filter((investment) => NEEDS_REVIEW.has(workflowOf(investment).key))
    .map((investment) => {
      const customer = customersById.get(String(investment.customer_id));
      const projection = projectInvestment(investment);
      const gate = approvalBlockers(customer, documentsByCustomer.get(String(investment.customer_id)) || [], { requireKyc }, now);

      return {
        uuid: investment.uuid,
        status: workflowOf(investment).key,
        customer: fullName(customer),
        // Only the fields Avatar reads, so a whole customer record is not
        // serialised into the client bundle for every row.
        customerRecord: customer ? { first_name: customer.first_name, last_name: customer.last_name, image_url: customer.image_url } : null,
        kycStatus: customer ? kycStatusOf(customer).key : null,
        riskRating: customer ? riskOf(customer).key : null,
        amount: projection.principal,
        totalProfit: projection.totalProfit,
        months: projection.months,
        vehicleLabel: projection.vehicle.label,
        schedule: projection.schedule === "maturity" ? "At maturity" : "Monthly",
        startAt: startOf(investment)?.toISOString() || null,
        submittedAt: investment.submitted_at,
        createdAt: investment.created_at,
        clear: gate.clear,
        blockers: gate.blockers,
        canApprove: canTransition(workflowOf(investment).key, "approved"),
      };
    })
    .sort((a, b) => new Date(a.submittedAt || a.createdAt) - new Date(b.submittedAt || b.createdAt));

  const clear = queue.filter((row) => row.clear);
  const blocked = queue.filter((row) => !row.clear);
  const queuedValue = queue.reduce((sum, row) => sum + row.amount, 0);
  const oldest = queue[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pipeline"
        title="Approvals"
        description={
          requireKyc
            ? "Placements waiting on a decision. A placement cannot be approved until its customer's KYC file is complete."
            : "Placements waiting on a decision. KYC is not currently enforced at approval — change that under Settings."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="In the queue" value={queue.length.toLocaleString()} hint={`${money(queuedValue)} of capital`} />
        <StatCard label="Clear to approve" value={clear.length.toLocaleString()} hint="Compliance file complete" />
        <StatCard
          label="Blocked"
          value={blocked.length.toLocaleString()}
          hint="Waiting on documents or verification"
          tone={blocked.length ? "pending" : undefined}
          upIsGood={false}
        />
        <StatCard
          label="Longest wait"
          value={oldest ? `${Math.max(0, Math.floor((now - new Date(oldest.submittedAt || oldest.createdAt)) / 86400000))} days` : "—"}
          hint={oldest ? oldest.customer : "Nothing waiting"}
        />
      </div>

      <ApprovalQueue rows={queue} bulkAction={bulkApprove} decideAction={transitionInvestment} canApprove={canApprove} />
    </div>
  );
}
