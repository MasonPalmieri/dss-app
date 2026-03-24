import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aqlisniihrcazgxhqgki.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbGlzbmlpaHJjYXpneGhxZ2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTAxNDMsImV4cCI6MjA4ODcyNjE0M30.WvM0hDBEoTq6X4QT90Dk3i6_eyrFXJrQ996gRwmxlDg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
