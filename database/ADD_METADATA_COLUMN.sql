-- Add metadata column to products table
-- This column will store complex product data like components, variants, etc.

ALTER TABLE products 
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

-- Add a comment to document the purpose
COMMENT ON COLUMN products.metadata IS 'Complex product data including components, advanced specifications, variants, and other custom data';

-- Add an index for better performance when querying metadata
CREATE INDEX IF NOT EXISTS idx_products_metadata ON products USING gin(metadata);

-- Optional: Add some example metadata structure documentation
-- metadata can contain:
-- {
--   "components": [...],
--   "specifications": {...},
--   "warranty": "...",
--   "variants": [...],
--   "images": [...],
--   "officialPrice": 0,
--   "initialPrice": 0,
--   "discount": 0
-- }