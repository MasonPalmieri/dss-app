/**
 * DraftSendSign — Database Setup Script
 *
 * Usage: node scripts/setup-db.mjs
 *
 * This script:
 *   1. Creates the demo Supabase Auth user (help@draftsendsign.com / demo)
 *   2. Prints the migration SQL that must be applied to the DB
 *
 * NOTE: Direct PostgreSQL connections (port 5432) to Supabase require IPv6,
 * which is not available in all environments. Apply the SQL in
 *   supabase/migrations/20260323000001_initial_schema.sql
 * via:
 *   - Supabase Dashboard > SQL Editor
 *   - supabase db push --db-url <connection-string>  (if IPv6/pooler available)
 */

const SUPABASE_URL = 'https://aqlisniihrcazgxhqgki.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDE0MywiZXhwIjoyMDg4NzI2MTQzfQ.Fyhak2OxvE8uLU25RcHog4QIGjUOJ5KK4WTik2V6Uq0';

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

async function createDemoUser() {
  console.log('\n── Step 1: Creating demo user ──');

  // Check if demo user already exists
  const listResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    headers,
  });
  const listData = await listResp.json();
  const existing = (listData.users || []).find(u => u.email === 'help@draftsendsign.com');

  if (existing) {
    console.log(`✓ Demo user already exists: ${existing.id}`);
    return existing.id;
  }

  // Create demo user
  const createResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: 'help@draftsendsign.com',
      password: 'demo',
      email_confirm: true,
      user_metadata: {
        full_name: 'Mason Palmieri',
        company: 'DraftSendSign',
        role: 'admin',
        plan: 'professional',
        avatar_initials: 'MP',
      },
    }),
  });

  const createData = await createResp.json();
  if (createData.id) {
    console.log(`✓ Demo user created: ${createData.id}`);
    return createData.id;
  }

  console.error('✗ Failed to create demo user:', JSON.stringify(createData));
  throw new Error('Failed to create demo user');
}

async function insertDemoProfile(userId) {
  console.log('\n── Step 2: Upserting demo profile via REST ──');
  
  // Try to insert/update profile via REST API
  // Note: This will only succeed if the profiles table exists
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      ...headers,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      id: userId,
      full_name: 'Mason Palmieri',
      email: 'help@draftsendsign.com',
      company: 'DraftSendSign',
      role: 'admin',
      plan: 'professional',
      avatar_initials: 'MP',
      two_factor_enabled: false,
    }),
  });

  if (resp.ok || resp.status === 201 || resp.status === 204) {
    console.log('✓ Demo profile upserted');
  } else {
    const body = await resp.text();
    console.log(`ℹ Demo profile insert status: ${resp.status} — ${body.slice(0, 200)}`);
    console.log('  (This is OK if the profiles table has not been created yet)');
  }
}

async function checkTablesExist() {
  console.log('\n── Step 3: Checking if tables exist ──');
  const tables = ['profiles', 'documents', 'recipients', 'document_fields', 'templates', 'contacts', 'team_members', 'audit_logs', 'notifications', 'mass_campaigns', 'mass_signers'];
  for (const table of tables) {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=0`, { headers });
    if (resp.ok) {
      console.log(`  ✓ ${table}`);
    } else {
      const b = await resp.json();
      console.log(`  ✗ ${table}: ${b.message || b.code || resp.status}`);
    }
  }
}

async function run() {
  console.log('DraftSendSign — Database Setup');
  console.log('================================');
  
  try {
    const demoUserId = await createDemoUser();
    await insertDemoProfile(demoUserId);
    await checkTablesExist();

    console.log('\n── Migration SQL ──');
    console.log('The schema SQL is in: supabase/migrations/20260323000001_initial_schema.sql');
    console.log('Apply it via the Supabase Dashboard SQL editor at:');
    console.log('  https://supabase.com/dashboard/project/aqlisniihrcazgxhqgki/sql/new');
    console.log('\n✅ Setup complete!');
  } catch (err) {
    console.error('\n✗ Setup failed:', err.message);
    process.exit(1);
  }
}

run();
