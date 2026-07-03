-- Alight — leads table for the quiz funnel.
-- Run this in the Supabase SQL editor (Dashboard -> SQL -> New query).

create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  email            text not null,
  name             text,
  type_key         text,          -- wired | shutdown | overloaded | steady
  regulation_score int,           -- 0-100
  wired            int,           -- 0-100 sympathetic load
  shutdown         int,           -- 0-100 dorsal load
  plan_interest    text,          -- monthly | annual | lifetime
  stage            text,          -- result | early_access
  source           text
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_idx on public.leads (created_at desc);

-- Lock the table down: only the server (service_role key) can read/write.
-- No public policies are added, so the anon/public key cannot touch this table.
alter table public.leads enable row level security;
