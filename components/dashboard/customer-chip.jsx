"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, Mail, Phone } from "lucide-react";

import { fullName, money, shortDate } from "@/lib/format";
import { Avatar, Field, buttonStyles } from "@/components/dashboard/ui";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/**
 * Identifies the customer a thread belongs to. Hovering previews their
 * profile inline; clicking opens the full profile in a right-hand sheet so
 * the conversation never has to leave the page.
 */
export function CustomerChip({ customer, summary }) {
  const [open, setOpen] = useState(false);

  if (!customer) {
    return <span className="text-sm text-[var(--dash-ink-2)]">Unknown customer</span>;
  }

  return (
    <>
      <HoverCard openDelay={200} closeDelay={80}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--dash-line)] bg-[var(--dash-page)] py-1 pl-1 pr-2.5 text-left transition hover:bg-[var(--dash-accent-soft)]"
          >
            <Avatar customer={customer} size="sm" />
            <span className="min-w-0 truncate text-sm font-medium text-[var(--dash-ink)]">{fullName(customer)}</span>
            <ChevronDown className="size-3.5 shrink-0 text-[var(--dash-muted)]" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="rounded-2xl border-[var(--dash-line)] bg-[var(--dash-surface)] p-4 text-[var(--dash-ink)] shadow-lg">
          <div className="flex items-center gap-3">
            <Avatar customer={customer} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--dash-ink)]">{fullName(customer)}</p>
              <p className="truncate text-xs text-[var(--dash-muted)]">Customer since {shortDate(customer.created_at)}</p>
            </div>
          </div>
          <dl className="mt-4 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-[var(--dash-ink-2)]">
              <Mail className="size-3.5 shrink-0 text-[var(--dash-muted)]" />
              <span className="truncate">{customer.email || "No email on file"}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--dash-ink-2)]">
              <Phone className="size-3.5 shrink-0 text-[var(--dash-muted)]" />
              <span className="truncate">{customer.phone_number || "No phone on file"}</span>
            </div>
          </dl>
          {summary ? (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--dash-line)] pt-3">
              <Field label="Capital placed" value={money(summary.principal)} />
              <Field label="Placements" value={String(summary.count)} />
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg bg-[var(--dash-page)] px-3 py-1.5 text-xs font-medium text-[var(--dash-accent)] transition hover:bg-[var(--dash-accent-soft)]"
          >
            View full profile
            <ChevronRight className="size-3.5" />
          </button>
        </HoverCardContent>
      </HoverCard>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="border-[var(--dash-line)] bg-[var(--dash-surface)] text-[var(--dash-ink)]">
          <SheetHeader>
            <SheetTitle className="text-[var(--dash-ink)] normal-case tracking-normal">Customer</SheetTitle>
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-8 pb-8">
            <div className="flex items-center gap-3">
              <Avatar customer={customer} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-[var(--dash-ink)]">{fullName(customer)}</p>
                <p className="truncate text-xs text-[var(--dash-muted)]">
                  Customer since {shortDate(customer.created_at)}
                  {customer.neat_customer_id ? ` · ${customer.neat_customer_id}` : ""}
                </p>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" value={customer.email} className="sm:col-span-2" />
              <Field label="Phone" value={customer.phone_number} />
              <Field label="State" value={customer.state} />
            </dl>

            {summary ? (
              <dl className="grid gap-4 border-t border-[var(--dash-line)] pt-5 sm:grid-cols-2">
                <Field label="Placements" value={String(summary.count)} />
                <Field label="Capital placed" value={money(summary.principal)} />
                <Field label="Under management" value={money(summary.underManagement)} />
                <Field label="Profit still owed" value={money(summary.outstandingProfit)} />
              </dl>
            ) : null}

            <div className="flex flex-wrap gap-2 border-t border-[var(--dash-line)] pt-5">
              <Link href={`/dashboard/customers/${customer.uuid}`} className={buttonStyles.primary}>
                View full profile
              </Link>
              <SheetClose className={buttonStyles.secondary}>Close</SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
