-- ============================================
-- PRODUCT REVIEWS SYSTEM - COMPLETE SETUP
-- ============================================
-- Creates: product_reviews table with RLS
-- Features:
-- - Users can review products they purchased
-- - 1-5 star rating system
-- - Review text (optional)
-- - Verified purchase badge
-- - Edit/delete own reviews
-- - Average rating and count per product
-- ============================================

-- Step 1: Create product_reviews table
-- ============================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rating (1-5 stars)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Review details
  title VARCHAR(200),
  comment TEXT,
  
  -- Verified purchase (optional - can be implemented later)
  verified_purchase BOOLEAN DEFAULT false,
  
  -- Helpful votes (for future feature)
  helpful_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One review per user per product
  UNIQUE(product_id, user_id)
);

-- Add comments
COMMENT ON TABLE product_reviews IS 'Product reviews and ratings by users';
COMMENT ON COLUMN product_reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN product_reviews.verified_purchase IS 'True if user purchased this product';
COMMENT ON COLUMN product_reviews.helpful_count IS 'Number of users who found this review helpful';

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON product_reviews(created_at DESC);

-- Step 2: Create function to update review timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_review_timestamp ON product_reviews;
CREATE TRIGGER trigger_update_review_timestamp
BEFORE UPDATE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_review_timestamp();

-- Step 3: Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies
-- ============================================

-- Anyone (including anonymous) can view all reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON product_reviews;
CREATE POLICY "Anyone can view reviews"
ON product_reviews FOR SELECT
TO public
USING (true);

-- Authenticated users can create reviews
DROP POLICY IF EXISTS "Users can create own reviews" ON product_reviews;
CREATE POLICY "Users can create own reviews"
ON product_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
DROP POLICY IF EXISTS "Users can update own reviews" ON product_reviews;
CREATE POLICY "Users can update own reviews"
ON product_reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
DROP POLICY IF EXISTS "Users can delete own reviews" ON product_reviews;
CREATE POLICY "Users can delete own reviews"
ON product_reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 5: Create function to get product rating summary
-- ============================================
CREATE OR REPLACE FUNCTION get_product_rating_summary(p_product_id UUID)
RETURNS TABLE(
  product_id UUID,
  average_rating NUMERIC(3,2),
  total_reviews INTEGER,
  rating_5_count INTEGER,
  rating_4_count INTEGER,
  rating_3_count INTEGER,
  rating_2_count INTEGER,
  rating_1_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_product_id as product_id,
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0) as average_rating,
    COUNT(*)::INTEGER as total_reviews,
    COUNT(*) FILTER (WHERE rating = 5)::INTEGER as rating_5_count,
    COUNT(*) FILTER (WHERE rating = 4)::INTEGER as rating_4_count,
    COUNT(*) FILTER (WHERE rating = 3)::INTEGER as rating_3_count,
    COUNT(*) FILTER (WHERE rating = 2)::INTEGER as rating_2_count,
    COUNT(*) FILTER (WHERE rating = 1)::INTEGER as rating_1_count
  FROM product_reviews
  WHERE product_reviews.product_id = p_product_id
  GROUP BY p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create function to get reviews with user info
-- ============================================
CREATE OR REPLACE FUNCTION get_product_reviews(
  p_product_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  product_id UUID,
  user_id UUID,
  user_email TEXT,
  rating INTEGER,
  title VARCHAR(200),
  comment TEXT,
  verified_purchase BOOLEAN,
  helpful_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.product_id,
    pr.user_id,
    u.email as user_email,
    pr.rating,
    pr.title,
    pr.comment,
    pr.verified_purchase,
    pr.helpful_count,
    pr.created_at,
    pr.updated_at
  FROM product_reviews pr
  JOIN auth.users u ON u.id = pr.user_id
  WHERE pr.product_id = p_product_id
  ORDER BY pr.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create view for product stats (including reviews)
-- ============================================
CREATE OR REPLACE VIEW product_stats AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  COALESCE(ROUND(AVG(pr.rating)::numeric, 2), 0) as average_rating,
  COUNT(pr.id)::INTEGER as review_count,
  COUNT(pr.id) FILTER (WHERE pr.rating = 5)::INTEGER as rating_5_count,
  COUNT(pr.id) FILTER (WHERE pr.rating = 4)::INTEGER as rating_4_count,
  COUNT(pr.id) FILTER (WHERE pr.rating = 3)::INTEGER as rating_3_count,
  COUNT(pr.id) FILTER (WHERE pr.rating = 2)::INTEGER as rating_2_count,
  COUNT(pr.id) FILTER (WHERE pr.rating = 1)::INTEGER as rating_1_count
FROM products p
LEFT JOIN product_reviews pr ON pr.product_id = p.id
GROUP BY p.id, p.name;

-- Add comment
COMMENT ON VIEW product_stats IS 'Product statistics including average rating and review counts';

-- Step 8: Verification Queries
-- ============================================

-- Check if table was created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_reviews') THEN
    RAISE NOTICE '✅ Table created successfully: product_reviews';
  ELSE
    RAISE NOTICE '❌ Table creation failed';
  END IF;
END $$;

-- Check if RLS is enabled
DO $$
BEGIN
  IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'product_reviews') THEN
    RAISE NOTICE '✅ Row Level Security enabled';
  ELSE
    RAISE NOTICE '❌ RLS not enabled';
  END IF;
END $$;

-- Check policies count
DO $$
DECLARE
  policies_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies
  WHERE tablename = 'product_reviews';
  
  RAISE NOTICE '✅ Policies created: %', policies_count;
END $$;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PRODUCT REVIEWS SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Table Created:';
  RAISE NOTICE '  • product_reviews';
  RAISE NOTICE '';
  RAISE NOTICE 'Features Enabled:';
  RAISE NOTICE '  • 1-5 star rating system';
  RAISE NOTICE '  • Review title and comment';
  RAISE NOTICE '  • One review per user per product';
  RAISE NOTICE '  • Users can edit/delete own reviews';
  RAISE NOTICE '  • Public can view all reviews';
  RAISE NOTICE '  • Verified purchase badge (optional)';
  RAISE NOTICE '  • Helpful votes counter';
  RAISE NOTICE '';
  RAISE NOTICE 'Helper Functions:';
  RAISE NOTICE '  • get_product_rating_summary(product_id)';
  RAISE NOTICE '  • get_product_reviews(product_id, limit, offset)';
  RAISE NOTICE '';
  RAISE NOTICE 'Views:';
  RAISE NOTICE '  • product_stats (avg rating + counts)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Run this SQL in Supabase';
  RAISE NOTICE '  2. Create ReviewService.js in frontend';
  RAISE NOTICE '  3. Update ProductGrid to show ratings';
  RAISE NOTICE '  4. Create Review modal component';
  RAISE NOTICE '  5. Add review form to product details';
  RAISE NOTICE '========================================';
END $$;
