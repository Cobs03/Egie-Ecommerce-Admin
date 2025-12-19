-- ============================================
-- SIMPLE FIX: ALLOW ADMINS TO READ ALL SHIPPING ADDRESSES
-- ============================================

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all addresses" ON shipping_addresses;

-- Add policy to allow admins to view all shipping addresses
-- This policy checks if the user has an admin role in the profiles table
CREATE POLICY "Admins can view all addresses"
ON shipping_addresses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'manager')
  )
);

-- Verify the policy was created
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'shipping_addresses'
AND policyname = 'Admins can view all addresses';
