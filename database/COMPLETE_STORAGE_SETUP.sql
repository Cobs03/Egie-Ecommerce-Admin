-- ========================================
-- COMPLETE SETUP SCRIPT
-- Category Image Upload Feature
-- ========================================
-- Run this entire script in Supabase SQL Editor
-- This will set up everything you need!

-- ========================================
-- STEP 1: Create Storage Bucket
-- ========================================

-- Create the 'products' bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products', 
  'products', 
  true,  -- IMPORTANT: Must be public!
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Verify bucket was created
SELECT 
  '✅ Bucket created/updated' as status,
  id, 
  name, 
  public,
  file_size_limit / 1024 / 1024 as max_size_mb,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'products';

-- ========================================
-- STEP 2: Add image_url Column
-- ========================================

-- Add image_url column to product_categories
ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify column was added
SELECT 
  '✅ Column added' as status,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_categories' 
AND column_name = 'image_url';

-- ========================================
-- STEP 3: Create Storage Policies
-- ========================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view category images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete category images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update category images" ON storage.objects;

-- Policy 1: Allow everyone to READ/VIEW images (PUBLIC ACCESS)
CREATE POLICY "Anyone can view category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Policy 2: Allow authenticated users to UPLOAD images
CREATE POLICY "Authenticated users can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to DELETE images
CREATE POLICY "Authenticated users can delete category images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to UPDATE images
CREATE POLICY "Authenticated users can update category images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- Verify policies were created
SELECT 
  '✅ Policies created' as status,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%category images%';

-- ========================================
-- STEP 4: Verification Tests
-- ========================================

-- Test 1: Check if product_categories table is ready
SELECT 
  '✅ Table structure verified' as status,
  id,
  name,
  slug,
  image_url,
  is_active
FROM product_categories
LIMIT 3;

-- Test 2: Count categories without images
SELECT 
  '📊 Categories without images' as status,
  COUNT(*) as count
FROM product_categories
WHERE image_url IS NULL;

-- Test 3: Count categories with images
SELECT 
  '📊 Categories with images' as status,
  COUNT(*) as count
FROM product_categories
WHERE image_url IS NOT NULL;

-- ========================================
-- STEP 5: Display Final Status
-- ========================================

-- Summary of setup
SELECT 
  '🎉 SETUP COMPLETE! Ready to use.' as message,
  (SELECT COUNT(*) FROM storage.buckets WHERE name = 'products' AND public = true) as bucket_ready,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'product_categories' AND column_name = 'image_url') as column_ready,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%category images%') as policies_ready;

-- ========================================
-- TROUBLESHOOTING QUERIES
-- ========================================

-- If you get errors, run these to debug:

-- Check bucket permissions
-- SELECT * FROM storage.buckets WHERE name = 'products';

-- Check all storage policies
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check if image_url column exists
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product_categories';

-- List all files in storage (after uploading some)
-- SELECT * FROM storage.objects WHERE bucket_id = 'products' ORDER BY created_at DESC LIMIT 10;

-- ========================================
-- NEXT STEPS
-- ========================================

/*
After running this script successfully:

1. ✅ Go to Admin Panel → Product Upload
2. ✅ Click "ADD NEW COMPONENT"
3. ✅ Fill in: Name, Description
4. ✅ Click "Upload Image" and select an image
5. ✅ Preview should show
6. ✅ Click "Add Component"
7. ✅ Success notification should appear
8. ✅ Go to Storage in Supabase Dashboard
9. ✅ Check products/categories/ folder
10. ✅ Your image should be there!
11. ✅ Go to frontend ecommerce app
12. ✅ Your category should display with the image!

DONE! 🎉
*/
