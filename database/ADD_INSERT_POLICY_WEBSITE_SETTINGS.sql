-- Add INSERT policy for website_settings (needed for upsert to work)
-- Run this in Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can insert website settings" ON website_settings;

-- Create INSERT policy for admins
CREATE POLICY "Admins can insert website settings"
  ON website_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Verify policies
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'website_settings';
