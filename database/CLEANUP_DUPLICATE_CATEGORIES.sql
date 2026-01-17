-- =============================================
-- CLEANUP DUPLICATE CATEGORIES
-- Maps products to existing categories with images
-- Then removes duplicate categories
-- =============================================

-- Step 1: Update products to use EXISTING categories instead of duplicates
-- Map "Monitors" → "Monitor" (existing with image)
UPDATE products 
SET category_id = 'e8f50241-0519-4802-8e69-4fc02e2aca00'
WHERE category_id = '286c03dd-c267-480e-b2e3-03fac6df0b1b';

-- Map "Graphics Cards" → "Graphics Card" (existing with image)
UPDATE products 
SET category_id = 'a2c1d556-e753-4b4c-a2ec-d41e50642b70'
WHERE category_id = 'aa9b3d16-a6b6-4d0d-b412-534e8af7c045';

-- Map "Keyboards" → "Keyboard" (existing with image)
UPDATE products 
SET category_id = '62313fd1-a340-4135-a790-ae415f80abc2'
WHERE category_id = '33c17a94-09e4-42f7-85ee-ec4bf1faf185';

-- Map "Processors" → "Processor" (existing with image)
UPDATE products 
SET category_id = 'a092c955-0010-4254-902c-61831a71db2e'
WHERE category_id = 'e4153e09-eda3-4a6a-9ba7-978fe9f10a46';

-- Map "Memory" → "RAM" (existing with image)
UPDATE products 
SET category_id = 'cd60882d-f2df-4d46-92f9-df923ae95bfa'
WHERE category_id = '13084ce4-2f2b-4051-a7f4-5eae91b5ae66';

-- Map "Motherboards" → "Motherboard" (existing with image)
UPDATE products 
SET category_id = 'e63d27fd-a3cf-4958-9ae9-e4211d711208'
WHERE category_id = '42fe4fab-91a6-41af-927a-47ddb61287b0';

-- Map "Storage" → Distribute to "SSD" or "HDD" based on product name
-- First try SSD
UPDATE products 
SET category_id = 'ad6cce85-5c86-48ab-8941-639048780bff'
WHERE category_id = '97d655ca-7187-491c-8cc0-7958bca1858f'
  AND (name ILIKE '%ssd%' OR name ILIKE '%nvme%' OR name ILIKE '%solid state%');

-- Then HDD
UPDATE products 
SET category_id = '069efe9b-66f5-42a7-9b90-6140c7e8a5de'
WHERE category_id = '97d655ca-7187-491c-8cc0-7958bca1858f'
  AND (name ILIKE '%hdd%' OR name ILIKE '%hard drive%' OR name ILIKE '%hard disk%');

-- Remaining storage products default to SSD
UPDATE products 
SET category_id = 'ad6cce85-5c86-48ab-8941-639048780bff'
WHERE category_id = '97d655ca-7187-491c-8cc0-7958bca1858f';

-- Step 2: Verify no products are still using duplicate categories
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN 'READY TO DELETE'
    ELSE 'WARNING: Still ' || COUNT(*) || ' products using duplicate categories'
  END as status,
  COUNT(*) as remaining_products
FROM products
WHERE category_id IN (
  '286c03dd-c267-480e-b2e3-03fac6df0b1b', -- Monitors (duplicate)
  'aa9b3d16-a6b6-4d0d-b412-534e8af7c045', -- Graphics Cards (duplicate)
  '33c17a94-09e4-42f7-85ee-ec4bf1faf185', -- Keyboards (duplicate)
  'e4153e09-eda3-4a6a-9ba7-978fe9f10a46', -- Processors (duplicate)
  '13084ce4-2f2b-4051-a7f4-5eae91b5ae66', -- Memory (duplicate)
  '42fe4fab-91a6-41af-927a-47ddb61287b0', -- Motherboards (duplicate)
  '97d655ca-7187-491c-8cc0-7958bca1858f'  -- Storage (duplicate)
);

-- Step 3: Delete duplicate categories (only if Step 2 shows 0 products)
-- UNCOMMENTED - Ready to execute after verification
DELETE FROM product_categories 
WHERE id IN (
  '286c03dd-c267-480e-b2e3-03fac6df0b1b', -- Monitors (duplicate)
  'aa9b3d16-a6b6-4d0d-b412-534e8af7c045', -- Graphics Cards (duplicate)
  '33c17a94-09e4-42f7-85ee-ec4bf1faf185', -- Keyboards (duplicate)
  'e4153e09-eda3-4a6a-9ba7-978fe9f10a46', -- Processors (duplicate)
  '13084ce4-2f2b-4051-a7f4-5eae91b5ae66', -- Memory (duplicate)
  '42fe4fab-91a6-41af-927a-47ddb61287b0', -- Motherboards (duplicate)
  '97d655ca-7187-491c-8cc0-7958bca1858f'  -- Storage (duplicate)
);

-- Step 4: Show final category list
SELECT 
  id,
  name,
  slug,
  CASE WHEN image_url IS NOT NULL THEN 'Has Image' ELSE 'No Image' END as image_status,
  (SELECT COUNT(*) FROM products WHERE category_id = pc.id) as product_count
FROM product_categories pc
ORDER BY name;

-- Step 5: Show confirmation message
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'DUPLICATE CATEGORY CLEANUP COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Products have been remapped to existing categories';
  RAISE NOTICE 'Check the verification query above';
  RAISE NOTICE 'If it shows 0 remaining products, uncomment and run Step 3';
  RAISE NOTICE '==============================================';
END $$;
