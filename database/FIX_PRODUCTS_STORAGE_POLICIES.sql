-- =====================================================
-- Fix Products Storage Bucket RLS Policies
-- Issue: Managers/Employees cannot upload product images
-- Solution: Allow admin, manager, and employee roles
-- =====================================================

-- Drop existing restrictive policies (admin-only)
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- =====================================================
-- Create new policies allowing admin/manager/employee
-- =====================================================

-- Policy 1: Public can view product images (SELECT)
-- This already exists and should work, but we'll recreate it to be safe
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

CREATE POLICY "Public can view product images" 
ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'products');

-- Policy 2: Admin/Manager/Employee can upload (INSERT)
CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'products' 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (is_admin = true OR role IN ('manager', 'employee'))
    )
);

-- Policy 3: Admin/Manager/Employee can update (UPDATE)
CREATE POLICY "Authenticated users can update product images" 
ON storage.objects
FOR UPDATE 
TO authenticated
USING (
    bucket_id = 'products' 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (is_admin = true OR role IN ('manager', 'employee'))
    )
)
WITH CHECK (
    bucket_id = 'products' 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (is_admin = true OR role IN ('manager', 'employee'))
    )
);

-- Policy 4: Admin/Manager/Employee can delete (DELETE)
CREATE POLICY "Authenticated users can delete product images" 
ON storage.objects
FOR DELETE 
TO authenticated
USING (
    bucket_id = 'products' 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (is_admin = true OR role IN ('manager', 'employee'))
    )
);

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if policies were created successfully
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
AND policyname LIKE '%product%'
ORDER BY policyname;

-- Check if 'products' bucket exists
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'products';

-- =====================================================
-- Testing Guide
-- =====================================================

-- Test 1: Check your current role
-- SELECT id, email, is_admin, role FROM profiles WHERE id = auth.uid();

-- Test 2: Try uploading an image after running this script
-- Go to: Products → Create Product → Upload Image
-- Should work for admin, manager, and employee roles

-- Test 3: If still having issues, check if profiles table has correct role
-- UPDATE profiles SET role = 'manager' WHERE email = 'your-email@example.com';

-- =====================================================
-- Rollback (if needed)
-- =====================================================

-- To revert to admin-only access:
/*
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'products' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'products' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
*/
