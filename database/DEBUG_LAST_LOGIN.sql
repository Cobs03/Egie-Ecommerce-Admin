-- =====================================================
-- Debug and Fix Last Login Issues
-- Run this in: Supabase Dashboard → SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Check if last_login column exists
-- =====================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'last_login';

-- Expected result: Should show last_login | timestamp with time zone | YES
-- If no result, run ADD_LAST_LOGIN_TRACKING.sql first

-- =====================================================
-- STEP 2: Check current last_login values
-- =====================================================
SELECT 
  id,
  email,
  full_name,
  role,
  last_login,
  created_at,
  CASE 
    WHEN last_login IS NULL THEN '❌ NULL (Never logged in)'
    WHEN last_login > NOW() - INTERVAL '1 hour' THEN '✅ Active now'
    WHEN last_login > NOW() - INTERVAL '24 hours' THEN '✅ Active today'
    ELSE '⚠️ Inactive'
  END as login_status
FROM public.profiles
ORDER BY role, last_login DESC NULLS LAST
LIMIT 20;

-- =====================================================
-- STEP 3: Fix NULL values - Set to created_at
-- =====================================================
-- This sets last_login to created_at for all users who don't have it
UPDATE public.profiles
SET last_login = created_at
WHERE last_login IS NULL;

-- Check how many rows were updated:
-- Should return count of users that had NULL last_login

-- =====================================================
-- STEP 4: Manually update last_login for current user
-- =====================================================
-- This will set YOUR last_login to NOW
UPDATE public.profiles
SET last_login = NOW()
WHERE id = auth.uid();

-- Verify it worked:
SELECT 
  email,
  role,
  last_login,
  NOW() - last_login as time_since_login
FROM public.profiles
WHERE id = auth.uid();

-- =====================================================
-- STEP 5: Check RPC function exists
-- =====================================================
SELECT 
  routine_schema,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'update_user_last_login';

-- Expected: Should show 1 row with routine_type = 'FUNCTION'
-- If no result, the RPC function wasn't created

-- =====================================================
-- STEP 6: Test RPC function
-- =====================================================
-- Call the function to update your last_login
SELECT public.update_user_last_login(auth.uid());

-- Verify it worked:
SELECT 
  email,
  last_login,
  last_login AT TIME ZONE 'UTC' as last_login_utc
FROM public.profiles
WHERE id = auth.uid();

-- =====================================================
-- STEP 7: Check RLS policies on profiles table
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY cmd;

-- Make sure there's at least one policy allowing UPDATE for authenticated users

-- =====================================================
-- STEP 8: If RLS is blocking updates, add this policy
-- =====================================================
-- Only run if UPDATE policies are missing or too restrictive

-- Drop old restrictive policy if exists
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create new policy allowing authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Also ensure authenticated users can SELECT their profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- User can see their own profile
  id = auth.uid()
  OR
  -- Or if they're admin/manager, they can see all profiles
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
);

-- =====================================================
-- STEP 9: Verify everything works
-- =====================================================
-- Run this query and check the results:
SELECT 
  COUNT(*) as total_users,
  COUNT(last_login) as users_with_login,
  COUNT(*) - COUNT(last_login) as users_without_login,
  MAX(last_login) as most_recent_login,
  MIN(last_login) as oldest_login
FROM public.profiles;

-- Expected results:
-- total_users: Should match your user count
-- users_with_login: Should equal total_users after STEP 3
-- users_without_login: Should be 0 after STEP 3
-- most_recent_login: Should be recent timestamp
-- oldest_login: Should be your oldest user's created_at

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- After running all steps above:
-- 1. Log out of your admin panel
-- 2. Log back in
-- 3. Go to Users page
-- 4. Last Login column should now show times
--
-- If still not working:
-- - Check browser console for JavaScript errors
-- - Verify dateUtils.js was created correctly
-- - Check if User.jsx imports formatLastLogin
-- - Clear browser cache and hard refresh (Ctrl+F5)
--
-- =====================================================
