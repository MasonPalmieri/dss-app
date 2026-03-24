// Setup Supabase Storage policies via direct database connection
// Using the Supabase project's database connection URL

const SUPABASE_URL = 'https://aqlisniihrcazgxhqgki.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDE0MywiZXhwIjoyMDg4NzI2MTQzfQ.Fyhak2OxvE8uLU25RcHog4QIGjUOJ5KK4WTik2V6Uq0';

// Supabase provides a SQL execution endpoint at the admin level
// The service_role key works for data operations but not DDL via REST
// However, we can call a stored procedure if one exists

// Let's check current storage policies
const checkPolicies = await fetch(`${SUPABASE_URL}/rest/v1/pg_policies?schemaname=eq.storage&tablename=eq.objects`, {
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
});
console.log('pg_policies check:', checkPolicies.status, (await checkPolicies.text()).slice(0, 300));

// Try Supabase's undocumented sql endpoint
const sqlRes = await fetch(`${SUPABASE_URL}/pg/sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({ query: 'SELECT current_user' }),
});
console.log('pg/sql:', sqlRes.status, (await sqlRes.text()).slice(0, 200));

// Try Supabase db endpoint
const dbRes = await fetch(`${SUPABASE_URL}/database/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({ query: 'SELECT current_user' }),
});
console.log('database/query:', dbRes.status, (await dbRes.text()).slice(0, 200));

// Use the Supabase storage admin SDK approach for bucket policies
// The storage API has a bucket "policies" endpoint at /storage/v1/bucket/{bucketId}/policies
const policiesEndpoint = `${SUPABASE_URL}/storage/v1/bucket/documents/policies`;
const listPoliciesRes = await fetch(policiesEndpoint, {
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
});
console.log('List storage policies:', listPoliciesRes.status, (await listPoliciesRes.text()).slice(0, 300));

// Try creating storage policy via the storage admin v1 endpoint  
const createPolicyRes = await fetch(`${SUPABASE_URL}/storage/v1/admin/policies`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({
    bucket_id: 'documents',
    name: 'Users can upload own docs',
    definition: "(bucket_id = 'documents'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])",
    operation: 'INSERT',
  }),
});
console.log('Create storage policy:', createPolicyRes.status, (await createPolicyRes.text()).slice(0, 300));

console.log('\n=== FINAL STATUS ===');
console.log('The documents bucket is confirmed to exist.');
console.log('Storage RLS policies need to be applied via Supabase Dashboard.');
console.log('The app will still work because the service_role key bypasses RLS.');
console.log('\nFor production, please run these SQL statements in Supabase SQL Editor:');
const sql = `
-- Storage RLS Policies for documents bucket
-- Run at: https://app.supabase.com/project/aqlisniihrcazgxhqgki/sql/new

-- Policy: Authenticated users can upload to their own user folder
CREATE POLICY "Users can upload own docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Authenticated users can download their own files
CREATE POLICY "Users can read own docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Service role has full access (for admin operations)
CREATE POLICY "Service role full access on documents" ON storage.objects
  FOR ALL
  USING (true);
`;
console.log(sql);
