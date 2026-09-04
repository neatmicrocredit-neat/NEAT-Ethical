import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, MessagesSquare, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { initials, percent } from "@/lib/format";
import { Sparkline } from "@/components/dashboard/charts";

export function PageHeader({ eyebrow, title, description, actions, children }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dash-muted)]">{eyebrow}</p> : null}
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[var(--dash-ink)] sm:text-[1.75rem]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[var(--dash-ink-2)]">{description}</p> : null}
        {children}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({ className, children, ...props }) {
  return (
    <section className={cn("rounded-2xl bg-[var(--dash-surface)] ring-1 ring-[var(--dash-line)]", className)} {...props}>
      {children}
    </section>
  );
}

export function PanelHeader({ title, description, action, className }) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-[var(--dash-line)] px-5 py-4", className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">{title}</h2>
        {description ? <p className="mt-1 text-xs text-[var(--dash-muted)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/**
 * Stat tile: label · value · optional delta · optional sparkline.
 * The value uses proportional figures — tabular-nums only belongs in columns.
 */
export function StatCard({ label, value, hint, delta, deltaLabel, trend, trendColor, upIsGood = true, href, tone }) {
  const Wrapper = href ? Link : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "group flex flex-col justify-between rounded-2xl bg-[var(--dash-surface)] p-5 ring-1 ring-[var(--dash-line)] transition",
        href && "hover:ring-[#c9d8ea] hover:shadow-[0_8px_24px_rgb(11_17_32_/_0.06)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-[var(--dash-muted)]">{label}</p>
        {tone ? <StatusPill status={tone} /> : null}
      </div>
      <p className="mt-3 text-[1.6rem] font-semibold leading-none tracking-tight text-[var(--dash-ink)]">{value}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {delta !== null && delta !== undefined ? <Delta value={delta} label={deltaLabel} upIsGood={upIsGood} /> : null}
          {hint ? <p className="mt-1 truncate text-xs text-[var(--dash-muted)]">{hint}</p> : null}
        </div>
        {trend?.length ? (
          <div className="w-24 shrink-0">
            <Sparkline data={trend} color={trendColor || "var(--series-1)"} />
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
}

/** Signed change against a named period. Direction × whether up is good. */
export function Delta({ value, label, upIsGood = true }) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <p className="text-xs text-[var(--dash-muted)]">No prior period</p>;
  }
  const flat = Math.abs(value) < 0.05;
  const good = upIsGood ? value > 0 : value < 0;
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  const color = flat ? "text-[var(--dash-muted)]" : good ? "text-[var(--status-good-ink)]" : "text-[var(--status-critical)]";

  return (
    <p className={cn("flex items-center gap-1 text-xs font-medium", color)}>
      <Icon className="size-3.5" aria-hidden />
      <span className="tabular-nums">{percent(value)}</span>
      {label ? <span className="font-normal text-[var(--dash-muted)]">{label}</span> : null}
    </p>
  );
}

const STATUS_STYLES = {
  active: { dot: "var(--status-good)", className: "bg-[#eaf7ea] text-[#046004]", label: "Active" },
  pending: { dot: "var(--status-warning)", className: "bg-[#fdf4e0] text-[#7a5600]", label: "Pending" },
  matured: { dot: "#94a3b8", className: "bg-[#f1f4f8] text-[#475569]", label: "Matured" },
  none: { dot: "#cbd5e1", className: "bg-[#f1f4f8] text-[#7c8798]", label: "No placements" },
  open: { dot: "var(--series-1)", className: "bg-[#eaf2fb] text-[#154a86]", label: "Open" },
  awaiting: { dot: "var(--status-warning)", className: "bg-[#fdf4e0] text-[#7a5600]", label: "Awaiting reply" },
  closed: { dot: "#94a3b8", className: "bg-[#f1f4f8] text-[#475569]", label: "Closed" },
  queued: { dot: "var(--status-warning)", className: "bg-[#fdf4e0] text-[#7a5600]", label: "Queued" },
  sent: { dot: "var(--status-good)", className: "bg-[#eaf7ea] text-[#046004]", label: "Sent" },
  failed: { dot: "var(--status-critical)", className: "bg-[#fdeced] text-[#96201f]", label: "Failed" },
};

/**
 * Status is never colour alone — every pill carries a dot and its label.
 */
export function StatusPill({ status, label, className }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.none;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        style.className,
        className
      )}
    >
      <span className="size-1.5 rounded-full" style={{ background: style.dot }} aria-hidden />
      {label || style.label}
    </span>
  );
}

export function Avatar({ customer, src, size = "md", className }) {
  const sizes = { sm: "size-8 text-[11px]", md: "size-10 text-xs", lg: "size-14 text-sm" };
  const photo = src ?? customer?.image_url;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--dash-accent-soft)] font-semibold text-[var(--dash-accent)] ring-1 ring-[var(--dash-line)]",
        sizes[size],
        className
      )}
    >
      {photo ? (
        // Storage hosts vary per environment, so use a plain img rather than
        // next/image, which needs each host allow-listed in next.config.mjs.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="size-full object-cover" />
      ) : (
        initials(customer)
      )}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      {Icon ? (
        <span className="mb-4 grid size-11 place-items-center rounded-full bg-[var(--dash-page)] text-[var(--dash-muted)]">
          <Icon className="size-5" />
        </span>
      ) : null}
      <p className="text-sm font-semibold text-[var(--dash-ink)]">{title}</p>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-[var(--dash-ink-2)]">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Label/value pair used across the detail pages. */
export function Field({ label, value, className, mono }) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--dash-muted)]">{label}</dt>
      <dd className={cn("mt-1 text-sm text-[var(--dash-ink)]", mono && "font-mono text-[13px]")}>{value || "—"}</dd>
    </div>
  );
}

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dash-accent)]";

export const buttonStyles = {
  primary: cn(BUTTON_BASE, "bg-[var(--dash-accent)] text-white hover:bg-[#00478a]"),
  secondary: cn(BUTTON_BASE, "border border-[var(--dash-line)] bg-[var(--dash-surface)] text-[var(--dash-ink)] hover:bg-[var(--dash-page)]"),
  ghost: cn(BUTTON_BASE, "text-[var(--dash-ink-2)] hover:bg-[var(--dash-page)] hover:text-[var(--dash-ink)]"),
  danger: cn(BUTTON_BASE, "border border-[#f3c9c9] bg-white text-[var(--status-critical)] hover:bg-[#fdeced]"),
};

/**
 * Shown wherever messaging is surfaced before the migration has been applied,
 * so an unmigrated project degrades to an instruction rather than an error.
 */
export function MessagingSetupNotice({ className }) {
  return (
    <div className={cn("px-5 py-5", className)}>
      <p className="flex items-start gap-2 rounded-xl bg-[var(--dash-page)] px-3.5 py-3 text-xs leading-relaxed text-[var(--dash-ink-2)]">
        <MessagesSquare className="mt-0.5 size-4 shrink-0 text-[var(--dash-muted)]" />
        <span>
          Messaging is not switched on for this project yet. Apply{" "}
          <code className="rounded bg-[var(--dash-line)] px-1 py-0.5 font-mono text-[11px]">supabase/migrations/0001_messaging.sql</code>{" "}
          to create the <code className="font-mono text-[11px]">message_threads</code> and{" "}
          <code className="font-mono text-[11px]">messages</code> tables, then reload.
        </span>
      </p>
    </div>
  );
}

/** Money that stays legible in a column — tabular figures, right aligned. */
export function Amount({ children, className }) {
  return <span className={cn("font-medium tabular-nums text-[var(--dash-ink)]", className)}>{children}</span>;
}
