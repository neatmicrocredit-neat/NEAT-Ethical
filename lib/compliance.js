import { kycChecklist } from "@/lib/documents";
import { fullName } from "@/lib/format";

export const KYC_STATUSES = {
  unverified: { key: "unverified", label: "Unverified", tone: "pending", note: "No review has taken place." },
  in_review: { key: "in_review", label: "In review", tone: "pending", note: "Documents received, awaiting a decision." },
  verified: { key: "verified", label: "Verified", tone: "active", note: "Identity and address confirmed." },
  rejected: { key: "rejected", label: "Rejected", tone: "rejected", note: "Verification failed. Placements are blocked." },
};

export const RISK_RATINGS = {
  unrated: { key: "unrated", label: "Unrated", rank: 0, tone: "closed" },
  low: { key: "low", label: "Low", rank: 1, tone: "active" },
  medium: { key: "medium", label: "Medium", rank: 2, tone: "pending" },
  high: { key: "high", label: "High", rank: 3, tone: "rejected" },
};

export function kycStatusOf(customer) {
  const raw = String(customer?.kyc_status ?? "").trim().toLowerCase();
  return KYC_STATUSES[raw] || KYC_STATUSES.unverified;
}

export function riskOf(customer) {
  const raw = String(customer?.risk_rating ?? "").trim().toLowerCase();
  return RISK_RATINGS[raw] || RISK_RATINGS.unrated;
}

/**
 * The fields the console captures directly on the customer record, as opposed
 * to the document vault. Both have to be complete before a file is clean.
 */
export function profileChecklist(customer) {
  const items = [
    { key: "identity", label: "ID type and number", satisfied: Boolean(customer?.id_type && customer?.id_number) },
    { key: "address", label: "Address and state", satisfied: Boolean(customer?.address && customer?.state) },
    { key: "contact", label: "Email and phone", satisfied: Boolean(customer?.email && customer?.phone_number) },
    { key: "dob", label: "Date of birth", satisfied: Boolean(customer?.date_of_birth) },
    { key: "nok", label: "Next of kin", satisfied: Boolean(customer?.nok_name && customer?.nok_phone_number) },
    { key: "bank", label: "Photograph on file", satisfied: Boolean(customer?.image_url) },
  ];
  const satisfied = items.filter((item) => item.satisfied).length;
  return { items, satisfied, total: items.length, complete: satisfied === items.length };
}

/**
 * One verdict per customer, combining the profile fields, the document vault,
 * and the reviewer's own decision.
 *
 * The reviewer's decision wins where it is stricter: a customer marked
 * `rejected` is blocked even with a perfect file, because a human looked and
 * said no. But a customer marked `verified` whose documents have since expired
 * is reported as incomplete — verification is a claim about the file as it
 * stands, not a permanent badge.
 */
export function complianceFor(customer, documents = [], now = new Date()) {
  const profile = profileChecklist(customer);
  const kyc = kycChecklist(documents, now);
  const status = kycStatusOf(customer);
  const risk = riskOf(customer);

  const fileComplete = profile.complete && kyc.complete;
  const blocked = status.key === "rejected";
  const cleared = status.key === "verified" && fileComplete && !blocked;

  const gaps = [...profile.items.filter((item) => !item.satisfied).map((item) => item.label), ...kyc.missing];

  return {
    profile,
    kyc,
    status,
    risk,
    isPep: Boolean(customer?.is_pep),
    fileComplete,
    blocked,
    cleared,
    gaps,
    score: Math.round(((profile.satisfied + kyc.satisfied) / (profile.total + kyc.total)) * 100),
  };
}

/**
 * The gate the approvals queue asks about before letting a placement through.
 * Returns a reason string when the answer is no, so the UI never has to guess
 * why the button is disabled.
 */
export function approvalBlockers(customer, documents = [], { requireKyc = true } = {}, now = new Date()) {
  const compliance = complianceFor(customer, documents, now);
  const blockers = [];

  if (!customer) blockers.push("The placement is not linked to a customer record.");
  else if (compliance.blocked) blockers.push(`KYC was rejected for ${fullName(customer)}.`);
  else if (requireKyc && !compliance.cleared) {
    blockers.push(
      compliance.status.key !== "verified"
        ? `${fullName(customer)} is not KYC verified.`
        : `${fullName(customer)}'s file is incomplete: ${compliance.gaps.slice(0, 3).join(", ")}.`
    );
  }

  return { blockers, compliance, clear: blockers.length === 0 };
}

export function complianceSummary(customers = [], documentsByCustomer = new Map(), now = new Date()) {
  const summary = { total: customers.length, verified: 0, inReview: 0, unverified: 0, rejected: 0, highRisk: 0, pep: 0, complete: 0 };

  for (const customer of customers) {
    const documents = documentsByCustomer.get(String(customer.id)) || [];
    const compliance = complianceFor(customer, documents, now);

    if (compliance.status.key === "verified") summary.verified += 1;
    if (compliance.status.key === "in_review") summary.inReview += 1;
    if (compliance.status.key === "unverified") summary.unverified += 1;
    if (compliance.status.key === "rejected") summary.rejected += 1;
    if (compliance.risk.key === "high") summary.highRisk += 1;
    if (compliance.isPep) summary.pep += 1;
    if (compliance.fileComplete) summary.complete += 1;
  }

  summary.rate = customers.length ? (summary.verified / customers.length) * 100 : 0;
  return summary;
}

export function groupDocumentsByCustomer(documents = []) {
  const byCustomer = new Map();
  for (const document of documents) {
    const key = String(document.customer_id ?? "");
    if (!key) continue;
    const list = byCustomer.get(key);
    if (list) list.push(document);
    else byCustomer.set(key, [document]);
  }
  return byCustomer;
}
