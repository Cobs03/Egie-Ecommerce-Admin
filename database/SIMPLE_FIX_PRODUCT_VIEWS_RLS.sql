-- ============================================
-- SIMPLE FIX: Allow everyone to insert product views
-- ============================================

-- Step 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can insert product views" ON product_views;
DROP POLICY IF EXISTS "Public can insert product views" ON product_views;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON product_views;
DROP POLICY IF EXISTS "Enable insert for all users" ON product_views;
DROP POLICY IF EXISTS "Service role can read all views" ON product_views;
DROP POLICY IF EXISTS "Admins can view all product views" ON product_views;

-- Step 2: Create ONE simple policy for INSERT (allow everyone)
CREATE POLICY "allow_all_inserts"
ON product_views
FOR INSERT
TO public
WITH CHECK (true);

-- Step 3: Create ONE simple policy for SELECT (allow authenticated users)
CREATE POLICY "allow_authenticated_select"
ON product_views
FOR SELECT
TO authenticated
USING (true);

-- Step 4: Grant permissions explicitly
GRANT INSERT ON product_views TO anon;
GRANT INSERT ON product_views TO authenticated;
GRANT SELECT ON product_views TO authenticated;
GRANT ALL ON product_views TO service_role;

-- Step 5: Verify policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'product_views';

-- Step 6: Test manual insert
INSERT INTO product_views (product_id, session_id)
VALUES (
  (SELECT id FROM products LIMIT 1),
  'test-policy-' || NOW()::TEXT
);

-- Step 7: Check if insert worked
SELECT COUNT(*) as total_rows FROM product_views;

-- Step 8: If still empty, try disabling RLS entirely (TEMPORARY TEST)
-- Uncomment this ONLY if above didn't work:
-- ALTER TABLE product_views DISABLE ROW LEVEL SECURITY;
-- Then try inserting again from the website

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ RLS POLICIES SIMPLIFIED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Policies created:';
  RAISE NOTICE '  1. allow_all_inserts (INSERT for everyone)';
  RAISE NOTICE '  2. allow_authenticated_select (SELECT for authenticated)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Click a product in e-commerce site and check console!';
  RAISE NOTICE '========================================';
END $$;
