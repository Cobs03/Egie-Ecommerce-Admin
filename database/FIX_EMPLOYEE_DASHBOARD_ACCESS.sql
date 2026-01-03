-- =====================================================
-- FIX EMPLOYEE DASHBOARD ACCESS
-- =====================================================
-- This allows employees/staff to view ALL orders for dashboard analytics
-- Previously, employees could only see their own orders
-- Now: Admin, Manager, Staff can see all orders
-- Customer users still only see their own orders
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Regular customers can view ONLY their own orders
CREATE POLICY "Customers can view own orders"
ON orders FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role IS NULL OR profiles.role NOT IN ('admin', 'super_admin', 'manager', 'staff'))
  )
);

-- Staff, Managers, and Admins can view ALL orders
CREATE POLICY "Staff can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'manager', 'staff')
  )
);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- To verify the policies were created:
-- SELECT * FROM pg_policies WHERE tablename = 'orders' AND policyname LIKE '%view%';
