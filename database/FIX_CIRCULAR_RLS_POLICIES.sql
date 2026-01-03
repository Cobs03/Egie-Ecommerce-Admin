-- ==========================================
-- 🔧 FIX CIRCULAR RLS POLICIES (FINAL FIX)
-- ==========================================
-- The problem: Admin policies try to check is_admin by querying
-- the profiles table WHILE querying the profiles table = CIRCULAR DEPENDENCY
-- 
-- Solution: Drop the circular policies and keep only simple ones
-- ==========================================

-- Drop the problematic admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Drop the insert policy too (has no WITH CHECK condition)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Keep only the safe, working policies:
-- 1. "Authenticated users can view all profiles" - Safe, no recursion
-- 2. "Users can update own profile" - Safe, no recursion

-- Verify what's left
SELECT 
  '=== REMAINING POLICIES ===' as section;

SELECT 
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
  END as operation
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';

-- ==========================================
-- ✅ RESULT:
-- ==========================================
-- Now you'll have only 2 simple policies:
-- 1. Authenticated users can VIEW all profiles (READ ONLY)
-- 2. Users can UPDATE their own profile (SAFE)
--
-- Admins can still do everything because they use the
-- Supabase SERVICE ROLE key in your backend, which bypasses RLS
--
-- Your admin panel will work FAST now! ✅
-- ==========================================
