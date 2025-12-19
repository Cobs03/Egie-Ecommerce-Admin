-- ============================================
-- CREATE ADMIN FUNCTION TO GET SHIPPING ADDRESS
-- ============================================
-- This creates a SECURITY DEFINER function that bypasses RLS
-- allowing admins to fetch any shipping address
-- ============================================

-- Create function to get shipping address by ID (bypasses RLS)
CREATE OR REPLACE FUNCTION get_shipping_address_for_admin(address_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  street_address TEXT,
  barangay VARCHAR(100),
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  address_type VARCHAR(20),
  is_default BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER  -- This runs with the function creator's privileges, bypassing RLS
AS $$
BEGIN
  -- Check if caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'super_admin', 'manager')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Return the shipping address
  RETURN QUERY
  SELECT 
    sa.id,
    sa.user_id,
    sa.full_name,
    sa.phone,
    sa.email,
    sa.street_address,
    sa.barangay,
    sa.city,
    sa.province,
    sa.postal_code,
    sa.country,
    sa.address_type,
    sa.is_default,
    sa.created_at,
    sa.updated_at
  FROM shipping_addresses sa
  WHERE sa.id = address_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_shipping_address_for_admin(UUID) TO authenticated;

-- ============================================
-- TEST THE FUNCTION
-- ============================================
-- Replace with an actual shipping_address_id from your database
-- SELECT * FROM get_shipping_address_for_admin('d4846f98-770a-463d-b2c3-82c54d333497');

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ADMIN SHIPPING ADDRESS FUNCTION CREATED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Function: get_shipping_address_for_admin(address_id)';
  RAISE NOTICE '';
  RAISE NOTICE 'This function:';
  RAISE NOTICE '  • Bypasses RLS policies (SECURITY DEFINER)';
  RAISE NOTICE '  • Checks if caller is admin/super_admin/manager';
  RAISE NOTICE '  • Returns full shipping address details';
  RAISE NOTICE '';
  RAISE NOTICE 'Now update OrderService.js to use this function!';
  RAISE NOTICE '========================================';
END $$;
