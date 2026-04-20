-- ============================================================
-- Run this in Supabase SQL Editor BEFORE opening public signup
-- It auto-creates a profiles row for every new auth user
-- and triggers a welcome email via the send-welcome API
-- ============================================================

-- 1. Function: auto-create profile on new auth user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    plan,
    subscription_status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'starter',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Trigger: fire on every new auth.users row
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Verify (run separately to check)
-- SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;
-- SELECT * FROM public.profiles ORDER BY created_at DESC LIMIT 5;
