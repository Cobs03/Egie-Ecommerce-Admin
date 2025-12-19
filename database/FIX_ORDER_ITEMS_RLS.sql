-- ============================================
-- FIX ORDER_ITEMS RLS POLICY
-- ============================================
-- Allow the create_order_from_cart function to insert order_items
-- ============================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "order_items_insert_policy" ON order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;

-- Create a permissive insert policy for order_items
-- This allows inserts when the order belongs to the authenticated user
CREATE POLICY "order_items_insert_policy" ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Ensure users can view their own order items
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;

CREATE POLICY "order_items_select_policy" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Summary
DO $$ 
BEGIN
  RAISE NOTICE '✅ Order items RLS policies fixed!';
  RAISE NOTICE '📋 Users can now insert order items through create_order_from_cart function';
  RAISE NOTICE '📋 Users can view their own order items';
END $$;
