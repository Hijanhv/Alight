-- Alight — database schema.
-- Idempotent: safe to run/re-run in the Supabase SQL editor.

-- Quiz funnel leads --------------------------------------------------------
create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  email            text not null,
  name             text,
  type_key         text,          -- wired | shutdown | overloaded | steady
  regulation_score int,           -- 0-100
  wired            int,           -- 0-100 sympathetic load
  shutdown         int,           -- 0-100 dorsal load
  plan_interest    text,          -- interest only; no billing yet
  stage            text,          -- result | early_access
  source           text
);
create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_idx on public.leads (created_at desc);

-- Locked down: only the server (service_role key) can read/write.
alter table public.leads enable row level security;
