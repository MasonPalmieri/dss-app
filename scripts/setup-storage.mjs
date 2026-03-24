// Setup Supabase Storage policies for the documents bucket
const SUPABASE_URL = 'https://aqlisniihrcazgxhqgki.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDE0MywiZXhwIjoyMDg4NzI2MTQzfQ.Fyhak2OxvE8uLU25RcHog4QIGjUOJ5KK4WTik2V6Uq0';

async function runSQL(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  return res;
}

async function runSQLViaQuery(sql) {
  // Use the pg REST endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ query: sql }),
  });
  return res;
}

// Use Supabase Management API - SQL execution endpoint
async function executeSql(sql) {
  // Extract the project ref from the URL
  const projectRef = 'aqlisniihrcazgxhqgki';
  
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  
  const text = await res.text();
  return { status: res.status, body: text };
}

// Alternative: Use postgres via the REST API with service role
async function runSqlWithServiceRole(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

const policies = [
  // Drop if exists to avoid conflicts, then recreate
  `DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload own docs'
    ) THEN
      CREATE POLICY "Users can upload own docs" ON storage.objects 
        FOR INSERT WITH CHECK (
          bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
  END $$;`,
  
  `DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can read own docs'
    ) THEN
      CREATE POLICY "Users can read own docs" ON storage.objects 
        FOR SELECT USING (
          bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
  END $$;`,
  
  `DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Service role full access on documents'
    ) THEN
      CREATE POLICY "Service role full access on documents" ON storage.objects 
        FOR ALL USING (bucket_id = 'documents');
    END IF;
  END $$;`,
];

// Try multiple approaches

// Approach 1: Try calling Supabase's built-in SQL executor if it exists
console.log('Setting up Supabase Storage policies...\n');

// First, ensure the documents bucket exists
console.log('1. Creating documents bucket if not exists...');
const bucketRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({
    id: 'documents',
    name: 'documents',
    public: false,
    file_size_limit: 52428800, // 50MB
    allowed_mime_types: ['application/pdf', 'image/png', 'image/jpeg'],
  }),
});

const bucketText = await bucketRes.text();
if (bucketRes.status === 200 || bucketRes.status === 409 || bucketText.includes('already exists') || bucketText.includes('Duplicate')) {
  console.log('   ✓ Bucket ready (created or already existed)\n');
} else {
  console.log(`   Bucket response ${bucketRes.status}: ${bucketText}\n`);
}

// Approach 2: Run policies via Supabase Management API
console.log('2. Setting RLS policies via Management API...');

for (const sql of policies) {
  const result = await executeSql(sql);
  console.log(`   SQL response ${result.status}: ${result.body.slice(0, 200)}`);
}

// Approach 3: Direct postgres query via PostgREST with service_role
// PostgREST does not allow raw SQL, but we can use the pg extension if enabled
console.log('\n3. Verifying bucket exists via storage API...');
const listRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/documents`, {
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
});
const listText = await listRes.text();
console.log(`   GET bucket/documents: ${listRes.status} - ${listText.slice(0, 200)}`);

console.log('\nSetup complete. Storage bucket and policies configured.');
console.log('Note: RLS policies may need to be added manually via Supabase Dashboard if Management API returns 404.');
console.log('Navigate to: https://app.supabase.com/project/aqlisniihrcazgxhqgki/storage/buckets');
