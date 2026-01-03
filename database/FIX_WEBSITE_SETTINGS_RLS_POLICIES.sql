-- Complete RLS policies for website_settings
-- Managers and employees can READ, only admins can INSERT/UPDATE

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can read website settings" ON website_settings;
DROP POLICY IF EXISTS "Admins can update website settings" ON website_settings;
DROP POLICY IF EXISTS "Admins can insert website settings" ON website_settings;
DROP POLICY IF EXISTS "Public can read website settings" ON website_settings;

-- Allow authenticated users (admin, manager, employee) to READ
CREATE POLICY "Authenticated users can read website settings"
  ON website_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.is_admin = true 
        OR profiles.role IN ('admin', 'manager', 'employee')
      )
    )
  );

-- Allow only ADMINS to INSERT (for upsert operations)
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

-- Allow only ADMINS to UPDATE
CREATE POLICY "Admins can update website settings"
  ON website_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Allow public (anonymous users) to READ for ecommerce site
CREATE POLICY "Public can read website settings"
  ON website_settings
  FOR SELECT
  TO anon
  USING (true);

-- Verify all policies
SELECT 
  policyname, 
  cmd AS operation,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies 
WHERE tablename = 'website_settings'
ORDER BY cmd, policyname;
