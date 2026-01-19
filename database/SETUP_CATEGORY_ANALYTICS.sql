-- =============================================
-- COMPLETE CATEGORY ANALYTICS SETUP
-- Run this entire script in Supabase SQL Editor
-- =============================================

-- Step 1: Create tables if they don't exist
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_category_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  specifications JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_product_category_assignments_product 
  ON product_category_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_category_assignments_category 
  ON product_category_assignments(category_id);

-- Step 3: Insert sample categories
INSERT INTO product_categories (name, slug, description) VALUES
  ('Monitors', 'monitors', 'Display screens and monitors'),
  ('Graphics Cards', 'graphics-cards', 'GPU and graphics cards'),
  ('Keyboards', 'keyboards', 'Gaming and office keyboards'),
  ('Mouse', 'mouse', 'Gaming and office mice'),
  ('Processors', 'processors', 'CPUs and processors'),
  ('Motherboards', 'motherboards', 'Motherboards and mainboards'),
  ('Memory', 'memory', 'RAM and memory modules'),
  ('Storage', 'storage', 'SSDs, HDDs, and storage devices'),
  ('Power Supplies', 'power-supplies', 'PSUs and power supplies'),
  ('Cases', 'cases', 'PC cases and chassis'),
  ('Cooling', 'cooling', 'Fans, coolers, and cooling solutions'),
  ('Accessories', 'accessories', 'Gaming accessories and peripherals')
ON CONFLICT (name) DO NOTHING;

-- Step 4: Drop existing function if it exists
DROP FUNCTION IF EXISTS get_actual_category_sales(TIMESTAMP, TIMESTAMP);

-- Step 5: Create the analytics function
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

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION get_actual_category_sales TO authenticated;
GRANT EXECUTE ON FUNCTION get_actual_category_sales TO anon;

-- Step 7: Auto-assign products to categories based on keywords
-- (You'll need to run this after reviewing your product names)

-- Assign monitors
INSERT INTO product_category_assignments (product_id, category_id, specifications)
SELECT 
  p.id as product_id,
  pc.id as category_id,
  '{}'::jsonb as specifications
FROM products p
CROSS JOIN product_categories pc
WHERE (p.name ILIKE '%monitor%' OR p.name ILIKE '%display%' OR p.name ILIKE '%odyssey%') 
  AND pc.slug = 'monitors'
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Assign graphics cards
INSERT INTO product_category_assignments (product_id, category_id, specifications)
SELECT 
  p.id as product_id,
  pc.id as category_id,
  '{}'::jsonb as specifications
FROM products p
CROSS JOIN product_categories pc
WHERE (p.name ILIKE '%geforce%' OR p.name ILIKE '%rtx%' OR p.name ILIKE '%gtx%' 
       OR p.name ILIKE '%graphics%' OR p.name ILIKE '%gpu%') 
  AND pc.slug = 'graphics-cards'
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Assign keyboards
INSERT INTO product_category_assignments (product_id, category_id, specifications)
SELECT 
  p.id as product_id,
  pc.id as category_id,
  '{}'::jsonb as specifications
FROM products p
CROSS JOIN product_categories pc
WHERE (p.name ILIKE '%keyboard%' OR p.name ILIKE '%keychron%') 
  AND pc.slug = 'keyboards'
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Assign mouse/mice
INSERT INTO product_category_assignments (product_id, category_id, specifications)
SELECT 
  p.id as product_id,
  pc.id as category_id,
  '{}'::jsonb as specifications
FROM products p
CROSS JOIN product_categories pc
WHERE (p.name ILIKE '%mouse%' OR p.name ILIKE '%mice%') 
  AND pc.slug = 'mouse'
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Step 8: Verify setup
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SETUP COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Categories created: %', (SELECT COUNT(*) FROM product_categories);
  RAISE NOTICE 'Products assigned: %', (SELECT COUNT(*) FROM product_category_assignments);
  RAISE NOTICE '';
  RAISE NOTICE 'Test the function with:';
  RAISE NOTICE 'SELECT * FROM get_actual_category_sales(NOW() - INTERVAL ''30 days'', NOW());';
  RAISE NOTICE '==============================================';
END $$;
