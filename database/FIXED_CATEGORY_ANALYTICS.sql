-- =============================================
-- SIMPLE CATEGORY ANALYTICS SETUP
-- Works with existing database schema
-- =============================================

-- Step 1: Add category_id column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Step 3: Insert sample categories (if they don't exist)
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

-- Step 4: Auto-assign categories based on product names
-- (This will categorize your existing products)

-- Assign monitors
UPDATE products p
SET category_id = (SELECT id FROM product_categories WHERE slug = 'monitors')
WHERE category_id IS NULL 
  AND (p.name ILIKE '%monitor%' OR p.name ILIKE '%display%' OR p.name ILIKE '%odyssey%');

-- Assign graphics cards
UPDATE products p
SET category_id = (SELECT id FROM product_categories WHERE slug = 'graphics-cards')
WHERE category_id IS NULL 
  AND (p.name ILIKE '%geforce%' OR p.name ILIKE '%rtx%' OR p.name ILIKE '%gtx%' 
       OR p.name ILIKE '%graphics%' OR p.name ILIKE '%gpu%' OR p.name ILIKE '%radeon%');

-- Assign keyboards
UPDATE products p
SET category_id = (SELECT id FROM product_categories WHERE slug = 'keyboards')
WHERE category_id IS NULL 
  AND (p.name ILIKE '%keyboard%' OR p.name ILIKE '%keychron%');

-- Assign mouse
UPDATE products p
SET category_id = (SELECT id FROM product_categories WHERE slug = 'mouse')
WHERE category_id IS NULL 
  AND (p.name ILIKE '%mouse%' OR p.name ILIKE '%mice%');

-- Assign processors
UPDATE products p
SET category_id = (SELECT id FROM product_categories WHERE slug = 'processors')
WHERE category_id IS NULL 
  AND (p.name ILIKE '%intel%' OR p.name ILIKE '%amd%' OR p.name ILIKE '%ryzen%' 
       OR p.name ILIKE '%processor%' OR p.name ILIKE '%cpu%');

-- Assign motherboards
UPDATE products p
SET category_id = (SELECT id FROM product_categories WHERE slug = 'motherboards')
WHERE category_id IS NULL 
  AND (p.name ILIKE '%motherboard%' OR p.name ILIKE '%mainboard%');

-- Assign memory/RAM
UPDATE products p
SET category_id = (SELECT id FROM product_categories WHERE slug = 'memory')
WHERE category_id IS NULL 
  AND (p.name ILIKE '%ram%' OR p.name ILIKE '%memory%' OR p.name ILIKE '%ddr%');

-- Assign storage
UPDATE products p
SET category_id = (SELECT id FROM product_categories WHERE slug = 'storage')
WHERE category_id IS NULL 
  AND (p.name ILIKE '%ssd%' OR p.name ILIKE '%hdd%' OR p.name ILIKE '%storage%' 
       OR p.name ILIKE '%nvme%' OR p.name ILIKE '%hard drive%');

-- Step 5: Drop old function and create new simplified one
DROP FUNCTION IF EXISTS get_actual_category_sales(TIMESTAMP, TIMESTAMP);

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
      p.name as prod_name,
      SUM(oi.quantity)::BIGINT as prod_sales,
      SUM(oi.unit_price * oi.quantity)::NUMERIC as prod_revenue
    FROM product_categories pc
    INNER JOIN products p ON p.category_id = pc.id
    INNER JOIN order_items oi ON oi.product_id = p.id
    INNER JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at >= start_date
      AND o.created_at <= end_date
      AND o.status IN ('completed', 'delivered')
    GROUP BY pc.id, pc.name, p.name
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
      SUM(cs.prod_sales)::BIGINT as total_units,
      SUM(cs.prod_revenue)::NUMERIC as total_revenue,
      COUNT(DISTINCT cs.prod_name)::BIGINT as product_count
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

-- Step 7: Verification
DO $$
DECLARE
  category_count INT;
  products_with_category INT;
BEGIN
  SELECT COUNT(*) INTO category_count FROM product_categories;
  SELECT COUNT(*) INTO products_with_category FROM products WHERE category_id IS NOT NULL;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SETUP COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Categories created: %', category_count;
  RAISE NOTICE 'Products assigned to categories: %', products_with_category;
  RAISE NOTICE '';
  RAISE NOTICE 'Test the function with:';
  RAISE NOTICE 'SELECT * FROM get_actual_category_sales(NOW() - INTERVAL ''30 days'', NOW());';
  RAISE NOTICE '==============================================';
END $$;
