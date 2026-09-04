"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Bold, CheckCircle2, Info, Italic, List, Paperclip, Send, StickyNote, Underline } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonStyles } from "@/components/dashboard/ui";

const CHANNELS = [
  { key: "email", label: "Email", icon: Send, hint: "Sent through Resend to the customer's inbox." },
  { key: "note", label: "Internal note", icon: StickyNote, hint: "Stays in the console. The customer never sees it." },
];

/**
 * One composer for both entry points: replying inside a thread (thread is set)
 * and opening a new conversation from a customer page (customerId is set).
 */
export function MessageComposer({
  action,
  thread,
  customerId,
  customerName,
  customers,
  defaultSubject = "",
  redirectToThread = false,
  compact = false,
  fixedChannel,
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false, error: null, message: null });
  const [channel, setChannel] = useState(fixedChannel || "email");
  const [body, setBody] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [attachments, setAttachments] = useState([]);
  const formRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setBody("");
      setBodyHtml("");
      setAttachments([]);
      if (editorRef.current) editorRef.current.innerHTML = "";
    }
  }, [state.ok]);

  const active = CHANNELS.find((option) => option.key === channel);

  return (
    <form ref={formRef} action={formAction} className={cn("space-y-3", compact ? "p-4" : "p-5")}>
      {thread ? <input type="hidden" name="thread_id" value={thread.id} /> : null}
      {thread ? <input type="hidden" name="thread_uuid" value={thread.uuid} /> : null}
      {customerId ? <input type="hidden" name="customer_id" value={customerId} /> : null}
      {redirectToThread ? <input type="hidden" name="redirect_to_thread" value="true" /> : null}
      <input type="hidden" name="channel" value={channel} />

      {state.error ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-[#f3c9c9] bg-[#fdeced] px-3 py-2 text-xs text-[#96201f]">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="flex items-start gap-2 rounded-xl border border-[#c9e7c9] bg-[#eaf7ea] px-3 py-2 text-xs text-[#046004]">
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
          {state.message}
        </p>
      ) : null}

      {!fixedChannel ? <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Message channel">
        {CHANNELS.map((option) => {
          const Icon = option.icon;
          const selected = channel === option.key;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={selected}
              onClick={() => setChannel(option.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                selected ? "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]" : "text-[var(--dash-ink-2)] hover:bg-[var(--dash-page)]"
              )}
            >
              <Icon className="size-3.5" />
              {option.label}
            </button>
          );
        })}
      </div> : null}

      {!thread && customers ? (
        <label className="block space-y-1.5">
          <span className="block text-xs font-medium text-[var(--dash-ink-2)]">To</span>
          <select
            name="customer_id"
            required
            defaultValue=""
            className="w-full rounded-xl border border-[var(--dash-line)] bg-[var(--dash-surface)] px-3 py-2 text-sm outline-none transition focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)]/15"
          >
            <option value="">Select a customer…</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {[customer.first_name, customer.last_name].filter(Boolean).join(" ")} — {customer.email}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {!thread ? (
        <label className="block space-y-1.5">
          <span className="block text-xs font-medium text-[var(--dash-ink-2)]">Subject</span>
          <input
            name="subject"
            defaultValue={defaultSubject}
            placeholder="What is this about?"
            className="w-full rounded-xl border border-[var(--dash-line)] bg-[var(--dash-surface)] px-3 py-2 text-sm outline-none transition placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)]/15"
          />
        </label>
      ) : null}

      <input type="hidden" name="body" value={body} />
      <input type="hidden" name="body_html" value={bodyHtml} />
      <div className="overflow-hidden rounded-xl border border-[var(--dash-line)] bg-[var(--dash-surface)] focus-within:border-[var(--dash-accent)] focus-within:ring-2 focus-within:ring-[var(--dash-accent)]/15">
        <div className="flex items-center gap-1 border-b border-[var(--dash-line)] px-2 py-1.5" role="toolbar" aria-label="Text formatting">
          {[
            ["Bold", Bold, "bold"],
            ["Italic", Italic, "italic"],
            ["Underline", Underline, "underline"],
            ["Bulleted list", List, "insertUnorderedList"],
          ].map(([label, Icon, command]) => (
            <button
              key={command}
              type="button"
              title={label}
              aria-label={label}
              onMouseDown={(event) => {
                event.preventDefault();
                editorRef.current?.focus();
                document.execCommand(command);
                setBody(editorRef.current?.innerText || "");
                setBodyHtml(editorRef.current?.innerHTML || "");
              }}
              className="grid size-7 place-items-center rounded-md text-[var(--dash-ink-2)] hover:bg-[var(--dash-page)] hover:text-[var(--dash-ink)]"
            >
              <Icon className="size-3.5" />
            </button>
          ))}
        </div>
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label="Message"
          data-placeholder={channel === "note" ? "Note for the team — not sent to the customer." : `Write to ${customerName || "the customer"}…`}
          onInput={(event) => {
            setBody(event.currentTarget.innerText);
            setBodyHtml(event.currentTarget.innerHTML);
          }}
          className="min-h-28 whitespace-pre-wrap px-3 py-2.5 text-sm leading-relaxed outline-none empty:before:pointer-events-none empty:before:text-[var(--dash-muted)] empty:before:content-[attr(data-placeholder)]"
        />
      </div>
      {channel === "email" ? (
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--dash-ink-2)] hover:text-[var(--dash-ink)]">
          <Paperclip className="size-4" />
          Add attachments
          <input
            type="file"
            name="attachments"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
            onChange={(event) => setAttachments(Array.from(event.target.files || []))}
            className="sr-only"
          />
        </label>
      ) : null}
      {attachments.length ? <p className="text-xs text-[var(--dash-muted)]">{attachments.map((file) => file.name).join(", ")}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--dash-muted)]">
          <Info className="mt-px size-3 shrink-0" />
          {active.hint}
        </p>
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          <Send className="size-4" />
          {pending ? "Sending…" : channel === "note" ? "Save note" : "Send message"}
        </button>
      </div>
    </form>
  );
}
