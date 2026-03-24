import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const sql = `
-- Create tables here
create table if not exists public.profiles (
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
select 'done'
`

Deno.serve(async (req) => {
  return new Response(JSON.stringify({ status: 'called' }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
