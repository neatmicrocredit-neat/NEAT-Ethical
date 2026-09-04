import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { sendMessage } from "@/app/dashboard/actions";
import { loadCustomerById, loadCustomerOptions } from "@/lib/dashboard-data";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { listThreads } from "@/lib/messaging";
import { fullName } from "@/lib/format";
import { MessageComposer } from "@/components/dashboard/message-composer";
import { Avatar, MessagingSetupNotice, PageHeader, Panel, PanelHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function NewMessagePage({ searchParams }) {
  const { customer } = await searchParams;

  // A cheap probe: if the tables are absent, say so rather than rendering a
  // composer that cannot save.
  const { missing } = await listThreads(createSupabaseServerClient(), { limit: 1 });
  if (missing) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Communication" title="New message" />
        <Panel>
          <MessagingSetupNotice />
        </Panel>
      </div>
    );
  }

  const preset = customer ? await loadCustomerById(customer) : null;
  const customers = preset ? null : await loadCustomerOptions();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/messages"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-ink-2)] transition hover:text-[var(--dash-ink)]"
      >
        <ArrowLeft className="size-4" />
        Back to messages
      </Link>

      <PageHeader
        eyebrow="Communication"
        title="New message"
        description="Opens a conversation with the customer, or adds to their existing open thread."
      />

      <Panel className="mx-auto w-full max-w-2xl">
        {preset ? (
          <PanelHeader
            title={fullName(preset)}
            description={preset.email}
            action={<Avatar customer={preset} size="sm" />}
          />
        ) : (
          <PanelHeader title="Compose" description="Pick a recipient, then write your message." />
        )}
        <MessageComposer
          action={sendMessage}
          customerId={preset?.id}
          customerName={preset?.first_name}
          customers={customers}
          defaultSubject="Your NEAT portfolio"
          redirectToThread
        />
      </Panel>
    </div>
  );
}
