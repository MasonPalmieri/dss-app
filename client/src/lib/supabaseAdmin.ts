// Admin Supabase client — uses service_role key for storage operations
// This bypasses RLS for server-side-equivalent operations in the static frontend
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aqlisniihrcazgxhqgki.supabase.co';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDE0MywiZXhwIjoyMDg4NzI2MTQzfQ.Fyhak2OxvE8uLU25RcHog4QIGjUOJ5KK4WTik2V6Uq0';

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
