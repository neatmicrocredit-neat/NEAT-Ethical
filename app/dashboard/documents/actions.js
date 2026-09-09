"use server";

import { revalidatePath } from "next/cache";

import { requireCapability } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { DOCUMENT_KINDS, DOCUMENT_STATUSES } from "@/lib/documents";
import { choice, date, fail, integer, ok, text } from "@/lib/form";
import { uploadDocument } from "@/lib/storage";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function revalidateDocuments(customerUuid, investmentUuid) {
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/compliance");
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard/customers");
  if (customerUuid) revalidatePath(`/dashboard/customers/${customerUuid}`);
  if (investmentUuid) revalidatePath(`/dashboard/investments/${investmentUuid}`);
}

export async function uploadCustomerDocument(_prevState, formData) {
  let member;
  try {
    member = await requireCapability("documents.write");
  } catch (error) {
    return fail(error.message);
  }

  const customerId = integer(formData, "customer_id");
  const investmentId = integer(formData, "investment_id");
  if (!customerId && !investmentId) return fail("Attach the document to a customer or a placement.");

  const kind = choice(formData, "kind", DOCUMENT_KINDS, "other");
  const title = text(formData, "title") || DOCUMENT_KINDS[kind].label;
  const file = formData.get("file");
  const linkedUrl = text(formData, "file_url");

  // A document is either uploaded here or already lives somewhere addressable —
  // recording one with neither leaves a row nobody can act on.
  if ((!file || typeof file === "string" || file.size === 0) && !linkedUrl) {
    return fail("Choose a file to upload, or paste a link to one.");
  }

  let stored = null;
  try {
    stored = await uploadDocument(file, `documents/${customerId || "placement"}-${investmentId || "general"}`);
  } catch (error) {
    return fail(error.message);
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      customer_id: customerId,
      investment_id: investmentId,
      kind,
      title,
      file_url: stored?.url || linkedUrl,
      mime_type: stored?.mimeType || null,
      size_bytes: stored?.size || null,
      status: "pending",
      expires_on: date(formData, "expires_on"),
      note: text(formData, "note"),
      uploaded_by: member.email,
    })
    .select("id")
    .single();

  if (error) return fail(`Could not save the document: ${error.message}`);

  await recordAudit({
    actor: member.email,
    action: "create",
    entity: "document",
    entityId: data.id,
    entityLabel: title,
    summary: `Uploaded a ${DOCUMENT_KINDS[kind].label.toLowerCase()}.`,
  });

  revalidateDocuments(text(formData, "customer_uuid"), text(formData, "investment_uuid"));
  return ok("Document saved and queued for review.");
}

/**
 * Verify or reject a document. Separate capability from uploading one, because
 * the person who collects a file should not be the only check on it.
 */
export async function reviewDocument(formData) {
  const member = await requireCapability("documents.verify");

  const uuid = String(formData.get("uuid") || "");
  const status = String(formData.get("status") || "");
  if (!uuid || !DOCUMENT_STATUSES[status]) return;

  const supabase = createSupabaseServerClient();
  const { data: previous } = await supabase.from("documents").select("id, title, status").eq("uuid", uuid).maybeSingle();
  if (!previous) return;

  await supabase
    .from("documents")
    .update({
      status,
      reviewed_by: member.email,
      reviewed_at: new Date().toISOString(),
      note: String(formData.get("note") || "").trim() || null,
    })
    .eq("uuid", uuid);

  await recordAudit({
    actor: member.email,
    action: status === "verified" ? "verify" : "update",
    entity: "document",
    entityId: previous.id,
    entityLabel: previous.title,
    summary: `Marked ${DOCUMENT_STATUSES[status].label.toLowerCase()}.`,
    changes: { status: { from: previous.status, to: status } },
  });

  revalidateDocuments(String(formData.get("customer_uuid") || ""), String(formData.get("investment_uuid") || ""));
}

export async function deleteDocument(formData) {
  const member = await requireCapability("documents.write");

  const uuid = String(formData.get("uuid") || "");
  if (!uuid) return;

  const supabase = createSupabaseServerClient();
  const { data: previous } = await supabase.from("documents").select("id, title").eq("uuid", uuid).maybeSingle();
  await supabase.from("documents").delete().eq("uuid", uuid);

  if (previous) {
    await recordAudit({
      actor: member.email,
      action: "delete",
      entity: "document",
      entityId: previous.id,
      entityLabel: previous.title,
      summary: "Document removed from the vault.",
    });
  }

  revalidateDocuments(String(formData.get("customer_uuid") || ""), String(formData.get("investment_uuid") || ""));
}
