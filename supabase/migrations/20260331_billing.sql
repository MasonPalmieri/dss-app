-- Billing columns for Stripe integration
-- Run this migration manually in your Supabase SQL editor or via the CLI

alter table public.profiles 
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text not null default 'trial',
  add column if not exists trial_ends_at timestamptz not null default (now() + interval '14 days'),
  add column if not exists current_period_end timestamptz;
