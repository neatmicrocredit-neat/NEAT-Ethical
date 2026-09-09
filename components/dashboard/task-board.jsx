"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, ListTodo, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { relativeTime, shortDate } from "@/lib/format";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/tasks";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { EmptyState, StatusPill, buttonStyles } from "@/components/dashboard/ui";
import { FilterChips, Toolbar } from "@/components/dashboard/table-kit";
import { Field, FormBanner, Select, inputClass, optionsFrom } from "@/components/dashboard/form-kit";

const FILTERS = [
  { value: "open", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "all", label: "All" },
];

const STATUS_OPTIONS = optionsFrom(TASK_STATUSES);
const PRIORITY_OPTIONS = optionsFrom(TASK_PRIORITIES);

export function TaskBoard({
  rows,
  createAction,
  statusAction,
  deleteAction,
  canWrite,
  customers = [],
  assignees = [],
  lockedCustomerId,
  lockedCustomerUuid,
  lockedInvestmentId,
  compact = false,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("open");

  const counts = useMemo(() => {
    const tally = { all: rows.length, open: 0, in_progress: 0, done: 0 };
    for (const row of rows) tally[row.status] = (tally[row.status] || 0) + 1;
    return tally;
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false;
      if (!term) return true;
      return [row.title, row.detail, row.assignee, row.customer].some((field) =>
        String(field || "").toLowerCase().includes(term)
      );
    });
  }, [rows, search, filter]);

  return (
    <div className="space-y-4">
      {canWrite ? (
        <NewTask
          action={createAction}
          customers={customers}
          assignees={assignees}
          lockedCustomerId={lockedCustomerId}
          lockedCustomerUuid={lockedCustomerUuid}
          lockedInvestmentId={lockedInvestmentId}
        />
      ) : null}

      <div className="rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]">
        {compact ? null : (
          <Toolbar search={search} onSearch={setSearch} placeholder="Search task, assignee or customer">
            <FilterChips
              label="Status"
              options={FILTERS.map((entry) => ({ ...entry, count: counts[entry.value] }))}
              value={filter}
              onChange={setFilter}
            />
          </Toolbar>
        )}

        {filtered.length ? (
          <ul className="divide-y divide-[var(--dash-line)]">
            {filtered.map((row) => (
              <li key={row.uuid} className={cn("flex flex-wrap items-start gap-3 px-5 py-3.5", row.status === "done" && "opacity-60")}>
                {canWrite ? (
                  <form action={statusAction} className="pt-0.5">
                    <input type="hidden" name="uuid" value={row.uuid} />
                    <input type="hidden" name="status" value={row.status === "done" ? "open" : "done"} />
                    <input type="hidden" name="customer_uuid" value={row.customerUuid || ""} />
                    <button
                      type="submit"
                      aria-label={row.status === "done" ? `Reopen ${row.title}` : `Complete ${row.title}`}
                      className={cn(
                        "grid size-5 place-items-center rounded-full border transition",
                        row.status === "done"
                          ? "border-[var(--status-good)] bg-[var(--status-good)] text-white"
                          : "border-[var(--dash-line)] hover:border-[var(--dash-accent)]"
                      )}
                    >
                      {row.status === "done" ? <CheckCircle2 className="size-3.5" /> : null}
                    </button>
                  </form>
                ) : null}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn("text-sm font-medium text-[var(--dash-ink)]", row.status === "done" && "line-through")}>{row.title}</p>
                    {row.overdue ? <StatusPill status="overdue" label={`Overdue ${relativeTime(row.dueOn)}`} /> : null}
                    {row.priority === "urgent" || row.priority === "high" ? <StatusPill status={row.priority === "urgent" ? "urgent" : "high"} label={TASK_PRIORITIES[row.priority].label} /> : null}
                    {row.status === "in_progress" ? <StatusPill status="in_progress" /> : null}
                  </div>

                  {row.detail ? <p className="mt-0.5 text-xs text-[var(--dash-ink-2)]">{row.detail}</p> : null}

                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-[var(--dash-muted)]">
                    {row.dueOn ? <span>Due {shortDate(row.dueOn)}</span> : <span>No due date</span>}
                    <span aria-hidden>·</span>
                    <span>{row.assignee || "Unassigned"}</span>
                    {row.customerUuid ? (
                      <>
                        <span aria-hidden>·</span>
                        <Link href={`/dashboard/customers/${row.customerUuid}`} className="hover:underline">
                          {row.customer}
                        </Link>
                      </>
                    ) : null}
                  </p>
                </div>

                {canWrite ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    {row.status === "open" ? (
                      <form action={statusAction}>
                        <input type="hidden" name="uuid" value={row.uuid} />
                        <input type="hidden" name="status" value="in_progress" />
                        <input type="hidden" name="customer_uuid" value={row.customerUuid || ""} />
                        <button type="submit" className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--dash-accent)] transition hover:bg-[var(--dash-accent-soft)]">
                          Start
                        </button>
                      </form>
                    ) : null}
                    <ConfirmDelete
                      action={deleteAction}
                      hiddenFields={{ uuid: row.uuid, customer_uuid: row.customerUuid || "" }}
                      label="Delete task"
                      size="sm"
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={ListTodo}
            title={filter === "open" ? "Nothing to do" : "No tasks match this filter"}
            description={filter === "open" ? "Every follow-up has been picked up or closed." : "Try another status filter."}
          />
        )}
      </div>
    </div>
  );
}

function NewTask({ action, customers, assignees, lockedCustomerId, lockedCustomerUuid, lockedInvestmentId }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--dash-surface)] px-5 py-4 ring-1 ring-[var(--dash-line)]">
        <p className="text-sm text-[var(--dash-ink-2)]">Track a follow-up: a call to make, a document to chase, a payout to confirm.</p>
        <button type="button" onClick={() => setOpen(true)} className={buttonStyles.primary}>
          <Plus className="size-4" />
          New task
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
        <Field label="Task" required className="sm:col-span-2">
          <input name="title" required placeholder="e.g. Chase proof of address before approval" className={inputClass} />
        </Field>

        <Field label="Detail" className="sm:col-span-2">
          <textarea name="detail" rows={2} className={cn(inputClass, "resize-y")} />
        </Field>

        {!lockedCustomerId ? (
          <Field label="Customer" hint="Optional — links the task to a record.">
            <Select
              name="customer_id"
              placeholder="Not customer-specific"
              options={customers.map((customer) => ({
                value: String(customer.id),
                label: `${[customer.first_name, customer.last_name].filter(Boolean).join(" ")}`,
              }))}
            />
          </Field>
        ) : null}

        <Field label="Assignee">
          <input name="assignee" list="task-assignees" placeholder="Email or name" className={inputClass} />
          <datalist id="task-assignees">
            {assignees.map((assignee) => (
              <option key={assignee} value={assignee} />
            ))}
          </datalist>
        </Field>

        <Field label="Due">
          <input type="date" name="due_on" className={inputClass} />
        </Field>

        <Field label="Priority">
          <Select name="priority" defaultValue="normal" options={PRIORITY_OPTIONS} />
        </Field>

        <Field label="Status">
          <Select name="status" defaultValue="open" options={STATUS_OPTIONS} />
        </Field>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          {pending ? "Saving…" : "Create task"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={buttonStyles.ghost}>
          Cancel
        </button>
      </div>
    </form>
  );
}
