-- Step 1: Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'product_views';

-- Step 2: Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'product_views';

-- Step 3: Disable RLS temporarily for testing (ONLY FOR TESTING!)
-- ALTER TABLE product_views DISABLE ROW LEVEL SECURITY;

-- Step 4: Try manual insert to test
-- INSERT INTO product_views (product_id, session_id)
-- VALUES (
--   (SELECT id FROM products LIMIT 1),
--   'test-manual-' || NOW()::TEXT
-- );

-- Step 5: Check if insert worked
-- SELECT * FROM product_views;
