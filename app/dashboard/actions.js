"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { VEHICLES } from "@/lib/investments";
import { appendMessage, dispatchMessage, ensureThread, setThreadStatus } from "@/lib/messaging";
import sanitizeHtml from "sanitize-html";
import { cleanReceivedText, getReceivedEmail, listReceivedEmails, plainTextToHtml } from "@/lib/email";

const ok = (message, extra = {}) => ({ ok: true, error: null, message, ...extra });
const fail = (error) => ({ ok: false, error, message: null });

function text(formData, field) {
  const value = formData.get(field);
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

function number(formData, field) {
  const raw = text(formData, field);
  if (raw === null) return null;
  const parsed = Number(String(raw).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

async function getEmailAttachments(formData) {
  const files = formData.getAll("attachments").filter((file) => file instanceof File && file.size > 0);
  const totalSize = files.reduce((total, file) => total + file.size, 0);
  if (files.some((file) => file.size > 10 * 1024 * 1024) || totalSize > 25 * 1024 * 1024) {
    throw new Error("Attachments must be no larger than 10 MB each or 25 MB in total.");
  }
  return Promise.all(files.map(async (file) => ({
    filename: file.name,
    content: Buffer.from(await file.arrayBuffer()),
  })));
}

/** Collect the investment fields shared by create and update. */
function investmentPayload(formData) {
  const amount = number(formData, "amount");
  const startDate = text(formData, "start_date");
  const endDate = text(formData, "end_date");
  const vehicle = text(formData, "vehicle");
  const schedule = text(formData, "payout_schedule");

  const errors = [];
  if (!amount || amount <= 0) errors.push("Enter an amount greater than zero.");
  if (!startDate) errors.push("A start date is required.");
  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    errors.push("The end date must fall after the start date.");
  }
  if (vehicle && !VEHICLES[vehicle]) errors.push("Choose a valid investment vehicle.");

  return {
    errors,
    payload: {
      amount,
      start_date: startDate,
      end_date: endDate,
      vehicle: vehicle || "ethical",
      payout_schedule: schedule === "maturity" ? "maturity" : "monthly",
      rollover: formData.get("rollover") === "on" || formData.get("rollover") === "true",
      payout_bank_name: text(formData, "payout_bank_name"),
      payout_account_name: text(formData, "payout_account_name"),
      payout_account_number: text(formData, "payout_account_number"),
      other_instructions: text(formData, "other_instructions"),
    },
  };
}

export async function createInvestment(_prevState, formData) {
  try {
    await requireAdmin();
  } catch (error) {
    return fail(error.message);
  }

  const customerId = number(formData, "customer_id");
  if (!customerId) return fail("Select the customer this placement belongs to.");

  const { errors, payload } = investmentPayload(formData);
  if (errors.length) return fail(errors[0]);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("investments")
    .insert({ ...payload, customer_id: customerId })
    .select("uuid")
    .single();

  if (error) return fail(`Could not create the placement: ${error.message}`);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard/customers");
  redirect(`/dashboard/investments/${data.uuid}`);
}

export async function updateInvestment(_prevState, formData) {
  try {
    await requireAdmin();
  } catch (error) {
    return fail(error.message);
  }

  const uuid = text(formData, "uuid");
  if (!uuid) return fail("Missing the placement reference.");

  const { errors, payload } = investmentPayload(formData);
  if (errors.length) return fail(errors[0]);

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("investments").update(payload).eq("uuid", uuid);
  if (error) return fail(`Could not save the placement: ${error.message}`);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/investments");
  revalidatePath(`/dashboard/investments/${uuid}`);
  revalidatePath("/dashboard/customers");
  return ok("Placement updated.");
}

export async function deleteInvestment(formData) {
  await requireAdmin();

  const uuid = String(formData.get("uuid") || "");
  if (!uuid) return;

  const supabase = createSupabaseServerClient();
  await supabase.from("investments").delete().eq("uuid", uuid);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard/customers");
  redirect("/dashboard/investments");
}

const CUSTOMER_FIELDS = [
  "first_name",
  "last_name",
  "other_names",
  "email",
  "phone_number",
  "gender",
  "date_of_birth",
  "id_type",
  "id_number",
  "address",
  "state",
  "lga",
  "nok_name",
  "nok_relationship",
  "nok_gender",
  "nok_phone_number",
  "nok_address",
  "neat_customer_id",
];

export async function updateCustomer(_prevState, formData) {
  try {
    await requireAdmin();
  } catch (error) {
    return fail(error.message);
  }

  const uuid = text(formData, "uuid");
  if (!uuid) return fail("Missing the customer reference.");

  const payload = Object.fromEntries(CUSTOMER_FIELDS.map((field) => [field, text(formData, field)]));
  if (!payload.first_name || !payload.last_name) return fail("First and last name are required.");
  if (!payload.email) return fail("An email address is required.");
  if (!payload.phone_number) return fail("A phone number is required.");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("customers").update(payload).eq("uuid", uuid);
  if (error) return fail(`Could not save the customer: ${error.message}`);

  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${uuid}`);
  return ok("Customer details updated.");
}

/* --------------------------------------------------------------- messaging */

export async function sendMessage(_prevState, formData) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    return fail(error.message);
  }

  const body = text(formData, "body");
  if (!body) return fail("Write a message before sending.");
  const bodyHtml = sanitizeHtml(text(formData, "body_html") || "", {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote"],
    allowedAttributes: {},
  });

  const supabase = createSupabaseServerClient();
  const channel = text(formData, "channel") === "note" ? "note" : "email";
  let attachments = [];
  if (channel === "email") {
    try {
      attachments = await getEmailAttachments(formData);
    } catch (error) {
      return fail(error.message);
    }
  }

  let threadId = number(formData, "thread_id");
  let threadUuid = text(formData, "thread_uuid");

  if (!threadId) {
    const customerId = number(formData, "customer_id");
    if (!customerId) return fail("Select the customer to message.");

    const { thread, error } = await ensureThread(supabase, {
      customerId,
      subject: text(formData, "subject") || "Conversation",
      channel,
    });
    if (error || !thread) return fail(`Could not open the conversation: ${error?.message || "unknown error"}`);
    threadId = thread.id;
    threadUuid = thread.uuid;
  }

  const { message, error } = await appendMessage(supabase, {
    threadId,
    body,
    bodyHtml,
    author: admin.email || "Admin",
    channel,
  });
  if (error) return fail(`Could not save the message: ${error.message}`);

  if (channel === "email") {
    const { data: thread } = await supabase
      .from("message_threads")
      .select("customer_id, subject")
      .eq("id", threadId)
      .maybeSingle();
    const customerId = Number(formData.get("customer_id")) || thread?.customer_id;
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("email")
      .eq("id", customerId || 0)
      .maybeSingle();
    if (customerError || !customer?.email) {
      await supabase.from("messages").update({ delivery_status: "failed", error: "Customer email address not found." }).eq("id", message.id);
      return fail("Could not find the customer's email address.");
    }

    const delivery = await dispatchMessage(supabase, {
      messageId: message.id,
      recipient: customer.email,
      subject: thread?.subject,
      body,
      html: bodyHtml,
      attachments,
    });
    if (delivery.status === "failed") return fail("Message saved, but Resend could not deliver it.");
  }

  revalidatePath("/dashboard/messages");
  if (threadUuid) revalidatePath(`/dashboard/messages/${threadUuid}`);

  if (formData.get("redirect_to_thread") === "true" && threadUuid) {
    redirect(`/dashboard/messages/${threadUuid}`);
  }

  return ok(
    channel === "note"
      ? "Note saved to the conversation."
      : "Message sent."
  );
}

export async function resendMessage(_prevState, formData) {
  try {
    await requireAdmin();
  } catch (error) {
    return fail(error.message);
  }

  const messageId = number(formData, "message_id");
  if (!messageId) return fail("Missing the message reference.");

  const supabase = createSupabaseServerClient();
  const { data: message, error: messageError } = await supabase
    .from("messages")
    .select("id, thread_id, body, body_html, direction, delivery_status")
    .eq("id", messageId)
    .maybeSingle();
  if (messageError || !message) return fail("Could not find the message.");
  if (message.direction !== "outbound" || !["queued", "failed"].includes(message.delivery_status)) {
    return fail("Only queued or failed email messages can be resent.");
  }

  const { data: thread } = await supabase
    .from("message_threads")
    .select("customer_id, subject")
    .eq("id", message.thread_id)
    .maybeSingle();
  const { data: customer } = await supabase
    .from("customers")
    .select("email")
    .eq("id", thread?.customer_id || 0)
    .maybeSingle();
  if (!customer?.email) return fail("Could not find the customer's email address.");

  const delivery = await dispatchMessage(supabase, {
    messageId,
    recipient: customer.email,
    subject: thread?.subject,
    body: message.body,
    html: message.body_html,
  });
  if (delivery.status === "failed") return fail("Resend could not deliver the message.");

  revalidatePath("/dashboard/messages");
  const threadUuid = text(formData, "thread_uuid");
  if (threadUuid) revalidatePath(`/dashboard/messages/${threadUuid}`);
  return ok("Message sent.");
}

function emailAddress(value) {
  const match = String(value || "").match(/<([^>]+)>/);
  return (match ? match[1] : String(value || "")).trim().toLowerCase();
}

function emailSubject(value) {
  return String(value || "Conversation").replace(/^(re|fw|fwd):\s*/i, "").trim() || "Conversation";
}

export async function syncReceivedMessages() {
  try {
    await requireAdmin();
  } catch (error) {
    return fail(error.message);
  }

  const supabase = createSupabaseServerClient();
  try {
    const received = await listReceivedEmails();
    let imported = 0;

    for (const summary of received) {
      const { data: existing } = await supabase
        .from("messages")
        .select("id")
        .eq("provider", "resend")
        .eq("provider_message_id", summary.id)
        .maybeSingle();
      if (existing) continue;

      const customerEmail = emailAddress(summary.from);
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", customerEmail)
        .maybeSingle();
      if (!customer) continue;

      const { data: thread, error: threadError } = await supabase
        .from("message_threads")
        .select("id")
        .eq("customer_id", customer.id)
        .eq("channel", "email")
        .neq("status", "closed")
        .order("last_message_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (threadError) throw threadError;

      let threadId = thread?.id;
      if (!threadId) {
        const created = await ensureThread(supabase, {
          customerId: customer.id,
          subject: emailSubject(summary.subject),
          channel: "email",
        });
        if (created.error || !created.thread) throw created.error || new Error("Could not create email thread.");
        threadId = created.thread.id;
      }

      const email = await getReceivedEmail(summary.id);
      const body = cleanReceivedText(email.text || email.html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
      if (!body) continue;
      const { error } = await supabase.from("messages").insert({
        thread_id: threadId,
        direction: "inbound",
        author: customerEmail,
        body,
        body_html: plainTextToHtml(body),
        delivery_status: "sent",
        provider: "resend",
        provider_message_id: summary.id,
        sent_at: email.created_at || summary.created_at || new Date().toISOString(),
      });
      if (error) throw error;
      imported += 1;
    }

    revalidatePath("/dashboard/messages");
    return ok(imported ? `Imported ${imported} new repl${imported === 1 ? "y" : "ies"}.` : "No new replies found.");
  } catch (error) {
    return fail(error.message || "Could not sync received emails.");
  }
}

export async function updateThreadStatus(formData) {
  await requireAdmin();

  const threadId = Number(formData.get("thread_id"));
  const status = String(formData.get("status") || "open");
  if (!threadId) return;

  const supabase = createSupabaseServerClient();
  await setThreadStatus(supabase, threadId, status);

  revalidatePath("/dashboard/messages");
  const uuid = formData.get("thread_uuid");
  if (uuid) revalidatePath(`/dashboard/messages/${uuid}`);
}
