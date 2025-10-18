-- =====================================================
-- Fix Storage RLS Policies for All User Roles
-- This allows Admin, Manager, and Employee to upload images
-- Run this in: Supabase Dashboard → SQL Editor
-- =====================================================

-- First, drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can upload to bundles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update bundles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from bundles" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for bundles" ON storage.objects;

-- Policy 1: Allow public read access (anyone can view images)
CREATE POLICY "Public can view bundle images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'bundles');

-- Policy 2: Allow all authenticated staff to upload to bundles
-- This checks if the user exists in profiles table (admin, manager, or employee)
CREATE POLICY "Staff can upload to bundles"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bundles' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
);

-- Policy 3: Allow all authenticated staff to update bundle images
CREATE POLICY "Staff can update bundle images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'bundles' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
)
WITH CHECK (
  bucket_id = 'bundles' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
);

-- Policy 4: Only Admin and Manager can delete bundle images
-- Employees cannot delete (matches your permission system)
CREATE POLICY "Admin and Manager can delete bundle images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'bundles' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

-- =====================================================
-- Verification Query (Run separately to check policies)
-- =====================================================
-- SELECT 
--   schemaname, 
--   tablename, 
--   policyname, 
--   roles,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies 
-- WHERE tablename = 'objects' 
-- AND schemaname = 'storage'
-- AND policyname LIKE '%bundle%';

-- =====================================================
-- Test Upload Query (Optional - test if upload works)
-- =====================================================
-- This will show your current user's role
-- SELECT id, email, role FROM public.profiles WHERE id = auth.uid();
