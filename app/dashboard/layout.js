import { DashboardShell } from "@/components/dashboard/shell";
import { currentMember } from "@/lib/auth";
import { complianceFor, groupDocumentsByCustomer } from "@/lib/compliance";
import { loadBook } from "@/lib/dashboard-data";
import { effectiveStatus, loadDocuments } from "@/lib/documents";
import { buildPayoutRun, loadTransactions } from "@/lib/ledger";
import { countAwaiting } from "@/lib/messaging";
import { countOpenTasks } from "@/lib/tasks";
import { capabilitiesFor, roleOf } from "@/lib/team";
import { NEEDS_REVIEW, workflowOf } from "@/lib/workflow";

export const metadata = {
  title: "Admin console · NEAT Ethical Investments",
};

/**
 * Sidebar counts.
 *
 * Every loader here degrades to an empty result when its migration has not been
 * applied, so the shell renders either way — a badge that cannot be computed is
 * simply absent rather than an error. `loadBook` and `loadTransactions` are
 * `React.cache`d, so the page below reuses these same reads.
 */
async function loadBadges() {
  const now = new Date();
  const [{ customers, investments }, { transactions }, { documents }, awaiting, openTasks] = await Promise.all([
    loadBook(),
    loadTransactions(),
    loadDocuments(),
    countAwaiting(),
    countOpenTasks(),
  ]);

  const documentsByCustomer = groupDocumentsByCustomer(documents);
  const unverified = customers.filter((customer) => {
    const record = complianceFor(customer, documentsByCustomer.get(String(customer.id)) || [], now);
    return !record.cleared && !record.blocked;
  }).length;

  return {
    messages: awaiting,
    tasks: openTasks,
    approvals: investments.filter((investment) => NEEDS_REVIEW.has(workflowOf(investment).key)).length,
    payouts: buildPayoutRun(investments, transactions, now, { horizonDays: 0 }).overdue.length,
    documents: documents.filter((document) => effectiveStatus(document, now) === "pending").length,
    compliance: unverified,
  };
}

export default async function DashboardLayout({ children }) {
  const [member, badges] = await Promise.all([currentMember(), loadBadges()]);
  const role = roleOf(member);

  return (
    <DashboardShell
      adminEmail={member?.email}
      roleLabel={role.label}
      capabilities={capabilitiesFor(role.key)}
      badges={badges}
    >
      {children}
    </DashboardShell>
  );
}
