-- =====================================================
-- Fix: Storage Bucket Name Mismatch
-- Problem: Policies check 'product-images' but bucket is 'products'
-- Solution: Update policies to use 'products' bucket
-- =====================================================

-- Drop the incorrect policies (checking 'product-images')
DROP POLICY IF EXISTS "Admins and Managers can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and Managers can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and Managers can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view product images" ON storage.objects;

-- Keep these (they're already correct):
-- "Public can view product images" - already uses 'products'
-- "storage_public_read" - already includes 'products'

-- =====================================================
-- Create NEW policies with correct bucket name 'products'
-- =====================================================

-- Policy 1: Admins and Managers can upload to 'products' bucket
CREATE POLICY "Admins and Managers can upload product images" 
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
    bucket_id = 'products' 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);

-- Policy 2: Admins and Managers can update in 'products' bucket
CREATE POLICY "Admins and Managers can update product images" 
ON storage.objects
FOR UPDATE
TO public
USING (
    bucket_id = 'products' 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);

-- Policy 3: Admins and Managers can delete from 'products' bucket
CREATE POLICY "Admins and Managers can delete product images" 
ON storage.objects
FOR DELETE
TO public
USING (
    bucket_id = 'products' 
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);

-- =====================================================
-- Verification Query
-- =====================================================

-- Check all policies now point to 'products' bucket
SELECT 
    policyname, 
    cmd,
    CASE 
        WHEN qual LIKE '%product-images%' THEN '❌ WRONG (product-images)'
        WHEN qual LIKE '%products%' THEN '✅ CORRECT (products)'
        WHEN with_check LIKE '%product-images%' THEN '❌ WRONG (product-images)'
        WHEN with_check LIKE '%products%' THEN '✅ CORRECT (products)'
        ELSE 'N/A'
    END as bucket_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND (policyname LIKE '%product%' OR qual::text LIKE '%product%' OR with_check::text LIKE '%product%')
ORDER BY cmd, policyname;

-- =====================================================
-- Expected Result: All policies should show ✅ CORRECT
-- =====================================================

-- Now test uploading a product image - it should work!
