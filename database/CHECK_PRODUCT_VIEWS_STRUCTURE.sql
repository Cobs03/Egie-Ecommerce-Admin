-- Check the actual structure of product_views table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'product_views'
ORDER BY ordinal_position;
