import Link from "next/link";
import { NotebookPen, Plus } from "lucide-react";

import { sendMessage } from "@/app/dashboard/actions";
import { MessageComposer } from "@/components/dashboard/message-composer";
import { Avatar, EmptyState, PageHeader, Panel, PanelHeader, StatusPill, buttonStyles } from "@/components/dashboard/ui";
import { loadBook } from "@/lib/dashboard-data";
import { fullName, relativeTime } from "@/lib/format";
import { listThreads } from "@/lib/messaging";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const supabase = createSupabaseServerClient();
  const [{ threads, missing }, { customers }] = await Promise.all([
    listThreads(supabase, { channel: "note" }),
    loadBook(),
  ]);
  const byId = new Map(customers.map((customer) => [String(customer.id), customer]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Private workspace"
        title="Notes"
        description="Private notes for the team, kept separate from customer email conversations."
      />

      {missing ? (
        <Panel><p className="px-5 py-5 text-sm text-[var(--dash-ink-2)]">Apply the messaging migration to enable notes.</p></Panel>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
          <Panel>
            <PanelHeader title="Note board" description={`${threads.length} private note thread${threads.length === 1 ? "" : "s"}`} />
            {threads.length ? (
              <ul className="divide-y divide-[var(--dash-line)]">
                {threads.map((thread) => {
                  const customer = byId.get(String(thread.customer_id));
                  return (
                    <li key={thread.uuid}>
                      <Link href={`/dashboard/messages/${thread.uuid}`} className="flex items-start gap-4 px-5 py-4 transition hover:bg-[var(--dash-page)]">
                        <Avatar customer={customer} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium text-[var(--dash-ink)]">{fullName(customer)}</p>
                            <StatusPill status="open" label="Private" />
                          </div>
                          <p className="mt-0.5 truncate text-sm text-[var(--dash-ink-2)]">{thread.subject}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-[var(--dash-muted)]">{thread.last_preview || "No notes yet"}</p>
                        </div>
                        <span className="shrink-0 text-xs text-[var(--dash-muted)]">{relativeTime(thread.last_message_at)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState icon={NotebookPen} title="No notes yet" description="Create a private note for a customer to start the board." />
            )}
          </Panel>

          <Panel>
            <PanelHeader title="New note" description="Only your team can see this." action={<Plus className="size-4 text-[var(--dash-muted)]" />} />
            <MessageComposer action={sendMessage} customers={customers} fixedChannel="note" defaultSubject="Internal note" compact />
          </Panel>
        </div>
      )}
    </div>
  );
}
