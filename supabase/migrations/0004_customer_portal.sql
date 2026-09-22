-- Customer portal, funding requests, and loan requests.
alter table public.customers add column if not exists auth_user_id uuid;
alter table public.customers add column if not exists account_number text;
create unique index if not exists customers_auth_user_key on public.customers (auth_user_id) where auth_user_id is not null;
create unique index if not exists customers_account_number_key on public.customers (account_number) where account_number is not null;

create table if not exists public.funding_requests (
  id bigint generated always as identity primary key,
  uuid uuid not null default gen_random_uuid(),
  customer_id bigint not null references public.customers (id) on delete cascade,
  amount numeric(18,2) not null,
  note text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  response_note text
);
create unique index if not exists funding_requests_uuid_key on public.funding_requests (uuid);
create index if not exists funding_requests_customer_idx on public.funding_requests (customer_id, created_at desc);

create table if not exists public.loan_requests (
  id bigint generated always as identity primary key,
  uuid uuid not null default gen_random_uuid(),
  customer_id bigint not null references public.customers (id) on delete cascade,
  amount numeric(18,2) not null,
  purpose text not null,
  term_months integer not null,
  status text not null default 'pending',
  response_due_at timestamptz not null default (now() + interval '48 hours'),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  response_note text
);
create unique index if not exists loan_requests_uuid_key on public.loan_requests (uuid);
create index if not exists loan_requests_customer_idx on public.loan_requests (customer_id, created_at desc);

alter table public.funding_requests enable row level security;
alter table public.loan_requests enable row level security;
