-- ============================================
-- FIX PAYMENTS RLS POLICY
-- ============================================
-- Allow the create_order_from_cart function to insert payments
-- ============================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "payments_insert_policy" ON payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;

-- Create a permissive insert policy for payments
-- This allows inserts when the order belongs to the authenticated user
CREATE POLICY "payments_insert_policy" ON payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Ensure users can view their own payments
DROP POLICY IF EXISTS "payments_select_policy" ON payments;

CREATE POLICY "payments_select_policy" ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Allow users to update their own payments (for status changes)
DROP POLICY IF EXISTS "payments_update_policy" ON payments;

CREATE POLICY "payments_update_policy" ON payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Summary
DO $$ 
BEGIN
  RAISE NOTICE '✅ Payments RLS policies fixed!';
  RAISE NOTICE '📋 Users can now insert payments through create_order_from_cart function';
  RAISE NOTICE '📋 Users can view and update their own payments';
END $$;
