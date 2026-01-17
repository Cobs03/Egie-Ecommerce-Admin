-- =============================================
-- SALES ANALYTICS - DATA VERIFICATION SCRIPT
-- Run this to check if your data is ready
-- =============================================

-- 1. Check if you have completed orders
SELECT 
  '1. COMPLETED ORDERS' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ GOOD - You have completed orders'
    ELSE '❌ ISSUE - No completed orders found. Analytics will be empty.'
  END as status
FROM orders 
WHERE status IN ('completed', 'delivered');

-- 2. Check if order_items exist
SELECT 
  '2. ORDER ITEMS' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ GOOD - Order items exist'
    ELSE '❌ ISSUE - No order items found'
  END as status
FROM order_items;

-- 3. Check if products have stock_quantity
SELECT 
  '3. PRODUCT STOCK' as check_name,
  COUNT(*) as products_with_stock,
  COUNT(*) FILTER (WHERE stock_quantity IS NULL) as products_without_stock,
  CASE 
    WHEN COUNT(*) FILTER (WHERE stock_quantity IS NULL) = 0 THEN '✅ GOOD - All products have stock data'
    ELSE '⚠️ WARNING - Some products missing stock_quantity'
  END as status
FROM products;

-- 4. Check if products have selected_components (categories)
SELECT 
  '4. PRODUCT COMPONENTS' as check_name,
  COUNT(*) FILTER (WHERE selected_components IS NOT NULL AND jsonb_array_length(selected_components) > 0) as products_with_components,
  COUNT(*) FILTER (WHERE selected_components IS NULL OR jsonb_array_length(selected_components) = 0) as products_without_components,
  CASE 
    WHEN COUNT(*) FILTER (WHERE selected_components IS NOT NULL AND jsonb_array_length(selected_components) > 0) > 0 
      THEN '✅ GOOD - Products have component data'
    ELSE '⚠️ WARNING - No product components defined'
  END as status
FROM products;

-- 5. Sample data check - Recent orders
SELECT 
  '5. RECENT ORDERS' as check_name,
  COUNT(*) as orders_last_30_days,
  SUM(total)::NUMERIC(10,2) as total_revenue,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ GOOD - Recent orders exist for analytics'
    ELSE '❌ ISSUE - No recent orders (last 30 days)'
  END as status
FROM orders 
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND status IN ('completed', 'delivered');

-- 6. Check database functions exist
SELECT 
  '6. DATABASE FUNCTIONS' as check_name,
  COUNT(*) as functions_found,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ GOOD - All analytics functions exist'
    ELSE '❌ ISSUE - Missing analytics functions. Run SALES_ANALYTICS_FUNCTIONS.sql'
  END as status
FROM pg_proc 
WHERE proname IN (
  'get_top_product_in_range',
  'get_product_sales_analysis',
  'get_sales_trend',
  'get_category_sales',
  'get_inventory_recommendations'
);

-- =============================================
-- DETAILED BREAKDOWN (Optional - for debugging)
-- =============================================

-- Show order status distribution
SELECT 
  '📊 ORDER STATUS DISTRIBUTION' as info,
  status,
  COUNT(*) as count,
  SUM(total)::NUMERIC(10,2) as total_revenue
FROM orders
GROUP BY status
ORDER BY count DESC;

-- Show top 5 products by sales
SELECT 
  '🏆 TOP 5 PRODUCTS (Last 30 days)' as info,
  p.name,
  COUNT(oi.id) as times_sold,
  SUM(oi.quantity) as units_sold,
  SUM(oi.quantity * oi.price)::NUMERIC(10,2) as revenue
FROM products p
INNER JOIN order_items oi ON oi.product_id = p.id
INNER JOIN orders o ON o.id = oi.order_id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
  AND o.status IN ('completed', 'delivered')
GROUP BY p.id, p.name
ORDER BY revenue DESC
LIMIT 5;

-- Show products needing attention (low stock)
SELECT 
  '⚠️ LOW STOCK PRODUCTS' as info,
  name,
  stock_quantity,
  CASE 
    WHEN stock_quantity = 0 THEN 'OUT OF STOCK'
    WHEN stock_quantity < 5 THEN 'CRITICAL'
    WHEN stock_quantity < 10 THEN 'LOW'
    ELSE 'OK'
  END as stock_status
FROM products
WHERE stock_quantity < 10
ORDER BY stock_quantity;

-- =============================================
-- IF YOU SEE ISSUES:
-- =============================================

-- Issue: No completed orders
-- Solution: Update some orders to 'completed' status:
-- UPDATE orders SET status = 'completed' WHERE id IN (SELECT id FROM orders LIMIT 5);

-- Issue: Missing analytics functions
-- Solution: Run the entire SALES_ANALYTICS_FUNCTIONS.sql file in Supabase SQL Editor

-- Issue: Products without stock_quantity
-- Solution: Set default stock values:
-- UPDATE products SET stock_quantity = 10 WHERE stock_quantity IS NULL;
