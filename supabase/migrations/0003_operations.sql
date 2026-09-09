-- Operations layer for the admin console.
--
-- Everything before this migration was *projected*: the console modelled what a
-- placement should pay from its rate and term, but nothing recorded what money
-- actually moved, who approved a placement, or who changed a record. This adds
-- the tables that turn the console into a system of record:
--
--   transactions   the cash ledger — every naira in or out, per placement
--   documents      KYC / mandate / statement files with a verification state
--   tasks          follow-ups tied to a customer or placement
--   team_members   who may sign in, and what they may do
--   audit_log      an append-only trail of every mutation
--   app_settings   operator-editable configuration (rates, company, policy)
--
-- It also adds workflow columns to `investments` and `customers` so a placement
-- has an explicit lifecycle (pending -> approved -> active -> matured/closed)
-- instead of one inferred purely from its dates.
--
-- Run against the project with:
--   supabase db push
-- or paste into the Supabase SQL editor. Every statement is idempotent.

/* ------------------------------------------------------- investments: workflow */

-- `status` is the *operator's* state. Date-derived status (pending/active/
-- matured) still drives the projections; this column records the decisions a
-- human made and is what the approvals queue reads and writes.
alter table public.investments add column if not exists status text not null default 'active';
alter table public.investments add column if not exists submitted_at timestamptz;
alter table public.investments add column if not exists approved_at timestamptz;
alter table public.investments add column if not exists approved_by text;
alter table public.investments add column if not exists decision_note text;
alter table public.investments add column if not exists funded_at timestamptz;
alter table public.investments add column if not exists closed_at timestamptz;
alter table public.investments add column if not exists risk_notes text;
alter table public.investments add column if not exists reference text;

create index if not exists investments_status_idx on public.investments (status);
create index if not exists investments_customer_idx on public.investments (customer_id);

/* --------------------------------------------------------- customers: compliance */

alter table public.customers add column if not exists kyc_status text not null default 'unverified';
alter table public.customers add column if not exists kyc_verified_at timestamptz;
alter table public.customers add column if not exists kyc_verified_by text;
alter table public.customers add column if not exists kyc_note text;
alter table public.customers add column if not exists risk_rating text not null default 'unrated';
alter table public.customers add column if not exists is_pep boolean not null default false;
alter table public.customers add column if not exists source text;

create index if not exists customers_kyc_idx on public.customers (kyc_status);

/* ----------------------------------------------------------------- transactions */

-- One row per money movement. `direction` is stored rather than derived so a
-- signed adjustment can go either way without special-casing every query.
--
-- `period_index` ties a payout back to a specific month of a placement's
-- schedule (month 1..n from projectInvestment). That is what lets the payouts
-- screen say "month 4 is still owed" instead of only comparing totals.
create table if not exists public.transactions (
  id            bigint generated always as identity primary key,
  uuid          uuid not null default gen_random_uuid(),
  customer_id   bigint references public.customers (id) on delete set null,
  investment_id bigint references public.investments (id) on delete set null,
  kind          text not null,                    -- deposit | profit_payout | principal_return | withdrawal | fee | adjustment
  direction     text not null,                    -- in | out
  amount        numeric(18,2) not null,
  status        text not null default 'cleared',  -- pending | cleared | failed | cancelled
  value_date    date not null default current_date,
  period_index  integer,
  method        text,                             -- bank_transfer | cash | cheque | internal
  reference     text,
  bank_name     text,
  account_name  text,
  account_number text,
  note          text,
  created_by    text,
  created_at    timestamptz not null default now(),
  cleared_at    timestamptz
);

create unique index if not exists transactions_uuid_key on public.transactions (uuid);
create index if not exists transactions_investment_idx on public.transactions (investment_id, period_index);
create index if not exists transactions_customer_idx on public.transactions (customer_id, value_date desc);
create index if not exists transactions_recent_idx on public.transactions (value_date desc);
create index if not exists transactions_status_idx on public.transactions (status);

/* -------------------------------------------------------------------- documents */

create table if not exists public.documents (
  id            bigint generated always as identity primary key,
  uuid          uuid not null default gen_random_uuid(),
  customer_id   bigint references public.customers (id) on delete cascade,
  investment_id bigint references public.investments (id) on delete cascade,
  kind          text not null default 'other',    -- id_card | proof_of_address | mandate | certificate | statement | other
  title         text not null,
  file_url      text,
  mime_type     text,
  size_bytes    bigint,
  status        text not null default 'pending',  -- pending | verified | rejected | expired
  expires_on    date,
  reviewed_by   text,
  reviewed_at   timestamptz,
  note          text,
  uploaded_by   text,
  created_at    timestamptz not null default now()
);

