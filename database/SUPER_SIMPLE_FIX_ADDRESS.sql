-- ============================================
-- SUPER SIMPLE FIX: ALLOW ALL AUTHENTICATED USERS TO READ ADDRESSES
-- ============================================
-- This is a temporary fix - you can make it more restrictive later

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can view all addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Allow authenticated to view addresses" ON shipping_addresses;

-- Allow all authenticated users to read shipping addresses
-- (You can add role checking later after confirming the table name)
CREATE POLICY "Allow authenticated to view addresses"
ON shipping_addresses
FOR SELECT
TO authenticated
USING (true);

-- Verify
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'shipping_addresses';
