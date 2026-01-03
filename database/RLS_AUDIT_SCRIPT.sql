-- ==========================================
-- 🔒 RLS POLICY AUDIT SCRIPT
-- ==========================================
-- Run this in your Supabase SQL Editor
-- This will show you which tables have RLS enabled
-- and what policies are configured

-- ==========================================
-- 1. CHECK RLS STATUS FOR ALL TABLES
-- ==========================================
SELECT 
  schemaname as schema,
  tablename as table_name,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY 
  CASE WHEN rowsecurity THEN 0 ELSE 1 END,
  tablename;

-- ==========================================
-- 2. LIST ALL RLS POLICIES
-- ==========================================
SELECT 
  tablename as table_name,
  policyname as policy_name,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as command,
  CASE roles[1]
    WHEN 'public' THEN 'PUBLIC (anyone)'
    WHEN 'authenticated' THEN 'AUTHENTICATED'
    WHEN 'anon' THEN 'ANONYMOUS'
    ELSE roles[1]
  END as role,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ HAS CONDITION'
    ELSE '⚠️ NO CONDITION (allows all)'
  END as has_condition
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==========================================
-- 3. CRITICAL TABLES SECURITY CHECK
-- ==========================================
-- Check if critical tables have RLS enabled
SELECT 
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = t.table_name 
      AND rowsecurity = true
    ) THEN '✅ RLS ENABLED'
    ELSE '🔴 RLS DISABLED - CRITICAL!'
  END as security_status,
  (
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = t.table_name
  ) as policy_count
FROM (
  VALUES 
    ('profiles'),
    ('products'),
    ('orders'),
    ('admin_activity_logs'),
    ('website_settings'),
    ('website_policies'),
    ('contact_submissions')
) AS t(table_name)
ORDER BY table_name;

-- ==========================================
-- 4. FIND TABLES WITHOUT RLS POLICIES
-- ==========================================
-- These tables have RLS enabled but NO policies
-- (will block ALL access even to authenticated users)
SELECT 
  t.tablename as table_name,
  '⚠️ NO POLICIES CONFIGURED' as warning,
  'Table is locked - no one can access it!' as impact
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND NOT EXISTS (
    SELECT 1 
    FROM pg_policies p 
    WHERE p.schemaname = 'public' 
    AND p.tablename = t.tablename
  )
ORDER BY t.tablename;

-- ==========================================
-- 5. PROFILES TABLE SECURITY (CRITICAL)
-- ==========================================
-- Check profiles table specifically
SELECT 
  '=== PROFILES TABLE SECURITY ===' as section;

SELECT 
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED on profiles'
    ELSE '🔴 RLS DISABLED on profiles - CRITICAL!'
  END as status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

SELECT 
  policyname as policy_name,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
  END as operation,
  qual as condition
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';

-- ==========================================
-- 6. RECOMMENDED POLICIES (if missing)
-- ==========================================
-- Uncomment and run these if policies are missing

/*
-- ====================================
-- PROFILES TABLE POLICIES (EXAMPLE)
-- ====================================

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Only admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  )
);

-- Only admins can update user roles
CREATE POLICY "Admins can update user roles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  )
);

-- Only admins can delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  )
);

-- ====================================
-- PRODUCTS TABLE POLICIES (EXAMPLE)
-- ====================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view products
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
TO authenticated
USING (true);

-- Only authenticated admins/employees can insert products
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'manager', 'employee'))
  )
);

-- Only authenticated admins/employees can update products
CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'manager', 'employee'))
  )
);

-- Only admins can delete products
CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  )
);

-- ====================================
-- ORDERS TABLE POLICIES (EXAMPLE)
-- ====================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'manager', 'employee'))
  )
);

-- Admins can update orders
CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'manager', 'employee'))
  )
);

-- ====================================
-- WEBSITE_SETTINGS POLICIES (EXAMPLE)
-- ====================================

ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read settings"
ON public.website_settings FOR SELECT
TO authenticated
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
ON public.website_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  )
);

*/

-- ==========================================
-- 7. TESTING QUERIES
-- ==========================================
-- Test if current user is admin (run after policies created)
/*
SELECT 
  id,
  email,
  is_admin,
  role,
  CASE 
    WHEN is_admin = true OR role = 'admin' THEN '✅ IS ADMIN'
    ELSE '❌ NOT ADMIN'
  END as admin_status
FROM public.profiles
WHERE id = auth.uid();
*/

-- ==========================================
-- 8. SUMMARY
-- ==========================================
SELECT 
  '=== RLS AUDIT SUMMARY ===' as section,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as rls_enabled_tables,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') as tables_with_policies;
