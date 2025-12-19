-- ========================================
-- VERIFICATION SCRIPT
-- Run this to check if everything is set up correctly
-- ========================================

-- Check if RPC functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'admin_mark_payment_as_paid',
    'admin_confirm_order', 
    'admin_update_order_status',
    'deduct_stock_on_confirmation',
    'restore_stock_on_cancel',
    'handle_payment_failure'
  )
ORDER BY routine_name;

-- Check if triggers exist
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'trigger_deduct_stock_on_payment',
    'trigger_deduct_stock_on_order_confirm',
    'trigger_restore_stock_on_cancel',
    'trigger_handle_payment_failure'
  )
ORDER BY trigger_name;

-- Check a specific order's details
SELECT 
  o.order_number,
  o.status AS order_status,
  o.confirmed_at,
  p.payment_method,
  p.payment_status,
  p.paid_at,
  oi.product_name,
  oi.variant_name,
  oi.quantity,
  pr.stock_quantity AS current_product_stock,
  pr.variants AS product_variants
FROM orders o
JOIN payments p ON p.order_id = o.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products pr ON pr.id = oi.product_id
WHERE o.order_number = 'ORD-20251215-083279'
ORDER BY oi.product_name;
