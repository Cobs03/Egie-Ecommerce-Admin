-- ================================================
-- ADD COMPATIBILITY TAGS TO PRODUCTS TABLE
-- ================================================
-- This migration adds a compatibility_tags column to store
-- tags for product recommendations (e.g., "DDR5", "AMD AM5", "M.2 NVMe")
-- ================================================

-- Add compatibility_tags column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS compatibility_tags TEXT[] DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN products.compatibility_tags IS 
'Array of compatibility tags for product recommendations. Used to match compatible PC components (e.g., motherboard socket types, RAM types, storage interfaces).';

-- Create index for faster tag-based queries
CREATE INDEX IF NOT EXISTS idx_products_compatibility_tags 
ON products USING GIN (compatibility_tags);

-- Example query to find products with matching tags:
-- SELECT * FROM products 
-- WHERE compatibility_tags && ARRAY['DDR5', 'AMD AM5'];

COMMENT ON INDEX idx_products_compatibility_tags IS 
'GIN index for efficient tag-based product queries using array overlap operators.';