create unique index if not exists documents_uuid_key on public.documents (uuid);
create index if not exists documents_customer_idx on public.documents (customer_id);
create index if not exists documents_investment_idx on public.documents (investment_id);
create index if not exists documents_status_idx on public.documents (status);

/* ------------------------------------------------------------------------ tasks */

create table if not exists public.tasks (
  id            bigint generated always as identity primary key,
  uuid          uuid not null default gen_random_uuid(),
  title         text not null,
  detail        text,
  status        text not null default 'open',     -- open | in_progress | done | cancelled
  priority      text not null default 'normal',   -- low | normal | high | urgent
  due_on        date,
  assignee      text,
  customer_id   bigint references public.customers (id) on delete cascade,
  investment_id bigint references public.investments (id) on delete cascade,
  created_by    text,
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);

create unique index if not exists tasks_uuid_key on public.tasks (uuid);
create index if not exists tasks_open_idx on public.tasks (status, due_on);
create index if not exists tasks_customer_idx on public.tasks (customer_id);

/* ----------------------------------------------------------------- team members */

-- Console access list. `role` drives the permission checks in lib/team.js.
-- The sign-in cookie proves someone completed the Supabase sign-in; this table
-- says what that person is allowed to do once inside.
create table if not exists public.team_members (
  id            bigint generated always as identity primary key,
  uuid          uuid not null default gen_random_uuid(),
  email         text not null,
  name          text,
  role          text not null default 'support',  -- owner | admin | analyst | support
  status        text not null default 'active',   -- active | invited | suspended
  title         text,
  phone         text,
  invited_by    text,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now()
);

create unique index if not exists team_members_email_key on public.team_members (lower(email));
create unique index if not exists team_members_uuid_key on public.team_members (uuid);

/* -------------------------------------------------------------------- audit log */

-- Append-only. Nothing in the console updates or deletes these rows; the
-- reviewer's question is always "what happened to this record, and who did it".
create table if not exists public.audit_log (
  id            bigint generated always as identity primary key,
  uuid          uuid not null default gen_random_uuid(),
  actor         text,
  action        text not null,                    -- create | update | delete | approve | reject | send | verify | sign_in
  entity        text not null,                    -- customer | investment | transaction | document | task | team | settings
  entity_id     text,
  entity_label  text,
  summary       text,
  changes       jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists audit_log_recent_idx on public.audit_log (created_at desc);
create index if not exists audit_log_entity_idx on public.audit_log (entity, entity_id);
create index if not exists audit_log_actor_idx on public.audit_log (actor);

/* ----------------------------------------------------------------- app settings */

create table if not exists public.app_settings (
  key           text primary key,
  value         jsonb not null default '{}'::jsonb,
  updated_by    text,
  updated_at    timestamptz not null default now()
);

insert into public.app_settings (key, value)
values
  ('company', '{"name":"NEAT Ethical Investments","email":"info@neatethical.com","phone":"+2349096852944","address":"","website":"https://neatethical.com"}'::jsonb),
  ('vehicles', '{"ethical":{"monthlyRate":0.02,"label":"Ethical Investments"},"funding":{"monthlyRate":0.05,"label":"Ethical Funding"}}'::jsonb),
  ('policy', '{"minAmount":100000,"maxAmount":50000000,"defaultTermMonths":12,"requireKycToApprove":true,"payoutGraceDays":3}'::jsonb)
on conflict (key) do nothing;

/* ------------------------------------------------------------ derived timestamps */

-- Keep `cleared_at` truthful without every call site remembering to set it.
create or replace function public.touch_transaction_cleared()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'cleared' and new.cleared_at is null then
    new.cleared_at := now();
  elsif new.status <> 'cleared' then
    new.cleared_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists transactions_touch_cleared on public.transactions;
create trigger transactions_touch_cleared
before insert or update on public.transactions
for each row execute function public.touch_transaction_cleared();

/* -------------------------------------------------------------------------- RLS */

-- The console talks to Supabase with the service role key, which bypasses RLS.
-- RLS is enabled with no permissive policy so anon/authenticated clients cannot
-- read the ledger, documents, or the audit trail.
alter table public.transactions  enable row level security;
alter table public.documents     enable row level security;
alter table public.tasks         enable row level security;
alter table public.team_members  enable row level security;
alter table public.audit_log     enable row level security;
alter table public.app_settings  enable row level security;
