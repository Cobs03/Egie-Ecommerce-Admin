-- =============================================
-- CATEGORY ANALYTICS SETUP (CORRECTED)
-- Uses EXISTING categories with images
-- =============================================

-- Step 1: Ensure category_id column exists in products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Step 3: Auto-assign products to EXISTING categories
-- Using your existing category IDs with images

-- Assign to Monitor (existing)
UPDATE products p
SET category_id = 'e8f50241-0519-4802-8e69-4fc02e2aca00'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%monitor%' OR p.name ILIKE '%display%' OR p.name ILIKE '%odyssey%');

-- Assign to Graphics Card (existing)
UPDATE products p
SET category_id = 'a2c1d556-e753-4b4c-a2ec-d41e50642b70'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%geforce%' OR p.name ILIKE '%rtx%' OR p.name ILIKE '%gtx%' 
       OR p.name ILIKE '%graphics%' OR p.name ILIKE '%gpu%' OR p.name ILIKE '%radeon%');

-- Assign to Keyboard (existing)
UPDATE products p
SET category_id = '62313fd1-a340-4135-a790-ae415f80abc2'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%keyboard%' OR p.name ILIKE '%keychron%');

-- Assign to Mouse (existing)
UPDATE products p
SET category_id = '556f2cdf-41b2-4740-b799-0bf8bc5a0664'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%mouse%' OR p.name ILIKE '%mice%');

-- Assign to Processor (existing)
UPDATE products p
SET category_id = 'a092c955-0010-4254-902c-61831a71db2e'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%intel%' OR p.name ILIKE '%amd%' OR p.name ILIKE '%ryzen%' 
       OR p.name ILIKE '%processor%' OR p.name ILIKE '%cpu%');

-- Assign to Motherboard (existing)
UPDATE products p
SET category_id = 'e63d27fd-a3cf-4958-9ae9-e4211d711208'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%motherboard%' OR p.name ILIKE '%mainboard%');

-- Assign to RAM (existing)
UPDATE products p
SET category_id = 'cd60882d-f2df-4d46-92f9-df923ae95bfa'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%ram%' OR p.name ILIKE '%memory%' OR p.name ILIKE '%ddr%');

-- Assign to SSD (existing)
UPDATE products p
SET category_id = 'ad6cce85-5c86-48ab-8941-639048780bff'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%ssd%' OR p.name ILIKE '%nvme%' OR p.name ILIKE '%solid state%');

-- Assign to HDD (existing)
UPDATE products p
SET category_id = '069efe9b-66f5-42a7-9b90-6140c7e8a5de'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%hdd%' OR p.name ILIKE '%hard drive%' OR p.name ILIKE '%hard disk%');

-- Assign to Power Supply (existing)
UPDATE products p
SET category_id = '0bda9c40-6b09-4d69-b45d-6efd68ad3c2d'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%power supply%' OR p.name ILIKE '%psu%');

-- Assign to Cooling (existing)
UPDATE products p
SET category_id = '2d81bd03-3cc8-4937-80ae-bd1bdfff339a'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%fan%' OR p.name ILIKE '%cooling%' OR p.name ILIKE '%cooler%' OR p.name ILIKE '%aio%');

-- Assign to Case (existing)
UPDATE products p
SET category_id = 'b75d6c45-bc5f-4f14-973c-d2c2a67f4765'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%case%' OR p.name ILIKE '%chassis%' OR p.name ILIKE '%enclosure%');

-- Assign to Laptop (existing)
UPDATE products p
SET category_id = 'b2d53f67-5291-4a09-b302-b027e7dd1a57'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%laptop%' OR p.name ILIKE '%notebook%');

-- Assign to Headset (existing)
UPDATE products p
SET category_id = 'c8d85c8c-758a-4b41-8e0d-17d49541c076'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%headset%' OR p.name ILIKE '%headphone%');

-- Assign to Webcam (existing)
UPDATE products p
SET category_id = 'b3ea2958-557c-46c4-9793-de36c909be4e'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%webcam%' OR p.name ILIKE '%camera%');

-- Assign to Speaker (existing)
UPDATE products p
SET category_id = 'cd8fc8a2-df4e-49c7-bff1-c28435033d33'
WHERE category_id IS NULL 
  AND (p.name ILIKE '%speaker%');

-- Step 4: Drop old function and create new one
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

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION get_actual_category_sales TO authenticated;
GRANT EXECUTE ON FUNCTION get_actual_category_sales TO anon;

-- Step 6: Show results
SELECT 
  pc.name as category_name,
  pc.slug,
  CASE WHEN pc.image_url IS NOT NULL THEN '✓ Has Image' ELSE '✗ No Image' END as image_status,
  COUNT(p.id) as product_count
FROM product_categories pc
LEFT JOIN products p ON p.category_id = pc.id
GROUP BY pc.id, pc.name, pc.slug, pc.image_url
ORDER BY COUNT(p.id) DESC;

-- Step 7: Verification message
DO $$
DECLARE
  category_count INT;
  products_with_category INT;
  products_without_category INT;
BEGIN
  SELECT COUNT(*) INTO category_count FROM product_categories;
  SELECT COUNT(*) INTO products_with_category FROM products WHERE category_id IS NOT NULL;
  SELECT COUNT(*) INTO products_without_category FROM products WHERE category_id IS NULL;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'CATEGORY ANALYTICS SETUP COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Total categories: %', category_count;
  RAISE NOTICE 'Products with categories: %', products_with_category;
  RAISE NOTICE 'Products without categories: %', products_without_category;
  RAISE NOTICE '';
  RAISE NOTICE 'Test the function with:';
  RAISE NOTICE 'SELECT * FROM get_actual_category_sales(NOW() - INTERVAL ''30 days'', NOW());';
  RAISE NOTICE '==============================================';
END $$;
