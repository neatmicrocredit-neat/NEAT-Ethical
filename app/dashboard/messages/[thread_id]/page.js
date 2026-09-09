import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCheck, Clock, RotateCcw, StickyNote } from "lucide-react";

import { resendMessage, sendMessage, updateThreadStatus } from "@/app/dashboard/actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getThread } from "@/lib/messaging";
import { loadCustomerById, loadInvestmentsForCustomer } from "@/lib/dashboard-data";
import { dateTime, fullName, relativeTime } from "@/lib/format";
import { summarizeBook } from "@/lib/investments";
import { CustomerChip } from "@/components/dashboard/customer-chip";
import { MessageComposer } from "@/components/dashboard/message-composer";
import { ResendMessageButton } from "@/components/dashboard/resend-message-button";
import sanitizeHtml from "sanitize-html";
import { cleanReceivedText } from "@/lib/email";
import { MessagingSetupNotice, Panel, StatusPill, buttonStyles } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function ThreadPage({ params }) {
  const { thread_id } = await params;
  const supabase = createSupabaseServerClient();
  const { thread, messages, missing } = await getThread(supabase, thread_id);

  if (missing) {
    return (
      <Panel>
        <MessagingSetupNotice />
      </Panel>
    );
  }
  if (!thread) notFound();

  const customer = await loadCustomerById(thread.customer_id);
  const investments = customer ? await loadInvestmentsForCustomer(customer.id) : [];
  const summary = summarizeBook(investments);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/messages"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-ink-2)] transition hover:text-[var(--dash-ink)]"
      >
        <ArrowLeft className="size-4" />
        Back to messages
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dash-muted)]">Conversation</p>
            <StatusPill status={thread.status} />
          </div>
          <h1 className="mt-1.5 break-words text-2xl font-semibold tracking-tight text-[var(--dash-ink)]">{thread.subject}</h1>
          <p className="mt-1 text-sm text-[var(--dash-ink-2)]">Started {relativeTime(thread.created_at)}</p>
        </div>

        <form action={updateThreadStatus}>
          <input type="hidden" name="thread_id" value={thread.id} />
          <input type="hidden" name="thread_uuid" value={thread.uuid} />
          <input type="hidden" name="status" value={thread.status === "closed" ? "open" : "closed"} />
          <button type="submit" className={buttonStyles.secondary}>
            {thread.status === "closed" ? <RotateCcw className="size-4" /> : <CheckCheck className="size-4" />}
            {thread.status === "closed" ? "Reopen" : "Mark resolved"}
          </button>
        </form>
      </header>

      {/* Thread, composer and the customer's identity all live in one card —
          the chip below opens the full profile without leaving the conversation. */}
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--dash-line)] px-5 py-4">
          <CustomerChip customer={customer} summary={summary} />
          <p className="text-xs text-[var(--dash-muted)]">
            {messages.length} message{messages.length === 1 ? "" : "s"}
          </p>
        </div>

        <ol className="max-h-[min(60vh,36rem)] space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((message) => (
            <MessageBubble key={message.uuid || message.id} message={message} customer={customer} threadUuid={thread.uuid} />
          ))}
          {!messages.length ? <p className="text-sm text-[var(--dash-ink-2)]">Nothing sent yet.</p> : null}
        </ol>

        <div className="border-t border-[var(--dash-line)]">
          <p className="px-5 pt-4 text-xs font-semibold text-[var(--dash-ink)]">{thread.channel === "note" ? "Add note" : "Reply"}</p>
          <MessageComposer action={sendMessage} thread={thread} customerName={customer?.first_name} fixedChannel={thread.channel === "note" ? "note" : undefined} />
        </div>

        <div className="flex flex-wrap items-start gap-4 border-t border-[var(--dash-line)] px-5 py-3 text-xs text-[var(--dash-muted)]">
          <span className="flex items-start gap-1.5">
            <Clock className="mt-0.5 size-3.5 shrink-0" />
            Delivered through Resend
          </span>
          {thread.channel === "note" ? (
            <span className="flex items-start gap-1.5">
              <StickyNote className="mt-0.5 size-3.5 shrink-0" />
              Private note — never sent to the customer
            </span>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

function MessageBubble({ message, customer, threadUuid }) {
  const inbound = message.direction === "inbound";

  return (
    <li className={inbound ? "flex justify-start" : "flex justify-end"}>
      <div className={`min-w-0 max-w-[85%] rounded-2xl px-4 py-3 ${inbound ? "bg-[var(--dash-page)]" : "bg-[var(--dash-accent-soft)]"}`}>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--dash-muted)]">
          <span className="font-medium text-[var(--dash-ink-2)]">
            {inbound ? fullName(customer) : message.author || "Admin"}
          </span>
          <span>{dateTime(message.created_at)}</span>
          {!inbound ? <StatusPill status={message.delivery_status} /> : null}
          {!inbound && ["queued", "failed"].includes(message.delivery_status) ? (
            <ResendMessageButton action={resendMessage} messageId={message.id} threadUuid={threadUuid} status={message.delivery_status} />
          ) : null}
        </div>
        {inbound ? (
          <p className="message-content mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--dash-ink)]">{cleanReceivedText(message.body)}</p>
        ) : message.body_html ? (
          <div
            className="message-content mt-1.5 max-w-none break-words text-sm leading-relaxed text-[var(--dash-ink)]"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(message.body_html, {
                allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote"],
                allowedAttributes: {},
              }),
            }}
          />
        ) : (
          <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--dash-ink)]">{message.body}</p>
        )}
      </div>
    </li>
  );
}
