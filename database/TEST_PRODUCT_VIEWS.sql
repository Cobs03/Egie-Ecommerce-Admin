-- Test if product_views table has data and is accessible

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'product_views'
) AS table_exists;

-- 2. Count total rows
SELECT COUNT(*) as total_views FROM product_views;

-- 3. Check sample data
SELECT 
  pv.id,
  pv.product_id,
  pv.user_id,
  pv.session_id,
  pv.created_at,
  p.name as product_name
FROM product_views pv
LEFT JOIN products p ON p.id = pv.product_id
ORDER BY pv.created_at DESC
LIMIT 10;

-- 4. Check aggregated clicks per product
SELECT 
  pv.product_id,
  p.name as product_name,
  p.images,
  COUNT(*) as total_clicks
FROM product_views pv
LEFT JOIN products p ON p.id = pv.product_id
GROUP BY pv.product_id, p.name, p.images
ORDER BY total_clicks DESC
LIMIT 5;

-- 5. Check RLS policies
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
WHERE tablename = 'product_views';

-- 6. Insert test data if table is empty
DO $$
DECLARE
  product_count INT;
  view_count INT;
  sample_product_id UUID;
BEGIN
  -- Check if we have products
  SELECT COUNT(*) INTO product_count FROM products WHERE status = 'active';
  
  -- Check if we have views
  SELECT COUNT(*) INTO view_count FROM product_views;
  
  IF product_count > 0 AND view_count = 0 THEN
    -- Get a sample product
    SELECT id INTO sample_product_id FROM products WHERE status = 'active' LIMIT 1;
    
    -- Insert 50 sample views for testing
    FOR i IN 1..50 LOOP
      INSERT INTO product_views (product_id, session_id)
      SELECT 
        id,
        'test_session_' || floor(random() * 10)::text
      FROM products 
      WHERE status = 'active'
      ORDER BY random()
      LIMIT 1;
    END LOOP;
    
    RAISE NOTICE 'Inserted 50 test product views';
  ELSE
    RAISE NOTICE 'Product views table already has data (% rows)', view_count;
  END IF;
END $$;

-- 7. Verify the test data
SELECT 
  pv.product_id,
  p.name as product_name,
  COUNT(*) as view_count
FROM product_views pv
LEFT JOIN products p ON p.id = pv.product_id
GROUP BY pv.product_id, p.name
ORDER BY view_count DESC
LIMIT 5;
