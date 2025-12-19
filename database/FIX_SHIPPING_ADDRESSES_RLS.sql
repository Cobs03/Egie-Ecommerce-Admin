-- ============================================
-- FIX SHIPPING ADDRESSES RLS POLICIES
-- ============================================
-- This fixes the 406 error when fetching shipping addresses
-- by adding proper RLS policies for admin access
-- ============================================

-- Enable RLS on shipping_addresses (if not already enabled)
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Admins can view all addresses" ON shipping_addresses;

-- ============================================
-- POLICY 1: Users can view their own addresses
-- ============================================
CREATE POLICY "Users can view their own addresses"
ON shipping_addresses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- POLICY 2: Users can insert their own addresses
-- ============================================
CREATE POLICY "Users can insert their own addresses"
ON shipping_addresses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- POLICY 3: Users can update their own addresses
-- ============================================
CREATE POLICY "Users can update their own addresses"
ON shipping_addresses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- POLICY 4: Users can delete their own addresses
-- ============================================
CREATE POLICY "Users can delete their own addresses"
ON shipping_addresses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- POLICY 5: Admins can view ALL addresses
-- ============================================
-- This is the KEY policy that was missing!
CREATE POLICY "Admins can view all addresses"
ON shipping_addresses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'super_admin', 'manager')
  )
);

-- ============================================
-- VERIFY POLICIES
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'shipping_addresses'
ORDER BY policyname;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SHIPPING ADDRESSES RLS FIXED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Policies Created:';
  RAISE NOTICE '  1. Users can view their own addresses';
  RAISE NOTICE '  2. Users can insert their own addresses';
  RAISE NOTICE '  3. Users can update their own addresses';
  RAISE NOTICE '  4. Users can delete their own addresses';
  RAISE NOTICE '  5. Admins can view ALL addresses (KEY FIX)';
  RAISE NOTICE '';
  RAISE NOTICE 'The 406 error should now be fixed!';
  RAISE NOTICE 'Refresh your admin panel and check again.';
  RAISE NOTICE '========================================';
END $$;
