-- =============================================
-- SALES ANALYTICS DATABASE FUNCTIONS
-- Run these functions in your Supabase SQL Editor
-- =============================================

-- Drop existing functions first (if they exist)
DROP FUNCTION IF EXISTS get_top_product_in_range(TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS get_product_sales_analysis(TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS get_sales_trend(TIMESTAMP, TIMESTAMP, TEXT);
DROP FUNCTION IF EXISTS get_category_sales(TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS get_inventory_recommendations(TIMESTAMP, TIMESTAMP);

-- 1. Get top product in date range (by total quantity sold)
CREATE OR REPLACE FUNCTION get_top_product_in_range(
  start_date TIMESTAMP,
  end_date TIMESTAMP
)
RETURNS TABLE (
  product_id UUID,
  name VARCHAR,
  sales BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name,
    COALESCE(SUM(oi.quantity), 0)::BIGINT as sales
  FROM products p
  INNER JOIN order_items oi ON oi.product_id = p.id
  INNER JOIN orders o ON o.id = oi.order_id
  WHERE o.created_at >= start_date
    AND o.created_at <= end_date
    AND o.status IN ('completed', 'delivered')
  GROUP BY p.id, p.name
  ORDER BY sales DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;


-- 2. Get product sales analysis
CREATE OR REPLACE FUNCTION get_product_sales_analysis(
  start_date TIMESTAMP,
  end_date TIMESTAMP
)
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR,
  sku VARCHAR,
  units_sold BIGINT,
  total_revenue NUMERIC,
  avg_price NUMERIC,
  current_stock INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    p.sku,
    COALESCE(SUM(oi.quantity), 0)::BIGINT as units_sold,
    COALESCE(SUM(oi.unit_price * oi.quantity), 0)::NUMERIC as total_revenue,
    COALESCE(AVG(oi.unit_price), 0)::NUMERIC as avg_price,
    COALESCE(p.stock_quantity, 0) as current_stock
  FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id 
    AND o.created_at >= start_date
    AND o.created_at <= end_date
    AND o.status IN ('completed', 'delivered')
  GROUP BY p.id, p.name, p.sku, p.stock_quantity
  HAVING COALESCE(SUM(oi.quantity), 0) > 0
  ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;


-- 3. Get sales trend over time
CREATE OR REPLACE FUNCTION get_sales_trend(
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  interval_type TEXT DEFAULT 'day'
)
RETURNS TABLE (
  date_label TEXT,
  total_revenue NUMERIC,
  order_count BIGINT
) AS $$
DECLARE
  date_format TEXT;
BEGIN
  -- Set date format based on interval
  CASE interval_type
    WHEN 'hour' THEN date_format := 'YYYY-MM-DD HH24:00';
    WHEN 'day' THEN date_format := 'YYYY-MM-DD';
    WHEN 'month' THEN date_format := 'YYYY-MM';
    ELSE date_format := 'YYYY-MM-DD';
  END CASE;

  RETURN QUERY
  SELECT 
    TO_CHAR(o.created_at, date_format) as date_label,
    COALESCE(SUM(o.total), 0)::NUMERIC as total_revenue,
    COUNT(o.id)::BIGINT as order_count
  FROM orders o
  WHERE o.created_at >= start_date
    AND o.created_at <= end_date
    AND o.status IN ('completed', 'delivered')
  GROUP BY TO_CHAR(o.created_at, date_format)
  ORDER BY date_label;
END;
$$ LANGUAGE plpgsql;


-- 4. Get category sales (using product brands as grouping)
CREATE OR REPLACE FUNCTION get_category_sales(
  start_date TIMESTAMP,
  end_date TIMESTAMP
)
RETURNS TABLE (
  category_name VARCHAR,
  total_sales BIGINT,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(b.name, 'Unbranded')::VARCHAR as category_name,
    COUNT(oi.id)::BIGINT as total_sales,
    COALESCE(SUM(oi.unit_price * oi.quantity), 0)::NUMERIC as total_revenue
  FROM products p
  INNER JOIN order_items oi ON oi.product_id = p.id
  INNER JOIN orders o ON o.id = oi.order_id
  LEFT JOIN brands b ON b.id = p.brand_id
  WHERE o.created_at >= start_date
    AND o.created_at <= end_date
    AND o.status IN ('completed', 'delivered')
  GROUP BY b.name
  ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;


-- 5. Get inventory recommendations
CREATE OR REPLACE FUNCTION get_inventory_recommendations(
  start_date TIMESTAMP,
  end_date TIMESTAMP
)
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR,
  current_stock INTEGER,
  avg_daily_sales NUMERIC
) AS $$
DECLARE
  days_in_period INTEGER;
BEGIN
  -- Calculate number of days in period
  days_in_period := EXTRACT(DAY FROM (end_date - start_date));
  IF days_in_period = 0 THEN
    days_in_period := 1;
  END IF;

  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    COALESCE(p.stock_quantity, 0) as current_stock,
    COALESCE(SUM(oi.quantity)::NUMERIC / days_in_period, 0) as avg_daily_sales
  FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id 
    AND o.created_at >= start_date
    AND o.created_at <= end_date
    AND o.status IN ('completed', 'delivered')
  GROUP BY p.id, p.name, p.stock_quantity
  HAVING COALESCE(SUM(oi.quantity), 0) > 0
  ORDER BY (COALESCE(p.stock_quantity, 0)::NUMERIC / NULLIF(SUM(oi.quantity)::NUMERIC / days_in_period, 0));
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_top_product_in_range TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_sales_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION get_sales_trend TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_sales TO authenticated;
GRANT EXECUTE ON FUNCTION get_inventory_recommendations TO authenticated;

-- Also grant to anon if needed for public access
GRANT EXECUTE ON FUNCTION get_top_product_in_range TO anon;
GRANT EXECUTE ON FUNCTION get_product_sales_analysis TO anon;
GRANT EXECUTE ON FUNCTION get_sales_trend TO anon;
GRANT EXECUTE ON FUNCTION get_category_sales TO anon;
GRANT EXECUTE ON FUNCTION get_inventory_recommendations TO anon;
