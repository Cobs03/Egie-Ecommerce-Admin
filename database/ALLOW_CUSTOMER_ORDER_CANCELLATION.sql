-- ============================================
-- ALLOW CUSTOMER ORDER CANCELLATION
-- ============================================
-- Allows customers to cancel their own orders
-- when status is: pending, confirmed, or processing
-- (Orders cannot be cancelled once shipped)
-- ============================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can update own pending orders" ON orders;

-- Create new policy allowing cancellation for pending/confirmed/processing orders
CREATE POLICY "Users can cancel their own orders"
ON orders FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND status IN ('pending', 'confirmed', 'processing')
)
WITH CHECK (
  -- Only allow changing to cancelled status
  status = 'cancelled' 
  OR status IN ('pending', 'confirmed', 'processing')
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ORDER CANCELLATION POLICY UPDATED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  • Customers can now cancel orders in:';
  RAISE NOTICE '    - Pending status';
  RAISE NOTICE '    - Confirmed status';
  RAISE NOTICE '    - Processing status';
  RAISE NOTICE '  • Orders cannot be cancelled once shipped';
  RAISE NOTICE '  • Cancellation reason saved to order_notes';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Run this SQL in Supabase SQL Editor';
  RAISE NOTICE '  2. Test cancellation in My Purchases';
  RAISE NOTICE '  3. Verify cancelled orders show in admin';
  RAISE NOTICE '========================================';
END $$;
