# NEAT Ethical Investment

Official investment platform by the NEAT group — a public marketing and
application site, plus an admin console at `/dashboard` that runs the book.

## Getting started

```bash
npm install
npm run dev
```

Environment variables live in `.env`. The console talks to Supabase with the
service role key, so it must never be exposed to the browser.

## Database migrations

Migrations live in `supabase/migrations` and are applied with `supabase db push`,
or by pasting into the Supabase SQL editor. Every statement is idempotent.

| Migration | Adds |
| --- | --- |
| `0001_messaging.sql` | `message_threads`, `messages` — customer correspondence |
| `0002_message_rich_text.sql` | rich-text bodies on messages |
| `0003_operations.sql` | the operations layer (see below) |

**`0003_operations.sql` is required for the full console.** It adds:

- `transactions` — the cash ledger: every naira in or out, tagged to a placement
  and, for payouts, to a specific month of that placement's schedule
- `documents` — the KYC / mandate / certificate vault, with a verification state
- `tasks` — follow-ups tied to a customer or placement
- `team_members` — who may sign in, and their role
- `audit_log` — an append-only trail of every mutation
- `app_settings` — operator-editable company details, rates and policy
- workflow columns on `investments` (`status`, `approved_at`, …) and compliance
  columns on `customers` (`kyc_status`, `risk_rating`, …)

Until it is applied, every screen that depends on it renders a setup notice
instead of failing, and the rest of the console works as before.

## The console

| Route | What it is for |
| --- | --- |
| `/dashboard` | The work queue first, then the book at a glance |
| `/dashboard/customers` | Customer directory and full customer file |
| `/dashboard/investments` | Every placement, with its settlement position |
| `/dashboard/approvals` | Review queue — approve or reject submitted placements |
| `/dashboard/payouts` | What is owed, what is overdue, and recording a payout run |
| `/dashboard/transactions` | The cash ledger |
| `/dashboard/compliance` | KYC status and risk rating per customer |
| `/dashboard/documents` | The document vault |
| `/dashboard/audit` | Who changed what, and when |
| `/dashboard/analytics` | Portfolio analytics |
| `/dashboard/reports` | Board-ready CSV extracts |
| `/dashboard/tasks` | Follow-ups |
| `/dashboard/messages`, `/dashboard/notes` | Customer correspondence |
| `/dashboard/team`, `/dashboard/settings` | Roles, and the policy the console enforces |

### Roles

Access is `owner` > `admin` > `analyst` > `support`, defined in `lib/team.js`.
Permissions are cumulative and every capability names the lowest role that holds
it. Sign-in is still the `auth` cookie that `proxy.js` checks; `team_members`
decides what the person who signed in may then do.

Until at least one row exists in `team_members`, anyone who can sign in is
treated as an owner so the first operator can seed the team. After that, an
email not on the list gets the lowest role rather than none.

## Two notions of status

A placement carries both, and they answer different questions:

- **derived** (`lib/investments.js`) — where the *term* is: pending, active,
  matured. Pure arithmetic on the start and end dates.
- **workflow** (`lib/workflow.js`) — where the *decision* is: draft, pending,
  approved, active, closed, rejected, cancelled, defaulted.

`lifecycle()` folds the two into the single label a reader wants.

## Reconciliation

Projections say what a placement *should* pay. The ledger records what actually
moved. `settlementFor()` in `lib/ledger.js` compares them month by month: a
period is due once its date passes, and settled once cleared payouts tagged with
that `period_index` cover it. Anything due and uncovered is arrears — which is
what `/dashboard/payouts` exists to surface.
