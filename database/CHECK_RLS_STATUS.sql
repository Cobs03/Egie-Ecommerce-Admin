-- ==========================================
-- 🔍 CHECK RLS POLICIES STATUS
-- ==========================================
-- Run this to see current RLS status and policies
-- ==========================================

-- Check if RLS is enabled on profiles
SELECT 
  '=== PROFILES TABLE RLS STATUS ===' as section;

SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS ENABLED' ELSE '❌ RLS DISABLED' END as status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- List all policies on profiles table
SELECT 
  '=== PROFILES TABLE POLICIES ===' as section;

SELECT 
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as operation,
  roles[1] as role,
  qual as condition
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- ==========================================
-- 📊 INTERPRETATION:
-- ==========================================
-- If RLS is ENABLED but you see errors:
-- - Policies might be too restrictive
-- - Run EMERGENCY_DISABLE_RLS.sql to disable RLS temporarily
--
-- If RLS is DISABLED:
-- - Your admin login should work fine
-- - This is the current recommended state until we fix policies
-- ==========================================
