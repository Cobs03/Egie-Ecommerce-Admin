-- ==========================================
-- 🔍 RLS AUDIT SCRIPT (READ-ONLY - SAFE TO RUN)
-- ==========================================
-- This script ONLY reads and reports on your database security
-- It does NOT make any changes to your database
-- Safe to run anytime - won't break anything!
--
-- Run this in your Supabase SQL Editor
-- Copy all the queries below and click RUN
-- ==========================================

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
    ('contact_submissions'),
    ('brands'),
    ('categories')
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
-- 6. PRODUCTS TABLE SECURITY
-- ==========================================
SELECT 
  '=== PRODUCTS TABLE SECURITY ===' as section;

SELECT 
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED on products'
    ELSE '🔴 RLS DISABLED on products - CRITICAL!'
  END as status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'products';

SELECT 
  policyname as policy_name,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
  END as operation
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'products';

-- ==========================================
-- 7. ORDERS TABLE SECURITY
-- ==========================================
SELECT 
  '=== ORDERS TABLE SECURITY ===' as section;

SELECT 
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED on orders'
    ELSE '🔴 RLS DISABLED on orders - CRITICAL!'
  END as status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'orders';

SELECT 
  policyname as policy_name,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
  END as operation
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'orders';

-- ==========================================
-- 8. WEBSITE_SETTINGS TABLE SECURITY
-- ==========================================
SELECT 
  '=== WEBSITE_SETTINGS TABLE SECURITY ===' as section;

SELECT 
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED on website_settings'
    ELSE '🔴 RLS DISABLED on website_settings'
  END as status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'website_settings';

SELECT 
  policyname as policy_name,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
  END as operation
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'website_settings';

-- ==========================================
-- 9. SUMMARY
-- ==========================================
SELECT 
  '=== RLS AUDIT SUMMARY ===' as section,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as rls_enabled_tables,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') as tables_with_policies;

-- ==========================================
-- ✅ AUDIT COMPLETE!
-- ==========================================
-- Review the results above and look for:
-- 🔴 Any table with "RLS DISABLED" 
-- ⚠️ Any table with 0 policy_count
-- ❌ Any critical table without proper policies
--
-- Share the results with your developer for analysis
-- ==========================================
