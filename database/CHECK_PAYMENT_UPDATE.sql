-- ========================================
-- CHECK PAYMENT UPDATE ISSUE
-- ========================================
-- This script checks if the payment update is working

-- 1. Check if triggers exist
SELECT 
  tgname AS trigger_name,
  tgtype AS trigger_type,
  tgenabled AS is_enabled,
  pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgname LIKE '%deduct%' OR tgname LIKE '%payment%'
ORDER BY tgname;

-- 2. Check a specific payment that failed to update
-- Replace with actual payment ID
SELECT 
  p.id,
  p.transaction_id,
  p.payment_status,
  p.paid_at,
  p.updated_at,
  o.order_number,
  o.status AS order_status,
  o.confirmed_at
FROM payments p
JOIN orders o ON p.order_id = o.id
WHERE p.payment_status = 'pending'
ORDER BY p.created_at DESC
LIMIT 5;

-- 3. Test if we can manually update a payment (don't run this unless you want to test)
-- UPDATE payments SET payment_status = 'paid', paid_at = NOW(), updated_at = NOW() WHERE id = 'YOUR_PAYMENT_ID_HERE';

-- 4. Check RLS policies on payments table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'payments'
ORDER BY policyname;
