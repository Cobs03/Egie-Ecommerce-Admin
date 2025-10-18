-- =====================================================
-- Debug: Check Current User Profile and Permissions
-- Run this to diagnose the RLS issue
-- =====================================================

-- 1. Check your current authentication status
SELECT 
    auth.uid() as "Your User ID",
    auth.email() as "Your Email";

-- 2. Check your profile details
SELECT 
    id,
    email,
    is_admin,
    role,
    created_at,
    updated_at
FROM profiles 
WHERE id = auth.uid();

-- 3. Check if profiles table exists and has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Check ALL storage policies on products bucket
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND (policyname LIKE '%product%' OR qual::text LIKE '%products%')
ORDER BY policyname;

-- 5. Check if 'products' bucket exists and is configured correctly
SELECT 
    id, 
    name, 
    public,
    file_size_limit,
    allowed_mime_types,
    created_at 
FROM storage.buckets 
WHERE id = 'products';

-- 6. Test if you can insert into profiles (to verify RLS is working)
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- =====================================================
-- Expected Results
-- =====================================================

-- Query 1 should show: Your UUID and email
-- Query 2 should show: is_admin = true OR role = 'admin'
-- Query 3 should show: columns including 'is_admin' and 'role'
-- Query 4 should show: 4 policies for products bucket
-- Query 5 should show: products bucket with public = true
-- Query 6 should show: profiles table policies

-- =====================================================
-- Common Issues
-- =====================================================

-- Issue 1: is_admin is NULL or FALSE
-- Fix: UPDATE profiles SET is_admin = true WHERE id = auth.uid();

-- Issue 2: role is NULL
-- Fix: UPDATE profiles SET role = 'admin' WHERE id = auth.uid();

-- Issue 3: No profile exists
-- Fix: INSERT INTO profiles (id, email, is_admin, role) 
--      VALUES (auth.uid(), auth.email(), true, 'admin');

-- Issue 4: Products bucket doesn't exist
-- Fix: INSERT INTO storage.buckets (id, name, public) 
--      VALUES ('products', 'products', true);
