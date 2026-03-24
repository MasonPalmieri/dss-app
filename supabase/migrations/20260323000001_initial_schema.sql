-- DraftSendSign — Initial Schema
-- Drop everything first to ensure clean state
drop table if exists public.mass_signers cascade;
drop table if exists public.mass_campaigns cascade;
drop table if exists public.notifications cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.team_members cascade;
drop table if exists public.contacts cascade;
drop table if exists public.templates cascade;
drop table if exists public.document_fields cascade;
drop table if exists public.recipients cascade;
drop table if exists public.documents cascade;
drop table if exists public.profiles cascade;

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null default '',
  email text not null default '',
  company text not null default '',
  role text not null default 'admin',
  plan text not null default 'starter',
  avatar_initials text not null default '',
  two_factor_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Documents
create table public.documents (
  id bigserial primary key,
  title text not null default 'Untitled Document',
  status text not null default 'draft',
  sender_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null default '',
  file_size text not null default '',
  file_path text,
  subject text not null default '',
  message text not null default '',
  expires_at timestamptz,
  sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  template_id bigint,
  reminder_frequency text not null default '3days',
  tags text[] not null default '{}'
);

-- Recipients
create table public.recipients (
  id bigserial primary key,
  document_id bigint references public.documents(id) on delete cascade not null,
  name text not null default '',
  email text not null default '',
  role text not null default 'signer',
  signing_order integer not null default 1,
  status text not null default 'pending',
  auth_method text not null default 'none',
  auth_phone text,
  signed_at timestamptz,
  viewed_at timestamptz,
  signing_token text not null unique default gen_random_uuid()::text,
  color text not null default '#3b82f6'
);

-- Document fields
create table public.document_fields (
  id bigserial primary key,
  document_id bigint references public.documents(id) on delete cascade not null,
  recipient_id bigint references public.recipients(id) on delete set null,
  type text not null default 'signature',
  label text not null default 'Signature',
  required boolean not null default true,
  x numeric not null default 0,
  y numeric not null default 0,
  width numeric not null default 200,
  height numeric not null default 50,
  page integer not null default 1,
  value text
);

-- Templates
create table public.templates (
  id bigserial primary key,
  name text not null default '',
  description text not null default '',
  creator_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null default '',
  file_path text,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Contacts
create table public.contacts (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null default '',
  email text not null default '',
  organization text not null default '',
  phone text,
  created_at timestamptz not null default now()
);

-- Team members
create table public.team_members (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  invited_email text not null default '',
  invited_name text not null default '',
  role text not null default 'member',
  status text not null default 'pending',
  invited_at timestamptz not null default now(),
  joined_at timestamptz
);

-- Audit logs
create table public.audit_logs (
  id bigserial primary key,
  document_id bigint references public.documents(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  recipient_id bigint references public.recipients(id) on delete set null,
  action text not null,
  actor_name text not null default '',
  actor_email text not null default '',
  ip_address text not null default '',
  user_agent text not null default '',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Notifications
create table public.notifications (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  document_id bigint references public.documents(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Mass signature campaigns
create table public.mass_campaigns (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  document_name text not null default '',
  file_path text,
  status text not null default 'active',
  signer_count integer not null default 0,
  public_token text not null unique default gen_random_uuid()::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mass signers
create table public.mass_signers (
  id bigserial primary key,
  campaign_id bigint references public.mass_campaigns(id) on delete cascade not null,
  full_name text not null,
  signed_at timestamptz not null default now(),
  ip_address text not null default '',
  signature_data text not null default ''
);

-- ── RLS ──────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.recipients enable row level security;
alter table public.document_fields enable row level security;
alter table public.templates enable row level security;
alter table public.contacts enable row level security;
alter table public.team_members enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.mass_campaigns enable row level security;
alter table public.mass_signers enable row level security;

-- Profiles
create policy "profiles_own" on public.profiles for all using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Documents
create policy "documents_own" on public.documents for all using (auth.uid() = sender_id);

-- Recipients: owner full access + public read by token for signers
create policy "recipients_own" on public.recipients for all using (
  exists (select 1 from public.documents d where d.id = document_id and d.sender_id = auth.uid())
);
create policy "recipients_public_read" on public.recipients for select using (true);

-- Document fields: owner full access + public read for signers
create policy "fields_own" on public.document_fields for all using (
  exists (select 1 from public.documents d where d.id = document_id and d.sender_id = auth.uid())
);
create policy "fields_public_read" on public.document_fields for select using (true);
create policy "fields_public_update" on public.document_fields for update using (true);

-- Templates
create policy "templates_own" on public.templates for all using (auth.uid() = creator_id);

-- Contacts
create policy "contacts_own" on public.contacts for all using (auth.uid() = user_id);

-- Team
create policy "team_own" on public.team_members for all using (auth.uid() = user_id);

-- Audit logs: owner read, anyone can insert (for signing events)
create policy "audit_own_read" on public.audit_logs for select using (auth.uid() = user_id);
create policy "audit_insert_all" on public.audit_logs for insert with check (true);

-- Notifications
create policy "notifications_own" on public.notifications for all using (auth.uid() = user_id);

-- Mass campaigns: owner full access + public read
create policy "campaigns_own" on public.mass_campaigns for all using (auth.uid() = user_id);
create policy "campaigns_public_read" on public.mass_campaigns for select using (true);
create policy "campaigns_public_update" on public.mass_campaigns for update using (true);

-- Mass signers: fully public (anyone can sign + read)
create policy "signers_public" on public.mass_signers for all using (true);

-- Recipients: public update for signing flow
create policy "recipients_public_update" on public.recipients for update using (true);

-- ── Storage buckets ───────────────────────────────────
insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('templates', 'templates', false) on conflict do nothing;
