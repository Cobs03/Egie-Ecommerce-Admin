-- ==========================================
-- 🔍 CHECK CURRENT RLS POLICY STATUS
-- ==========================================
-- Run this to verify which policies are active
-- ==========================================

SELECT 
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
  END as operation,
  roles,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY operation;

-- ==========================================
-- ✅ EXPECTED RESULT (after fix):
-- ==========================================
-- You should see ONLY 2 policies:
-- 1. "Authenticated users can view all profiles" (SELECT)
-- 2. "Users can update own profile" (UPDATE)
--
-- If you see MORE than 2, the circular policies are still there!
-- ==========================================
