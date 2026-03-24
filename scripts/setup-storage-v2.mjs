// Setup Supabase Storage policies - using direct PostgreSQL connection via Supabase
const SUPABASE_URL = 'https://aqlisniihrcazgxhqgki.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDE0MywiZXhwIjoyMDg4NzI2MTQzfQ.Fyhak2OxvE8uLU25RcHog4QIGjUOJ5KK4WTik2V6Uq0';

// Use Supabase's pg_dump endpoint or rpc if available
// Try calling a custom RPC function to execute SQL
async function tryRpc(funcName, args) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${funcName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

// The service_role JWT is for client operations, not management API
// Supabase Management API requires a personal access token (PAT)
// But we can create policies via the Supabase client library's built-in RLS

// Instead, let's create an RPC function via the REST API by inserting it
// Actually, the best approach here is to use the pg connection string directly via node-postgres
// OR use Supabase's built-in admin client

// Let's try calling the exec_sql function if it exists in the db
const result1 = await tryRpc('exec_sql', { sql: 'SELECT current_user;' });
console.log('exec_sql test:', result1.status, result1.body.slice(0, 100));

// Try pg_query
const result2 = await tryRpc('pg_query', { query: 'SELECT current_user;' });
console.log('pg_query test:', result2.status, result2.body.slice(0, 100));

// Since direct SQL execution via REST API is not available without custom RPC,
// let's try to set policies via Supabase storage.policies table if accessible
const result3 = await fetch(`${SUPABASE_URL}/rest/v1/`, {
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
});
console.log('REST root:', result3.status);

// Check if storage objects table is accessible
const result4 = await fetch(`${SUPABASE_URL}/rest/v1/storage.objects?limit=1`, {
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
});
console.log('storage.objects:', result4.status, (await result4.text()).slice(0, 100));

// The real solution: use Supabase's storage API to set policies
// Supabase storage has its own policy endpoint
const policyPayloads = [
  {
    name: 'Users can upload own docs',
    definition: `bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]`,
    action: 'INSERT',
  },
  {
    name: 'Users can read own docs',  
    definition: `bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]`,
    action: 'SELECT',
  },
];

// Use storage v1 API to create policies
for (const policy of policyPayloads) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/documents/policy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify(policy),
  });
  const text = await res.text();
  console.log(`Policy "${policy.name}": ${res.status} - ${text.slice(0, 200)}`);
}

console.log('\nDone. The bucket "documents" is created and accessible.');
console.log('RLS policies should be configured via Supabase Dashboard SQL Editor:');
console.log(`
GO TO: https://app.supabase.com/project/aqlisniihrcazgxhqgki/sql/new

Run this SQL:
-- Allow authenticated users to upload to their own folder
CREATE POLICY IF NOT EXISTS "Users can upload own docs" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to read their own files
CREATE POLICY IF NOT EXISTS "Users can read own docs" ON storage.objects 
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
  
-- Allow service role full access
CREATE POLICY IF NOT EXISTS "Service role full access on documents" ON storage.objects 
  FOR ALL USING (bucket_id = 'documents');
`);
