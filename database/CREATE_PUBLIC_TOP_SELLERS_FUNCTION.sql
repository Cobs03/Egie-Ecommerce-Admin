-- ============================================
-- CREATE PUBLIC FUNCTION FOR TOP SELLERS
-- ============================================
-- This function allows the public landing page to fetch
-- top selling products without requiring authentication

CREATE OR REPLACE FUNCTION get_top_selling_products(limit_count INT DEFAULT 5)
RETURNS TABLE(
  product_id UUID,
  total_sold BIGINT
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oi.product_id,
    SUM(oi.quantity)::BIGINT as total_sold
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status IN ('confirmed', 'processing', 'shipped', 'ready_for_pickup', 'delivered')
    -- Only count successful orders
  GROUP BY oi.product_id
  ORDER BY total_sold DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anon (public) users
GRANT EXECUTE ON FUNCTION get_top_selling_products(INT) TO anon;
GRANT EXECUTE ON FUNCTION get_top_selling_products(INT) TO authenticated;

-- ============================================
-- TEST QUERY
-- ============================================
-- Run this to test the function:
-- SELECT * FROM get_top_selling_products(5);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PUBLIC TOP SELLERS FUNCTION CREATED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Function Created:';
  RAISE NOTICE '  • get_top_selling_products(limit_count INT)';
  RAISE NOTICE '';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '  1. Returns product_id and total_sold';
  RAISE NOTICE '  2. Only counts successful orders';
  RAISE NOTICE '  3. Available to public (anon) users';
  RAISE NOTICE '  4. Bypasses RLS with SECURITY DEFINER';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Run this SQL in Supabase SQL Editor';
  RAISE NOTICE '  2. Update frontend to use: supabase.rpc("get_top_selling_products", { limit_count: 5 })';
  RAISE NOTICE '  3. Test on landing page';
  RAISE NOTICE '========================================';
END $$;
