-- Messaging for the admin console.
--
-- A thread is one conversation with one customer. Messages hang off it in
-- order. Delivery is deliberately decoupled: a message is written with
-- delivery_status = 'queued' and a dispatcher (Resend or SMTP) later stamps
-- 'sent'/'failed' plus the provider id. That lets the UI ship before the
-- transport is wired.
--
-- Run against the project with:
--   supabase db push
-- or paste into the Supabase SQL editor.

create table if not exists public.message_threads (
  id            bigint generated always as identity primary key,
  uuid          uuid not null default gen_random_uuid(),
  customer_id   bigint not null references public.customers (id) on delete cascade,
  subject       text not null default 'Conversation',
  channel       text not null default 'email',   -- email | sms | whatsapp | note
  status        text not null default 'open',    -- open | awaiting | closed
  last_message_at timestamptz not null default now(),
  last_preview  text,
  created_at    timestamptz not null default now()
);

create unique index if not exists message_threads_uuid_key on public.message_threads (uuid);
create index if not exists message_threads_customer_idx on public.message_threads (customer_id);
create index if not exists message_threads_recent_idx on public.message_threads (last_message_at desc);

create table if not exists public.messages (
  id            bigint generated always as identity primary key,
  uuid          uuid not null default gen_random_uuid(),
  thread_id     bigint not null references public.message_threads (id) on delete cascade,
  direction     text not null default 'outbound', -- outbound | inbound
  author        text,                             -- admin email, or the customer
  body          text not null,
  delivery_status text not null default 'queued', -- queued | sent | delivered | failed
  provider      text,                             -- resend | smtp
  provider_message_id text,
  error         text,
  created_at    timestamptz not null default now(),
  sent_at       timestamptz
);

create index if not exists messages_thread_idx on public.messages (thread_id, created_at);
create index if not exists messages_pending_idx on public.messages (delivery_status) where delivery_status = 'queued';

-- Keep the thread's preview columns in step with its newest message so the
-- inbox list is a single query.
create or replace function public.touch_message_thread()
returns trigger
language plpgsql
as $$
begin
  update public.message_threads
     set last_message_at = new.created_at,
         last_preview    = left(new.body, 180),
         status          = case when new.direction = 'inbound' then 'open' else 'awaiting' end
   where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists messages_touch_thread on public.messages;
create trigger messages_touch_thread
after insert on public.messages
for each row execute function public.touch_message_thread();

-- The console talks to Supabase with the service role key, which bypasses RLS.
-- RLS is enabled with no permissive policy so anon/authenticated clients cannot
-- read customer correspondence.
alter table public.message_threads enable row level security;
alter table public.messages enable row level security;
