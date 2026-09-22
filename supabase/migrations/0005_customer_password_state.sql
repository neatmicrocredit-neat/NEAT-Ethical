alter table public.customers add column if not exists has_usable_password boolean not null default true;
alter table public.customers add column if not exists password_changed_at timestamptz;
