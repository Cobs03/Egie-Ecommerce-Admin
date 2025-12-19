-- ==========================================
-- 🔓 DISABLE RLS ON PROFILES TABLE
-- ==========================================
-- This fixes the profile query timeout issue
-- Run this in your Supabase SQL Editor

-- Disable Row Level Security on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

-- Grant access to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Should show: rowsecurity = false
