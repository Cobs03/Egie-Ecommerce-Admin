-- ==========================================
-- 🚨 EMERGENCY: DISABLE RLS TO RESTORE ACCESS
-- ==========================================
-- Run this IMMEDIATELY to restore admin panel access
-- This will temporarily disable RLS so you can log in
-- ==========================================

-- Disable RLS on the 4 tables we enabled
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'admin_logs', 'orders', 'product_views')
ORDER BY tablename;

-- ==========================================
-- ✅ RLS DISABLED - YOU CAN NOW LOG IN
-- ==========================================
-- Your admin panel should work now
-- We'll fix the RLS policies properly after you can access the system
-- ==========================================
