-- ==========================================
-- 🧪 TEST RLS FIX ON ONE TABLE FIRST
-- ==========================================
-- Let's test on product_views table first (safest)
-- If this works, the others will too
-- ==========================================

-- Step 1: Enable RLS on product_views
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- Step 2: Create simple policies (no circular dependencies)
DROP POLICY IF EXISTS "Product views select policy" ON public.product_views;
DROP POLICY IF EXISTS "Product views insert policy" ON public.product_views;

CREATE POLICY "Product views select policy"
ON public.product_views
FOR SELECT
TO authenticated
USING (true);  -- Simple TRUE, no subquery

CREATE POLICY "Product views insert policy"
ON public.product_views
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Simple TRUE, no subquery

-- Step 3: Verify it works
SELECT 
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
  END as operation
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'product_views';

-- ==========================================
-- ✅ EXPECTED RESULT:
-- ==========================================
-- Should show 2 policies:
-- 1. "Product views select policy" (SELECT)
-- 2. "Product views insert policy" (INSERT)
--
-- ==========================================
-- 🧪 AFTER RUNNING THIS, TEST YOUR ADMIN:
-- ==========================================
-- 1. Go to your admin panel
-- 2. Try logging in
-- 3. Should work normally (< 1 second)
-- 4. If it works, then run FINAL_RLS_FIX_FOR_PRODUCTION.sql
-- ==========================================
