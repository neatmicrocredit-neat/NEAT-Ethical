alter table public.customers add column if not exists onboarding_email_sent_at timestamptz;
alter table public.customers add column if not exists onboarding_email_error text;
