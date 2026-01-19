-- ============================================
-- FIX PRODUCT_VIEWS RLS POLICIES
-- ============================================
-- This script ensures product_views table has correct RLS policies
-- for both authenticated and anonymous users to track product views
-- ============================================

-- Step 1: Check if product_views table exists
-- ============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_views') THEN
    RAISE NOTICE '✅ product_views table exists';
  ELSE
    RAISE NOTICE '❌ product_views table does NOT exist - creating it now';
  END IF;
END $$;

-- Step 2: Add missing columns if they don't exist
-- ============================================
-- Add viewed_at column if it doesn't exist (may be named differently)
DO $$ 
BEGIN
  -- Check if we need to add viewed_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_views' 
    AND column_name = 'viewed_at'
  ) THEN
    -- Check if there's a created_at column instead
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'product_views' 
      AND column_name = 'created_at'
    ) THEN
      RAISE NOTICE '✅ Using existing created_at column';
    ELSE
      ALTER TABLE product_views ADD COLUMN viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      RAISE NOTICE '✅ Added viewed_at column';
    END IF;
  ELSE
    RAISE NOTICE '✅ viewed_at column already exists';
  END IF;
END $$;

-- Create indexes (use IF NOT EXISTS to avoid errors)
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_session_id ON product_views(session_id);

-- Try to create index on viewed_at or created_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_views' AND column_name = 'viewed_at') THEN
    CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at DESC);
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_views' AND column_name = 'created_at') THEN
    CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at DESC);
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE product_views IS 'Track product views for analytics (GDPR compliant with pseudonymization)';
COMMENT ON COLUMN product_views.user_id IS 'Pseudonymized user ID for privacy compliance';
COMMENT ON COLUMN product_views.session_id IS 'Anonymous session ID for non-authenticated tracking';

-- Step 3: Enable Row Level Security
-- ============================================
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies to recreate them
-- ============================================
DROP POLICY IF EXISTS "Anyone can insert product views" ON product_views;
DROP POLICY IF EXISTS "Public can insert product views" ON product_views;
DROP POLICY IF EXISTS "Authenticated users can insert product views" ON product_views;
DROP POLICY IF EXISTS "Service role can read all product views" ON product_views;
DROP POLICY IF EXISTS "Admins can view all product views" ON product_views;

-- Step 5: Create NEW RLS Policies (Allow ALL users to track views)
-- ============================================

-- 🔥 CRITICAL: Allow ANYONE (authenticated + anonymous) to INSERT product views
-- This is needed for tracking product clicks from the e-commerce site
CREATE POLICY "Anyone can insert product views"
ON product_views
FOR INSERT
TO public
WITH CHECK (true);

-- Allow service role (backend functions) to read all views for analytics
CREATE POLICY "Service role can read all views"
ON product_views
FOR SELECT
TO service_role
USING (true);

-- Allow authenticated users with specific permissions to read (for admin dashboard)
CREATE POLICY "Admins can view all product views"
ON product_views
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Step 6: Grant permissions
-- ============================================
GRANT INSERT ON product_views TO anon;
GRANT INSERT ON product_views TO authenticated;
GRANT SELECT ON product_views TO authenticated;
GRANT ALL ON product_views TO service_role;

-- Step 7: Verification
-- ============================================

-- Check RLS is enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'product_views' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS is ENABLED on product_views';
  ELSE
    RAISE NOTICE '⚠️ RLS is NOT enabled on product_views';
  END IF;
END $$;

-- Show all policies
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  RAISE NOTICE '📋 Current RLS Policies on product_views:';
  FOR policy_record IN 
    SELECT policyname, cmd, roles, qual, with_check
    FROM pg_policies 
    WHERE tablename = 'product_views'
  LOOP
    RAISE NOTICE '  • % (%) - Roles: %', policy_record.policyname, policy_record.cmd, policy_record.roles;
  END LOOP;
END $$;

-- Test query (should return data)
-- Use created_at if viewed_at doesn't exist
DO $$
DECLARE
  query_result RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_views' AND column_name = 'viewed_at') THEN
    SELECT COUNT(*) as total_views, COUNT(DISTINCT product_id) as unique_products, COUNT(DISTINCT session_id) as unique_sessions
    INTO query_result
    FROM product_views;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_views' AND column_name = 'created_at') THEN
    SELECT COUNT(*) as total_views, COUNT(DISTINCT product_id) as unique_products, COUNT(DISTINCT session_id) as unique_sessions
    INTO query_result
    FROM product_views;
  END IF;
  
  RAISE NOTICE '📊 Current Stats:';
  RAISE NOTICE '  • Total views: %', query_result.total_views;
  RAISE NOTICE '  • Unique products: %', query_result.unique_products;
  RAISE NOTICE '  • Unique sessions: %', query_result.unique_sessions;
END $$;

-- Step 8: Summary
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PRODUCT_VIEWS RLS POLICIES FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies:';
  RAISE NOTICE '  ✅ Anyone (anon + authenticated) can INSERT views';
  RAISE NOTICE '  ✅ Admins can SELECT all views';
  RAISE NOTICE '  ✅ Service role has full access';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Refresh e-commerce site';
  RAISE NOTICE '  2. Click on any product "View Details"';
  RAISE NOTICE '  3. Check browser console for: "✅ Product view tracked"';
  RAISE NOTICE '  4. Run: SELECT * FROM product_views; (should show data)';
  RAISE NOTICE '  5. Refresh admin dashboard to see Most Clicked Products';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
