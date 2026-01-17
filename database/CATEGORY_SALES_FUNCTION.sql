-- =============================================
-- CATEGORY SALES ANALYTICS FUNCTION
-- This function analyzes sales by product categories
-- =============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_actual_category_sales(TIMESTAMP, TIMESTAMP);

-- Create function to get sales by actual product categories
CREATE OR REPLACE FUNCTION get_actual_category_sales(
  start_date TIMESTAMP,
  end_date TIMESTAMP
)
RETURNS TABLE (
  category_id UUID,
  category_name VARCHAR,
  total_units BIGINT,
  total_revenue NUMERIC,
  product_count BIGINT,
  top_product_name VARCHAR,
  top_product_sales BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH category_sales AS (
    SELECT 
      pc.id as cat_id,
      pc.name as cat_name,
      COUNT(oi.id)::BIGINT as units_sold,
      COALESCE(SUM(oi.unit_price * oi.quantity), 0)::NUMERIC as revenue,
      COUNT(DISTINCT p.id)::BIGINT as num_products,
      p.name as prod_name,
      SUM(oi.quantity) as prod_sales
    FROM product_categories pc
    INNER JOIN product_category_assignments pca ON pca.category_id = pc.id
    INNER JOIN products p ON p.id = pca.product_id
    INNER JOIN order_items oi ON oi.product_id = p.id
    INNER JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at >= start_date
      AND o.created_at <= end_date
      AND o.status IN ('completed', 'delivered')
    GROUP BY pc.id, pc.name, p.id, p.name
  ),
  ranked_products AS (
    SELECT 
      cat_id,
      cat_name,
      prod_name,
      prod_sales,
      ROW_NUMBER() OVER (PARTITION BY cat_id ORDER BY prod_sales DESC) as rank
    FROM category_sales
  ),
  aggregated AS (
    SELECT 
      cs.cat_id,
      cs.cat_name,
      SUM(cs.units_sold) as total_units,
      SUM(cs.revenue) as total_revenue,
      COUNT(DISTINCT cs.prod_name) as product_count
    FROM category_sales cs
    GROUP BY cs.cat_id, cs.cat_name
  )
  SELECT 
    a.cat_id as category_id,
    a.cat_name as category_name,
    a.total_units,
    a.total_revenue,
    a.product_count,
    rp.prod_name as top_product_name,
    rp.prod_sales as top_product_sales
  FROM aggregated a
  LEFT JOIN ranked_products rp ON rp.cat_id = a.cat_id AND rp.rank = 1
  ORDER BY a.total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_actual_category_sales TO authenticated;
GRANT EXECUTE ON FUNCTION get_actual_category_sales TO anon;
