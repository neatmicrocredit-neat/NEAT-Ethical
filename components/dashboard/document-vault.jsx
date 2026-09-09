"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { ExternalLink, FileText, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { relativeTime, shortDate } from "@/lib/format";
import { DOCUMENT_KINDS, DOCUMENT_STATUSES } from "@/lib/documents";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { EmptyState, StatusPill, buttonStyles } from "@/components/dashboard/ui";
import { FilterChips, Toolbar, downloadCsv } from "@/components/dashboard/table-kit";
import { Field, FormBanner, Select, inputClass, optionsFrom } from "@/components/dashboard/form-kit";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Awaiting review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

const KIND_OPTIONS = optionsFrom(DOCUMENT_KINDS);

/** Upload form plus the reviewable list. Used standalone and inside detail pages. */
export function DocumentVault({
  rows,
  uploadAction,
  reviewAction,
  deleteAction,
  canUpload,
  canVerify,
  customers = [],
  lockedCustomerId,
  lockedCustomerUuid,
  lockedInvestmentId,
  compact = false,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const counts = useMemo(() => {
    const tally = { all: rows.length, pending: 0, verified: 0, rejected: 0, expired: 0 };
    for (const row of rows) tally[row.status] = (tally[row.status] || 0) + 1;
    return tally;
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (!term) return true;
      return [row.title, row.customer, row.kindLabel, row.note].some((field) =>
        String(field || "").toLowerCase().includes(term)
      );
    });
  }, [rows, search, status]);

  const exportCsv = () =>
    downloadCsv(
      "documents.csv",
      ["Customer", "Title", "Kind", "Status", "Expires", "Uploaded", "Uploaded by", "Reviewed by", "Link"],
      filtered.map((row) => [
        row.customer,
        row.title,
        row.kindLabel,
        row.status,
        row.expiresOn || "",
        row.createdAt?.slice(0, 10) || "",
        row.uploadedBy || "",
        row.reviewedBy || "",
        row.fileUrl || "",
      ])
    );

  return (
    <div className="space-y-4">
      {canUpload ? (
        <UploadPanel
          action={uploadAction}
          customers={customers}
          lockedCustomerId={lockedCustomerId}
          lockedCustomerUuid={lockedCustomerUuid}
          lockedInvestmentId={lockedInvestmentId}
        />
      ) : null}

      <div className="rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]">
        {compact ? null : (
          <Toolbar search={search} onSearch={setSearch} placeholder="Search title, customer or note" onExport={exportCsv}>
            <FilterChips
              label="Status"
              options={FILTERS.map((filter) => ({ ...filter, count: counts[filter.value] }))}
              value={status}
              onChange={setStatus}
            />
          </Toolbar>
        )}

        {filtered.length ? (
          <ul className="divide-y divide-[var(--dash-line)]">
            {filtered.map((row) => (
              <DocumentRow
                key={row.uuid}
                row={row}
                reviewAction={reviewAction}
                deleteAction={deleteAction}
                canVerify={canVerify}
                canUpload={canUpload}
                showCustomer={!lockedCustomerId}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={FileText}
            title="No documents here yet"
            description={canUpload ? "Upload an identity document, mandate or statement to start the file." : "Nothing has been filed against this record."}
          />
        )}
      </div>
    </div>
  );
}

function UploadPanel({ action, customers, lockedCustomerId, lockedCustomerUuid, lockedInvestmentId }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--dash-surface)] px-5 py-4 ring-1 ring-[var(--dash-line)]">
        <p className="text-sm text-[var(--dash-ink-2)]">Add an identity document, mandate, certificate or statement to the vault.</p>
        <button type="button" onClick={() => setOpen(true)} className={buttonStyles.primary}>
          <Upload className="size-4" />
          Upload
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl bg-[var(--dash-surface)] p-5 ring-1 ring-[var(--dash-line)]">
      {lockedCustomerId ? <input type="hidden" name="customer_id" value={lockedCustomerId} /> : null}
      {lockedCustomerUuid ? <input type="hidden" name="customer_uuid" value={lockedCustomerUuid} /> : null}
      {lockedInvestmentId ? <input type="hidden" name="investment_id" value={lockedInvestmentId} /> : null}

      <FormBanner state={state} />

      <div className={cn("grid gap-4 sm:grid-cols-2", (state.error || state.message) && "mt-4")}>
        {!lockedCustomerId ? (
          <Field label="Customer" required className="sm:col-span-2">
            <Select
              name="customer_id"
              required
              placeholder="Select a customer…"
              options={customers.map((customer) => ({
                value: String(customer.id),
                label: `${[customer.first_name, customer.last_name].filter(Boolean).join(" ")} — ${customer.email}`,
              }))}
            />
          </Field>
        ) : null}

        <Field label="Document type" required>
          <Select name="kind" options={KIND_OPTIONS} defaultValue="id_card" />
        </Field>

        <Field label="Title" hint="Defaults to the document type.">
          <input name="title" placeholder="e.g. International passport" className={inputClass} />
        </Field>

        <Field label="File" hint="PDF or image, up to 15 MB.">
          <input type="file" name="file" accept="image/*,application/pdf" className={cn(inputClass, "file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--dash-page)] file:px-3 file:py-1 file:text-xs")} />
        </Field>

        <Field label="Or link to one" hint="Use when the file already lives somewhere addressable.">
          <input name="file_url" type="url" placeholder="https://…" className={inputClass} />
        </Field>

        <Field label="Expires on" hint="Leave blank for a document that does not expire.">
          <input type="date" name="expires_on" className={inputClass} />
        </Field>

        <Field label="Note">
          <input name="note" placeholder="Anything the reviewer should know." className={inputClass} />
        </Field>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          {pending ? "Uploading…" : "Save to vault"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={buttonStyles.ghost}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function DocumentRow({ row, reviewAction, deleteAction, canVerify, canUpload, showCustomer }) {
  return (
    <li className="flex flex-wrap items-start gap-4 px-5 py-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--dash-page)] text-[var(--dash-muted)]">
        <FileText className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-[var(--dash-ink)]">{row.title}</p>
          <StatusPill status={row.status} label={DOCUMENT_STATUSES[row.status]?.label} />
          {row.expiringSoon ? <StatusPill status="pending" label={`Expires ${shortDate(row.expiresOn)}`} /> : null}
        </div>

        <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
          {row.kindLabel}
          {showCustomer && row.customerUuid ? (
            <>
              {" · "}
              <Link href={`/dashboard/customers/${row.customerUuid}`} className="hover:underline">
                {row.customer}
              </Link>
            </>
          ) : null}
          {" · uploaded "}
          {relativeTime(row.createdAt)}
          {row.uploadedBy ? ` by ${row.uploadedBy}` : ""}
        </p>

        {row.note ? <p className="mt-1 text-xs text-[var(--dash-ink-2)]">{row.note}</p> : null}
        {row.reviewedBy ? (
          <p className="mt-1 text-[11px] text-[var(--dash-muted)]">
            Reviewed by {row.reviewedBy} {relativeTime(row.reviewedAt)}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {row.fileUrl ? (
          <a
            href={row.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--dash-line)] px-2.5 py-1.5 text-xs font-medium text-[var(--dash-ink-2)] transition hover:bg-[var(--dash-page)]"
          >
            <ExternalLink className="size-3.5" />
            Open
          </a>
        ) : null}

        {canVerify && row.status !== "verified" ? (
          <form action={reviewAction}>
            <input type="hidden" name="uuid" value={row.uuid} />
            <input type="hidden" name="status" value="verified" />
            <input type="hidden" name="customer_uuid" value={row.customerUuid || ""} />
            <button type="submit" className="rounded-lg bg-[#eaf7ea] px-2.5 py-1.5 text-xs font-medium text-[#046004] transition hover:bg-[#d9efd9]">
              Verify
            </button>
          </form>
        ) : null}

        {canVerify && row.status !== "rejected" ? (
          <form action={reviewAction}>
            <input type="hidden" name="uuid" value={row.uuid} />
            <input type="hidden" name="status" value="rejected" />
            <input type="hidden" name="customer_uuid" value={row.customerUuid || ""} />
            <button type="submit" className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--dash-muted)] transition hover:bg-[#fdeced] hover:text-[var(--status-critical)]">
              Reject
            </button>
          </form>
        ) : null}

        {canUpload ? (
          <ConfirmDelete
            action={deleteAction}
            hiddenFields={{ uuid: row.uuid, customer_uuid: row.customerUuid || "" }}
            label="Delete document"
            size="sm"
          />
        ) : null}
      </div>
    </li>
  );
}
