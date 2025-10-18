-- =====================================================
-- Add Last Login Tracking to Profiles Table
-- Run this in: Supabase Dashboard → SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: Add last_login column (if not exists)
-- =====================================================

-- Add last_login column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_login
ON public.profiles(last_login DESC);

-- =====================================================
-- PART 2: Create function to update last_login
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_last_login();

-- Create function to update last_login timestamp
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_login to current timestamp
  NEW.last_login := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 3: Create trigger (optional - for automatic updates)
-- =====================================================

-- This trigger will auto-update last_login when profile is updated
-- You can also update it manually from your app
DROP TRIGGER IF EXISTS update_last_login_trigger ON public.profiles;

-- Uncomment below if you want automatic updates on ANY profile update
-- (Not recommended - better to update manually on actual login)
/*
CREATE TRIGGER update_last_login_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_last_login();
*/

-- =====================================================
-- PART 4: Create RPC function for manual last_login update
-- =====================================================

-- Drop existing function if it exists (try all possible signatures)
DROP FUNCTION IF EXISTS public.update_user_last_login(UUID);
DROP FUNCTION IF EXISTS public.update_user_last_login;

-- Create RPC function that can be called from your app
CREATE OR REPLACE FUNCTION public.update_user_last_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET last_login = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_last_login(UUID) TO authenticated;

-- =====================================================
-- PART 5: Set initial last_login for existing users
-- =====================================================

-- Set last_login to created_at for users who don't have it yet
UPDATE public.profiles
SET last_login = created_at
WHERE last_login IS NULL;

-- =====================================================
-- PART 6: Verification Queries
-- =====================================================

-- Check if column exists
-- Run this separately to verify:
/*
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name = 'last_login';
*/

-- View all users with their last login
-- Run this separately to check data:
/*
SELECT
  id,
  email,
  full_name,
  role,
  last_login,
  CASE
    WHEN last_login IS NULL THEN 'Never'
    WHEN last_login > NOW() - INTERVAL '1 hour' THEN 'Active now'
    WHEN last_login > NOW() - INTERVAL '24 hours' THEN 'Active today'
    WHEN last_login > NOW() - INTERVAL '48 hours' THEN 'Active yesterday'
    WHEN last_login > NOW() - INTERVAL '7 days' THEN 'Active this week'
    WHEN last_login > NOW() - INTERVAL '30 days' THEN 'Active this month'
    ELSE 'Inactive'
  END as login_status,
  created_at
FROM public.profiles
ORDER BY last_login DESC NULLS LAST;
*/

-- Test the RPC function
-- Run this separately to test:
/*
SELECT public.update_user_last_login(auth.uid());
SELECT last_login FROM public.profiles WHERE id = auth.uid();
*/

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- How to update last_login from your app:
-- ----------------------------------------
--
-- 1. When user logs in successfully:
--    await supabase.rpc('update_user_last_login', { user_id: user.id });
--
-- 2. Or update directly:
--    await supabase
--      .from('profiles')
--      .update({ last_login: new Date().toISOString() })
--      .eq('id', user.id);
--
-- 3. The last_login column will show:
--    - NULL or timestamp value
--    - Display as "Never" if NULL
--    - Display as relative time if set (e.g., "Active yesterday")
--
-- =====================================================
