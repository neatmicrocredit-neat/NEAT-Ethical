"use client";

import { useActionState, useState } from "react";
import { UserPlus, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { MEMBER_STATUSES, ROLES } from "@/lib/team";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { Avatar, EmptyState, StatusPill, buttonStyles } from "@/components/dashboard/ui";
import { Field, FormBanner, Select, inputClass, optionsFrom } from "@/components/dashboard/form-kit";

const ROLE_OPTIONS = optionsFrom(ROLES);
const STATUS_OPTIONS = optionsFrom(MEMBER_STATUSES);

const STATUS_TONE = { active: "active", invited: "pending", suspended: "rejected" };

export function TeamManager({ rows, inviteAction, updateAction, removeAction, canManage }) {
  const [openUuid, setOpenUuid] = useState(null);

  return (
    <div className="space-y-4">
      {canManage ? <InvitePanel action={inviteAction} /> : null}

      <div className="rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]">
        {rows.length ? (
          <ul className="divide-y divide-[var(--dash-line)]">
            {rows.map((row) => (
              <MemberRow
                key={row.uuid}
                row={row}
                updateAction={updateAction}
                removeAction={removeAction}
                canManage={canManage}
                open={openUuid === row.uuid}
                onToggle={() => setOpenUuid((previous) => (previous === row.uuid ? null : row.uuid))}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Users}
            title="No team members on file"
            description="Add the people who should have console access, and give each of them a role."
          />
        )}
      </div>
    </div>
  );
}

function InvitePanel({ action }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--dash-surface)] px-5 py-4 ring-1 ring-[var(--dash-line)]">
        <p className="text-sm text-[var(--dash-ink-2)]">Add someone who should be able to sign in, and choose what they may do.</p>
        <button type="button" onClick={() => setOpen(true)} className={buttonStyles.primary}>
          <UserPlus className="size-4" />
          Add member
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl bg-[var(--dash-surface)] p-5 ring-1 ring-[var(--dash-line)]">
      <FormBanner state={state} />
      <div className={cn("grid gap-4 sm:grid-cols-2", (state.error || state.message) && "mt-4")}>
        <Field label="Email" required hint="Must match the address they sign in with.">
          <input name="email" type="email" required placeholder="name@neatethical.com" className={inputClass} />
        </Field>
        <Field label="Role" required>
          <Select name="role" defaultValue="support" options={ROLE_OPTIONS} />
        </Field>
        <Field label="Name">
          <input name="name" className={inputClass} />
        </Field>
        <Field label="Job title">
          <input name="title" placeholder="e.g. Operations lead" className={inputClass} />
        </Field>
        <Field label="Phone" className="sm:col-span-2">
          <input name="phone" className={inputClass} />
        </Field>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          {pending ? "Adding…" : "Add member"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={buttonStyles.ghost}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function MemberRow({ row, updateAction, removeAction, canManage, open, onToggle }) {
  const [state, formAction, pending] = useActionState(updateAction, { ok: false, error: null, message: null });
  const role = ROLES[row.role] || ROLES.support;

  return (
    <li className={cn(open && "bg-[var(--dash-page)]")}>
      <div className="flex flex-wrap items-center gap-4 px-5 py-4">
        <Avatar customer={{ first_name: row.name || row.email, last_name: "" }} size="sm" />

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--dash-ink)]">
            {row.name || row.email}
            {row.isMe ? <span className="rounded-full bg-[var(--dash-page)] px-2 py-0.5 text-[10px] text-[var(--dash-muted)]">You</span> : null}
          </p>
          <p className="truncate text-xs text-[var(--dash-muted)]">
            {row.email}
            {row.title ? ` · ${row.title}` : ""} · last seen {row.lastSeen}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill status={STATUS_TONE[row.status] || "closed"} label={MEMBER_STATUSES[row.status]?.label} />
          <span className="rounded-full bg-[var(--dash-page)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--dash-ink-2)]">{role.label}</span>
        </div>

        {canManage ? (
          <button type="button" onClick={onToggle} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--dash-accent)] hover:bg-[var(--dash-accent-soft)]">
            {open ? "Close" : "Edit"}
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="px-5 pb-5">
          <form action={formAction} className="rounded-xl border border-[var(--dash-line)] bg-[var(--dash-surface)] p-4">
            <input type="hidden" name="uuid" value={row.uuid} />
            <FormBanner state={state} />

            <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", (state.error || state.message) && "mt-4")}>
              <Field label="Name">
                <input name="name" defaultValue={row.name} className={inputClass} />
              </Field>
              <Field label="Job title">
                <input name="title" defaultValue={row.title} className={inputClass} />
              </Field>
              <Field label="Role" hint={role.note}>
                <Select name="role" defaultValue={row.role} options={ROLE_OPTIONS} />
              </Field>
              <Field label="Status">
                <Select name="status" defaultValue={row.status} options={STATUS_OPTIONS} />
              </Field>
              <Field label="Phone" className="sm:col-span-2">
                <input name="phone" defaultValue={row.phone} className={inputClass} />
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="submit" disabled={pending} className={buttonStyles.primary}>
                {pending ? "Saving…" : "Save member"}
              </button>
            </div>
          </form>

          <div className="mt-3">
            <ConfirmDelete
              action={removeAction}
              hiddenFields={{ uuid: row.uuid }}
              label="Remove from team"
              confirmLabel="Yes, remove access"
              description="They lose console access immediately."
            />
          </div>
        </div>
      ) : null}
    </li>
  );
}
