-- =====================================================
-- Supabase Storage Policies Setup Script
-- Run this AFTER creating the bundles bucket
-- Run this in: Supabase Dashboard → SQL Editor
-- =====================================================

-- Policy 1: Allow public read access (anyone can view images)
CREATE POLICY "Public Access for bundles"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'bundles');

-- Policy 2: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to bundles"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bundles');

-- Policy 3: Allow authenticated users to update
CREATE POLICY "Authenticated users can update bundles"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'bundles')
WITH CHECK (bucket_id = 'bundles');

-- Policy 4: Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete from bundles"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'bundles');

-- =====================================================
-- Verification Query (Run separately to check)
-- =====================================================
-- SELECT 
--   schemaname, 
--   tablename, 
--   policyname, 
--   roles,
--   cmd 
-- FROM pg_policies 
-- WHERE tablename = 'objects' 
-- AND schemaname = 'storage'
-- AND policyname LIKE '%bundles%';
