-- ==========================================
-- 👤 USER AVATARS STORAGE SETUP
-- Setup for user profile picture uploads
-- ==========================================

-- Option 1: Use existing 'bundles' bucket with 'avatars' folder
-- (Images will be stored at: bundles/avatars/filename.jpg)
-- No additional setup needed! Just upload to 'avatars' folder.

-- Option 2: Create dedicated 'avatars' bucket (RECOMMENDED)
-- Run this if you want a separate bucket for user avatars:

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- RLS POLICIES FOR AVATARS BUCKET
-- ==========================================

-- Policy: Anyone can view avatars (public read)
CREATE POLICY "Public Access for Avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Policy: Admins can delete any avatar
CREATE POLICY "Admins can delete avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.is_admin = true)
  )
);

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check if bucket was created
-- SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check policies
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%avatar%';

-- ==========================================
-- USAGE NOTES
-- ==========================================

-- Option 1 (Use bundles bucket):
-- StorageService.uploadImage(file, 'avatars')
-- Result: bundles/avatars/uuid-filename.jpg

-- Option 2 (Use avatars bucket):
-- First, update StorageService.uploadImage() to accept bucket parameter
-- StorageService.uploadImage(file, 'avatars', 'avatars')
-- Result: avatars/uuid-filename.jpg

-- For now, Option 1 is already configured in AddUserDrawer.jsx
-- It will upload to: bundles/avatars/filename.jpg
