-- ============================================
-- ADD USER INFO TO PRODUCT REVIEWS
-- ============================================
-- Adds user_email and user_name columns to store reviewer information
-- This allows displaying reviewer names without querying auth.users
-- ============================================

-- Step 1: Add columns for user information
ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);

-- Step 2: Add comments
COMMENT ON COLUMN product_reviews.user_email IS 'Email of the user who wrote the review (stored for display)';
COMMENT ON COLUMN product_reviews.user_name IS 'Name of the user who wrote the review (stored for display)';

-- Step 3: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_user_email ON product_reviews(user_email);

-- Step 4: Update existing reviews with user emails (if any exist)
-- This tries to get emails from profiles table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        UPDATE product_reviews pr
        SET user_email = p.email,
            user_name = COALESCE(p.name, SPLIT_PART(p.email, '@', 1))
        FROM profiles p
        WHERE pr.user_id = p.id
        AND pr.user_email IS NULL;
    END IF;
END $$;

-- Step 5: Verification
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'product_reviews' 
    AND column_name = 'user_email'
  ) THEN
    RAISE NOTICE '✅ Column user_email added successfully';
  END IF;
  
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'product_reviews' 
    AND column_name = 'user_name'
  ) THEN
    RAISE NOTICE '✅ Column user_name added successfully';
  END IF;
END $$;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ USER INFO COLUMNS ADDED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes Made:';
  RAISE NOTICE '  • Added user_email column';
  RAISE NOTICE '  • Added user_name column';
  RAISE NOTICE '  • Created index on user_email';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Update ReviewService.addReview() to save user info';
  RAISE NOTICE '  2. Update ReviewService.getProductReviews() to return these fields';
  RAISE NOTICE '  3. Display user_name in the frontend';
  RAISE NOTICE '========================================';
END $$;
