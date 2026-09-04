import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendCustomerMessage } from "@/lib/email";

export const THREADS_TABLE = "message_threads";
export const MESSAGES_TABLE = "messages";

export const CHANNELS = {
  email: { key: "email", label: "Email", note: "Delivered by Resend." },
  note: { key: "note", label: "Internal note", note: "Never leaves the console. Visible to staff only." },
};

export const THREAD_STATUSES = {
  open: "Open",
  awaiting: "Awaiting reply",
  closed: "Closed",
};

/**
 * The messaging tables ship as a migration (supabase/migrations/0001_messaging.sql)
 * that has to be applied to the project. Until it is, PostgREST answers with an
 * "undefined table" error — detect that so the UI can show a setup notice
 * instead of a crash.
 */
export function isMissingTable(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || message.includes("does not exist") || message.includes("could not find the table");
}

function fail(error) {
  if (isMissingTable(error)) return { missing: true, error: null };
  return { missing: false, error };
}

/** Inbox list, newest activity first, with the customer joined in. */
export async function listThreads(supabase = createSupabaseServerClient(), { limit = 100, status, channel } = {}) {
  let query = supabase
    .from(THREADS_TABLE)
    .select("id, uuid, customer_id, subject, channel, status, last_message_at, last_preview, created_at")
    .order("last_message_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (channel) query = query.eq("channel", channel);

  const { data, error } = await query;
  if (error) return { threads: [], ...fail(error) };
  return { threads: data || [], missing: false, error: null };
}

export async function getThread(supabase, uuid) {
  const { data: thread, error } = await supabase
    .from(THREADS_TABLE)
    .select("*")
    .eq("uuid", uuid)
    .maybeSingle();

  if (error) return { thread: null, messages: [], ...fail(error) };
  if (!thread) return { thread: null, messages: [], missing: false, error: null };

  const { data: messages, error: messagesError } = await supabase
    .from(MESSAGES_TABLE)
    .select("*")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true });

  if (messagesError) return { thread, messages: [], ...fail(messagesError) };
  return { thread, messages: messages || [], missing: false, error: null };
}

export async function getThreadsForCustomer(supabase, customerId, { channel } = {}) {
  let query = supabase
    .from(THREADS_TABLE)
    .select("id, uuid, subject, channel, status, last_message_at, last_preview")
    .eq("customer_id", customerId)
    .order("last_message_at", { ascending: false });
  if (channel) query = query.eq("channel", channel);
  const { data, error } = await query;

  if (error) return { threads: [], ...fail(error) };
  return { threads: data || [], missing: false, error: null };
}

/** Reuse the customer's open thread on this channel rather than fragmenting it. */
export async function ensureThread(supabase, { customerId, subject, channel = "email" }) {
  const { data: existing } = await supabase
    .from(THREADS_TABLE)
    .select("id, uuid")
    .eq("customer_id", customerId)
    .eq("channel", channel)
    .neq("status", "closed")
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return { thread: existing, error: null };

  const { data, error } = await supabase
    .from(THREADS_TABLE)
    .insert({ customer_id: customerId, subject: subject || "Conversation", channel })
    .select("id, uuid")
    .single();

  return { thread: data, error };
}

export async function appendMessage(supabase, { threadId, body, bodyHtml, direction = "outbound", author, channel = "email" }) {
  // Internal notes are never dispatched, so they are complete on write.
  const deliveryStatus = channel === "note" || direction === "inbound" ? "sent" : "queued";

  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .insert({
      thread_id: threadId,
      body,
      body_html: bodyHtml || null,
      direction,
      author: author || null,
      delivery_status: deliveryStatus,
      sent_at: deliveryStatus === "sent" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();

  return { message: data, error };
}

export async function setThreadStatus(supabase, threadId, status) {
  return supabase.from(THREADS_TABLE).update({ status }).eq("id", threadId);
}

export async function countAwaiting(supabase = createSupabaseServerClient()) {
  const { count, error } = await supabase
    .from(THREADS_TABLE)
    .select("id", { count: "exact", head: true })
    .neq("status", "closed");

  if (error) return 0;
  return count || 0;
}

export async function dispatchMessage(supabase, { messageId, recipient, subject, body, html, attachments = [] }) {
  try {
    const result = await sendCustomerMessage({ to: recipient, subject, body, html, attachments });
    const { error } = await supabase
      .from(MESSAGES_TABLE)
      .update({ delivery_status: "sent", provider: "resend", provider_message_id: result?.id || null, sent_at: new Date().toISOString(), error: null })
      .eq("id", messageId);
    if (error) throw error;
    return { configured: true, status: "sent", providerMessageId: result?.id || null };
  } catch (error) {
    await supabase
      .from(MESSAGES_TABLE)
      .update({ delivery_status: "failed", provider: "resend", error: error.message || "Email delivery failed" })
      .eq("id", messageId);
    return { configured: true, status: "failed", error };
  }
}
