-- ============================================
-- FIX EXISTING ORDER ITEMS WITH MISSING IMAGES
-- ============================================
-- This script updates existing order_items that have null or empty
-- product_image by fetching the image from the products table
-- ============================================

-- First, let's see which order items have missing images
SELECT 
  oi.id,
  oi.product_name,
  oi.product_image,
  p.name as current_product_name,
  p.images as current_product_images
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE oi.product_image IS NULL OR oi.product_image = ''
ORDER BY oi.created_at DESC
LIMIT 20;

-- Update order_items with missing images
-- This will fetch the first image from the products table
UPDATE order_items oi
SET product_image = (
  SELECT 
    CASE
      -- If images is an array of objects with 'url' property
      WHEN jsonb_typeof(p.images->0) = 'object' THEN p.images->0->>'url'
      -- If images is an array of strings
      WHEN jsonb_typeof(p.images->0) = 'string' THEN p.images->>0
      -- Fallback to null if images is empty or invalid
      ELSE NULL
    END
  FROM products p
  WHERE p.id = oi.product_id
)
WHERE oi.product_image IS NULL OR oi.product_image = '';

-- Verify the update
SELECT 
  oi.id,
  oi.product_name,
  oi.product_image,
  oi.created_at
FROM order_items oi
ORDER BY oi.created_at DESC
LIMIT 20;

-- Count how many items still have missing images
SELECT 
  COUNT(*) as items_with_missing_images
FROM order_items
WHERE product_image IS NULL OR product_image = '';

-- Show products that might not have images in the products table
SELECT 
  p.id,
  p.name,
  p.images,
  COUNT(oi.id) as affected_order_items
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id AND (oi.product_image IS NULL OR oi.product_image = '')
WHERE p.images IS NULL OR p.images = '[]'::jsonb OR jsonb_array_length(p.images) = 0
GROUP BY p.id, p.name, p.images
HAVING COUNT(oi.id) > 0
ORDER BY COUNT(oi.id) DESC;

-- Summary message (execute this in a DO block)
DO $$ 
BEGIN
  RAISE NOTICE '✅ Order items images have been updated!';
  RAISE NOTICE '📋 Please check the results above to see if any products still need images.';
END $$;
