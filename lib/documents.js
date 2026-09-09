import { cache } from "react";

import { createSupabaseServerClient, isMissingTable } from "@/lib/supabase-server";
import { toDate } from "@/lib/format";

export const DOCUMENTS_TABLE = "documents";

export const DOCUMENT_KINDS = {
  id_card: { key: "id_card", label: "Identity document", note: "Passport, driver's licence, NIN or voter card." },
  proof_of_address: { key: "proof_of_address", label: "Proof of address", note: "Utility bill or bank statement." },
  mandate: { key: "mandate", label: "Signed mandate", note: "The customer's instruction to place capital." },
  certificate: { key: "certificate", label: "Investment certificate", note: "Issued once a placement is funded." },
  statement: { key: "statement", label: "Statement", note: "Periodic account statement." },
  bank_proof: { key: "bank_proof", label: "Bank confirmation", note: "Proof the payout account belongs to the customer." },
  other: { key: "other", label: "Other", note: "Anything else worth keeping on file." },
};

export const DOCUMENT_KIND_KEYS = Object.keys(DOCUMENT_KINDS);

export const DOCUMENT_STATUSES = {
  pending: { key: "pending", label: "Awaiting review", tone: "pending" },
  verified: { key: "verified", label: "Verified", tone: "active" },
  rejected: { key: "rejected", label: "Rejected", tone: "rejected" },
  expired: { key: "expired", label: "Expired", tone: "matured" },
};

/** KYC needs these three on file and verified before a placement is approved. */
export const REQUIRED_KYC_KINDS = ["id_card", "proof_of_address", "mandate"];

const COLUMNS =
  "id, uuid, customer_id, investment_id, kind, title, file_url, mime_type, size_bytes, status, expires_on, reviewed_by, reviewed_at, note, uploaded_by, created_at";

/**
 * A document whose expiry has passed reads as `expired` even if nobody has
 * re-reviewed it, so a stale passport never sits on screen marked "verified".
 */
export function effectiveStatus(document, now = new Date()) {
  const expiry = toDate(document?.expires_on);
  if (expiry && expiry < now && document?.status === "verified") return "expired";
  return document?.status || "pending";
}

export const loadDocuments = cache(async ({ limit = 2000 } = {}) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(DOCUMENTS_TABLE)
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTable(error)) return { documents: [], missing: true, error: null };
    console.error("Failed to load documents:", error);
    return { documents: [], missing: false, error };
  }
  return { documents: data || [], missing: false, error: null };
});

export const loadDocumentsForCustomer = cache(async (customerId) => {
  if (!customerId) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(DOCUMENTS_TABLE)
    .select(COLUMNS)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error && !isMissingTable(error)) console.error("Failed to load customer documents:", error);
  return data || [];
});

export const loadDocumentsForInvestment = cache(async (investmentId) => {
  if (!investmentId) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(DOCUMENTS_TABLE)
    .select(COLUMNS)
    .eq("investment_id", investmentId)
    .order("created_at", { ascending: false });
  if (error && !isMissingTable(error)) console.error("Failed to load placement documents:", error);
  return data || [];
});

/**
 * Which of the required KYC documents a customer still owes.
 *
 * Only a *verified* document counts — one sitting in review is progress, not
 * compliance, and the distinction is exactly what the approvals gate turns on.
 */
export function kycChecklist(documents = [], now = new Date()) {
  const verified = new Set(
    documents.filter((doc) => effectiveStatus(doc, now) === "verified").map((doc) => doc.kind)
  );
  const items = REQUIRED_KYC_KINDS.map((kind) => ({
    kind,
    label: DOCUMENT_KINDS[kind].label,
    satisfied: verified.has(kind),
  }));
  const satisfied = items.filter((item) => item.satisfied).length;

  return {
    items,
    satisfied,
    total: items.length,
    complete: satisfied === items.length,
    missing: items.filter((item) => !item.satisfied).map((item) => item.label),
  };
}

export function documentSummary(documents = [], now = new Date()) {
  const summary = { total: documents.length, pending: 0, verified: 0, rejected: 0, expired: 0, expiringSoon: 0 };
  const soon = new Date(now.getTime() + 30 * 24 * 3600e3);

  for (const document of documents) {
    const status = effectiveStatus(document, now);
    summary[status] = (summary[status] || 0) + 1;
    const expiry = toDate(document.expires_on);
    if (status === "verified" && expiry && expiry <= soon) summary.expiringSoon += 1;
  }
  return summary;
}
