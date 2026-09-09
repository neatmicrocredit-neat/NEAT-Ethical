"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Briefcase,
  ChevronsLeft,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  History,
  LayoutDashboard,
  Leaf,
  ListTodo,
  LogOut,
  Menu,
  MessagesSquare,
  NotebookPen,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * `capability` hides a section the signed-in role cannot use at all, rather than
 * letting them navigate to a page that will only refuse them. Items with no
 * capability are visible to everyone who can sign in.
 */
const NAV = [
  {
    heading: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    heading: "Portfolio",
    items: [
      { href: "/dashboard/customers", label: "Customers", icon: Users },
      { href: "/dashboard/investments", label: "Investments", icon: Briefcase },
      { href: "/dashboard/approvals", label: "Approvals", icon: ClipboardCheck, badgeKey: "approvals" },
    ],
  },
  {
    heading: "Money",
    items: [
      { href: "/dashboard/payouts", label: "Payouts", icon: Wallet, badgeKey: "payouts", capability: "ledger.read" },
      { href: "/dashboard/transactions", label: "Ledger", icon: Receipt, capability: "ledger.read" },
    ],
  },
  {
    heading: "Governance",
    items: [
      { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheck, badgeKey: "compliance" },
      { href: "/dashboard/documents", label: "Documents", icon: FileText, badgeKey: "documents" },
      { href: "/dashboard/audit", label: "Audit trail", icon: History, capability: "audit.read" },
    ],
  },
  {
    heading: "Insight",
    items: [
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, capability: "analytics.read" },
      { href: "/dashboard/reports", label: "Reports", icon: FileSpreadsheet, capability: "reports.export" },
    ],
  },
  {
    heading: "Operations",
    items: [
      { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo, badgeKey: "tasks" },
      { href: "/dashboard/messages", label: "Messages", icon: MessagesSquare, badgeKey: "messages" },
      { href: "/dashboard/notes", label: "Notes", icon: NotebookPen },
    ],
  },
  {
    heading: "Administration",
    items: [
      { href: "/dashboard/team", label: "Team", icon: Users, capability: "team.read" },
      { href: "/dashboard/settings", label: "Settings", icon: Settings, capability: "settings.write" },
    ],
  },
];

function isActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function DashboardShell({ children, badges = {}, adminEmail, roleLabel = "Full access", capabilities = [] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarProps = { pathname, badges, adminEmail, roleLabel, capabilities };

  return (
    <div className="dash min-h-screen bg-[var(--dash-page)] text-[var(--dash-ink)]">
      <Sidebar className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:flex" {...sidebarProps} />

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-[var(--dash-ink)]/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <Sidebar className="absolute inset-y-0 left-0 flex w-72 shadow-2xl" {...sidebarProps} onClose={() => setMobileOpen(false)} />
        </div>
      ) : null}

      <div className="lg:pl-64">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({ className, pathname, badges, adminEmail, roleLabel, capabilities, onClose }) {
  const allowed = new Set(capabilities);
  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.capability || allowed.has(item.capability)),
  })).filter((group) => group.items.length);

  return (
    <aside className={cn("flex-col border-r border-[var(--dash-line)] bg-[var(--dash-surface)]", className)}>
      <div className="flex items-center justify-between gap-2 px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-[var(--dash-accent)] text-white">
            <Leaf className="size-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-[var(--dash-ink)]">NEAT Ethical</span>
            <span className="block text-[11px] text-[var(--dash-muted)]">Admin console</span>
          </span>
        </Link>
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Close navigation" className="rounded-lg p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-page)]">
            <ChevronsLeft className="size-4" />
          </button>
        ) : null}
      </div>

      <nav className="dash-scroll flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.heading} className="mb-5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dash-muted)]">{group.heading}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item);
                const badge = item.badgeKey ? badges[item.badgeKey] : null;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                        active
                          ? "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]"
                          : "text-[var(--dash-ink-2)] hover:bg-[var(--dash-page)] hover:text-[var(--dash-ink)]"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                            // Overdue money reads as a problem, not a count.
                            item.badgeKey === "payouts"
                              ? "bg-[var(--status-critical)] text-white"
                              : "bg-[var(--dash-accent)] text-white"
                          )}
                        >
                          {badge > 99 ? "99+" : badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--dash-line)] px-3 py-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--dash-page)] text-xs font-semibold text-[var(--dash-ink-2)]">
            {(adminEmail || "A").slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-xs font-semibold text-[var(--dash-ink)]">{adminEmail || "Administrator"}</span>
            <span className="block text-[11px] text-[var(--dash-muted)]">{roleLabel}</span>
          </span>
        </div>
        <form action="/api/auth/logout" method="post" className="mt-2">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[var(--dash-ink-2)] transition hover:bg-[var(--dash-page)] hover:text-[var(--dash-ink)]"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

function TopBar({ onMenu }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--dash-line)] bg-[var(--dash-surface)]/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open navigation"
          className="rounded-xl border border-[var(--dash-line)] p-2 text-[var(--dash-ink-2)] transition hover:bg-[var(--dash-page)] lg:hidden"
        >
          <Menu className="size-4" />
        </button>

        <GlobalSearch />

        <Link
          href="/dashboard/investments/new"
          className="ml-auto hidden rounded-xl bg-[var(--dash-accent)] px-3.5 py-2 text-sm font-medium text-white transition hover:bg-[#00478a] sm:inline-flex"
        >
          New placement
        </Link>
      </div>
    </header>
  );
}

/** Jumps to the customer directory pre-filtered — one search box, one target. */
function GlobalSearch() {
  const router = useRouter();
  const [term, setTerm] = useState("");

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const query = term.trim();
        router.push(query ? `/dashboard/customers?q=${encodeURIComponent(query)}` : "/dashboard/customers");
      }}
      className="relative w-full max-w-sm"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--dash-muted)]" />
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search customers by name, email or phone"
        aria-label="Search customers"
        className="w-full rounded-xl border border-[var(--dash-line)] bg-[var(--dash-page)] py-2 pl-9 pr-3 text-sm text-[var(--dash-ink)] outline-none transition placeholder:text-[var(--dash-muted)] focus:border-[var(--dash-accent)] focus:bg-[var(--dash-surface)]"
      />
      {term ? (
        <button
          type="button"
          onClick={() => setTerm("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[var(--dash-muted)] hover:bg-[var(--dash-line)]"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </form>
  );
}
