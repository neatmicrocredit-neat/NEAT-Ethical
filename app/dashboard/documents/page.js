import { hasCapability } from "@/lib/auth";
import { loadBook } from "@/lib/dashboard-data";
import { DOCUMENT_KINDS, documentSummary, effectiveStatus, loadDocuments } from "@/lib/documents";
import { fullName, toDate } from "@/lib/format";
import { DocumentVault } from "@/components/dashboard/document-vault";
import { PageHeader, SetupNotice, StatCard } from "@/components/dashboard/ui";
import { deleteDocument, reviewDocument, uploadCustomerDocument } from "@/app/dashboard/documents/actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Documents · Admin console" };

export default async function DocumentsPage({ searchParams }) {
  const { customer: customerFilter } = await searchParams;
  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 24 * 3600e3);

  const [{ customers }, { documents, missing }, canUpload, canVerify] = await Promise.all([
    loadBook(),
    loadDocuments(),
    hasCapability("documents.write"),
    hasCapability("documents.verify"),
  ]);

  if (missing) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Governance" title="Documents" description="Identity, mandate and statement files." />
        <SetupNotice feature="The document vault" migration="supabase/migrations/0003_operations.sql" tables={["documents"]} />
      </div>
    );
  }

  const customersById = new Map(customers.map((customer) => [String(customer.id), customer]));
  const scoped = customerFilter
    ? documents.filter((document) => customersById.get(String(document.customer_id))?.uuid === customerFilter)
    : documents;

  const rows = scoped.map((document) => {
    const customer = customersById.get(String(document.customer_id));
    const status = effectiveStatus(document, now);
    const expiry = toDate(document.expires_on);
    return {
      uuid: document.uuid,
      title: document.title,
      kindLabel: DOCUMENT_KINDS[document.kind]?.label || document.kind,
      status,
      customer: customer ? fullName(customer) : "Unattached",
      customerUuid: customer?.uuid || null,
      fileUrl: document.file_url,
      note: document.note,
      expiresOn: document.expires_on,
      expiringSoon: status === "verified" && expiry && expiry <= soon,
      createdAt: document.created_at,
      uploadedBy: document.uploaded_by,
      reviewedBy: document.reviewed_by,
      reviewedAt: document.reviewed_at,
    };
  });

  const summary = documentSummary(scoped, now);
  const focus = customerFilter ? customers.find((customer) => customer.uuid === customerFilter) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Documents"
        description={
          focus
            ? `Everything filed for ${fullName(focus)}.`
            : "The document vault. Every identity check, mandate and certificate held against a customer or placement."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="On file" value={summary.total.toLocaleString()} hint="Documents held" />
        <StatCard
          label="Awaiting review"
          value={(summary.pending || 0).toLocaleString()}
          hint="Uploaded, not yet verified"
          tone={summary.pending ? "pending" : undefined}
          upIsGood={false}
        />
        <StatCard label="Verified" value={(summary.verified || 0).toLocaleString()} hint="Checked and accepted" />
        <StatCard
          label="Expiring or expired"
          value={((summary.expired || 0) + summary.expiringSoon).toLocaleString()}
          hint="Within 30 days, or already lapsed"
          upIsGood={false}
        />
      </div>

      <DocumentVault
        rows={rows}
        uploadAction={uploadCustomerDocument}
        reviewAction={reviewDocument}
        deleteAction={deleteDocument}
        canUpload={canUpload}
        canVerify={canVerify}
        customers={customers}
        lockedCustomerId={focus?.id}
        lockedCustomerUuid={focus?.uuid}
      />
    </div>
  );
}
