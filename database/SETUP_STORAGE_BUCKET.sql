-- =====================================================
-- Supabase Storage Bucket Setup Script
-- Run this in: Supabase Dashboard → SQL Editor
-- =====================================================
-- 
-- IMPORTANT: After running this SQL, you MUST create policies 
-- manually in the Dashboard (see instructions below)
-- =====================================================

-- Create the 'bundles' storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bundles',
  'bundles',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- NEXT STEPS - Create Policies in Dashboard:
-- =====================================================
-- 
-- After running this SQL, go to:
-- Storage → Buckets → bundles → Policies → New Policy
--
-- Create these 4 policies using the policy builder:
--
-- 1. PUBLIC READ POLICY:
--    Name: Public Access for bundles
--    Policy: SELECT
--    Target roles: public
--    USING expression: bucket_id = 'bundles'
--
-- 2. AUTHENTICATED INSERT POLICY:
--    Name: Authenticated users can upload to bundles
--    Policy: INSERT
--    Target roles: authenticated
--    WITH CHECK expression: bucket_id = 'bundles'
--
-- 3. AUTHENTICATED UPDATE POLICY:
--    Name: Authenticated users can update bundles
--    Policy: UPDATE
--    Target roles: authenticated
--    USING expression: bucket_id = 'bundles'
--    WITH CHECK expression: bucket_id = 'bundles'
--
-- 4. AUTHENTICATED DELETE POLICY:
--    Name: Authenticated users can delete from bundles
--    Policy: DELETE
--    Target roles: authenticated
--    USING expression: bucket_id = 'bundles'
--
-- =====================================================
-- OR use these templates in "New Policy" wizard:
-- =====================================================
--
-- Template 1: "Allow public read access" 
--   → Apply to 'bundles' bucket
--
-- Template 2: "Enable insert for authenticated users only"
--   → Apply to 'bundles' bucket
--
-- Template 3: "Enable update for authenticated users only"
--   → Apply to 'bundles' bucket
--
-- Template 4: "Enable delete for authenticated users only"
--   → Apply to 'bundles' bucket
--
-- =====================================================

-- Verification Query (Run after creating policies)
-- SELECT * FROM storage.buckets WHERE id = 'bundles';
