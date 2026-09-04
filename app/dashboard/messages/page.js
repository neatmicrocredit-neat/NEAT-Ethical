import Link from "next/link";
import { Inbox, PenLine } from "lucide-react";
import { RefreshCw } from "lucide-react";
import { syncReceivedMessages } from "@/app/dashboard/actions";

import { loadBook } from "@/lib/dashboard-data";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { listThreads } from "@/lib/messaging";
import { fullName, relativeTime } from "@/lib/format";
import { Avatar, EmptyState, MessagingSetupNotice, PageHeader, Panel, StatCard, StatusPill, buttonStyles } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = createSupabaseServerClient();
  const [{ threads, missing }, { customers }] = await Promise.all([listThreads(supabase, { channel: "email" }), loadBook()]);

  const byId = new Map(customers.map((customer) => [String(customer.id), customer]));
  const open = threads.filter((thread) => thread.status !== "closed");
  const awaiting = threads.filter((thread) => thread.status === "awaiting");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Communication"
        title="Messages"
        description="Email conversations with customers. Internal notes live on the notes board."
        actions={
          <div className="flex flex-wrap gap-2">
            <form action={syncReceivedMessages}>
              <button type="submit" className={buttonStyles.secondary} title="Sync replies from Resend" aria-label="Sync replies from Resend">
                <RefreshCw className="size-4" />
                Sync replies
              </button>
            </form>
            <Link href="/dashboard/messages/new" className={buttonStyles.primary}>
              <PenLine className="size-4" />
              New message
            </Link>
          </div>
        }
      />

      {missing ? (
        <Panel>
          <MessagingSetupNotice />
        </Panel>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Open conversations" value={open.length.toLocaleString()} hint="Not yet closed" />
            <StatCard
              label="Awaiting customer reply"
              value={awaiting.length.toLocaleString()}
              hint="You sent the last message"
              tone={awaiting.length ? "pending" : undefined}
            />
            <StatCard label="All conversations" value={threads.length.toLocaleString()} hint="Including closed threads" />
          </div>

          <Panel>
            {threads.length ? (
              <ul className="divide-y divide-[var(--dash-line)]">
                {threads.map((thread) => {
                  const customer = byId.get(String(thread.customer_id));
                  return (
                    <li key={thread.uuid}>
                      <Link
                        href={`/dashboard/messages/${thread.uuid}`}
                        className="flex items-start gap-4 px-5 py-4 transition hover:bg-[var(--dash-page)]"
                      >
                        <Avatar customer={customer} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium text-[var(--dash-ink)]">{fullName(customer)}</p>
                            <StatusPill status={thread.status} />
                          </div>
                          <p className="mt-0.5 truncate text-sm text-[var(--dash-ink-2)]">{thread.subject}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-[var(--dash-muted)]">
                            {thread.last_preview || "No messages yet"}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-[var(--dash-muted)]">{relativeTime(thread.last_message_at)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={Inbox}
                title="No conversations yet"
                description="Start one from a customer's page, or compose a new message."
                action={
                  <Link href="/dashboard/messages/new" className={buttonStyles.primary}>
                    <PenLine className="size-4" />
                    New message
                  </Link>
                }
              />
            )}
          </Panel>

          <p className="text-center text-xs text-[var(--dash-muted)]">Outbound email is delivered through Resend.</p>
        </>
      )}
    </div>
  );
}
