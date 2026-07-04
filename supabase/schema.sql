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
  plan_interest    text,          -- monthly | annual | lifetime
  stage            text,          -- result | early_access
  source           text
);
create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_idx on public.leads (created_at desc);
alter table public.leads enable row level security;

-- Purchases (written by the Dodo webhook) ----------------------------------
create table if not exists public.purchases (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  email                text,
  plan                 text,      -- monthly | annual | lifetime
  product_id           text,
  dodo_payment_id      text,
  dodo_subscription_id text,
  status               text,
  amount               numeric,
  raw                  jsonb
);
create index if not exists purchases_email_idx on public.purchases (email);
create index if not exists purchases_created_idx on public.purchases (created_at desc);
alter table public.purchases enable row level security;

-- No public policies on either table: only the server (service_role key) can
-- read/write. The anon/public key cannot touch them.
