-- =====================================================
-- Complete Storage RLS Fix for All Buckets
-- This allows Admin, Manager, and Employee to upload images
-- Run this in: Supabase Dashboard → SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: Fix BUNDLES Bucket Policies
-- =====================================================

-- Drop existing restrictive policies for bundles
DROP POLICY IF EXISTS "Authenticated users can upload to bundles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update bundles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from bundles" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for bundles" ON storage.objects;
DROP POLICY IF EXISTS "Public can view bundle images" ON storage.objects;
DROP POLICY IF EXISTS "Staff can upload to bundles" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update bundle images" ON storage.objects;
DROP POLICY IF EXISTS "Admin and Manager can delete bundle images" ON storage.objects;

-- Policy 1: Public read access for bundles
CREATE POLICY "Public can view bundle images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'bundles');

-- Policy 2: Staff can upload to bundles
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

-- Policy 3: Staff can update bundle images
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
-- PART 2: Fix PRODUCT-IMAGES Bucket Policies (if exists)
-- =====================================================

-- Drop existing restrictive policies for product-images
DROP POLICY IF EXISTS "Authenticated users can upload to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from product-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for product-images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Staff can upload to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin and Manager can delete product images" ON storage.objects;

-- Policy 1: Public read access for product-images
CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Policy 2: Staff can upload to product-images
CREATE POLICY "Staff can upload to product-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
);

-- Policy 3: Staff can update product images
CREATE POLICY "Staff can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
)
WITH CHECK (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
);

-- Policy 4: Only Admin and Manager can delete product images
CREATE POLICY "Admin and Manager can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

-- =====================================================
-- PART 3: Fix ANY OTHER Bucket (generic authenticated)
-- =====================================================

-- This is a fallback for any bucket that doesn't have specific policies
-- Drop existing generic policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Generic policy: All staff can upload to any bucket (except specific ones)
CREATE POLICY "Staff can upload to storage"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'manager', 'employee')
  )
);

-- =====================================================
-- PART 4: Verification Queries
-- =====================================================

-- Check all storage policies
-- Run this separately to verify:
/*
SELECT 
  policyname, 
  bucket_id,
  cmd,
  roles
FROM (
  SELECT 
    policyname,
    cmd,
    roles,
    CASE 
      WHEN qual LIKE '%bundles%' THEN 'bundles'
      WHEN qual LIKE '%product-images%' THEN 'product-images'
      ELSE 'other'
    END as bucket_id
  FROM pg_policies 
  WHERE tablename = 'objects' 
  AND schemaname = 'storage'
) policies
ORDER BY bucket_id, cmd;
*/

-- Check your current role
-- Run this separately to verify your role:
/*
SELECT id, email, role FROM public.profiles WHERE id = auth.uid();
*/

-- =====================================================
-- NOTES:
-- =====================================================
-- 
-- Upload Permissions (INSERT):
-- - Admin: ✅ Can upload
-- - Manager: ✅ Can upload
-- - Employee: ✅ Can upload
--
-- Update Permissions (UPDATE):
-- - Admin: ✅ Can update
-- - Manager: ✅ Can update
-- - Employee: ✅ Can update
--
-- Delete Permissions (DELETE):
-- - Admin: ✅ Can delete
-- - Manager: ✅ Can delete
-- - Employee: ❌ Cannot delete (matches RBAC system)
--
-- Read Permissions (SELECT):
-- - Everyone: ✅ Can view (public access)
--
-- =====================================================
