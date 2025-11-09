-- =====================================================
-- ADD IMAGE SUPPORT TO CATEGORIES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add image_url column to product_categories
ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN product_categories.image_url IS 'URL to the category image (uploaded to Supabase Storage or external URL)';

-- Update icon_url column name for clarity (optional - keeps backward compatibility)
-- You can use either icon_url or image_url, but image_url is more descriptive

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'product_categories' 
  AND column_name IN ('image_url', 'icon_url')
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Category image column added successfully!';
    RAISE NOTICE '📸 You can now add images when creating/editing categories';
    RAISE NOTICE '🎯 Next: Update CategoryManagement.jsx to add image upload UI';
END$$;
