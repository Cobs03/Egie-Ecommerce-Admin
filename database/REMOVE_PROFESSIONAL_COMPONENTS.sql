-- REMOVE PROFESSIONAL COMPONENTS SYSTEM
-- This removes the complex component tables and restores simple hardcoded component approach

-- ==========================================
-- 🗑️ DROP PROFESSIONAL TABLES
-- ==========================================

-- First, remove the foreign key constraint and category_id column from products table
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE products DROP COLUMN IF EXISTS category_id;

-- Drop the many-to-many relationship table first (foreign key dependencies)
DROP TABLE IF EXISTS product_components;

-- Drop the components table
DROP TABLE IF EXISTS components;

-- Now we can safely drop the product categories table
DROP TABLE IF EXISTS product_categories;

-- ==========================================
-- 🔄 RESTORE SIMPLE PRODUCTS TABLE
-- ==========================================

-- The category_id column and foreign key constraint have already been removed above
-- Products table is now restored to simple structure

-- ==========================================
-- ✅ SIMPLE SYSTEM VERIFICATION
-- ==========================================

-- The products table should now only have:
-- - id, name, description, warranty, brand_id, price, stock_quantity, sku, images
-- - selected_components (JSONB) - for storing hardcoded component selection
-- - specifications (JSONB) - for storing component specifications
-- - variants, metadata, status, created_at, updated_at

-- Show current products table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- ==========================================
-- 📝 NOTES
-- ==========================================

-- After running this script:
-- 1. Your products table will be back to the simple structure
-- 2. Your hardcoded ComponentData.json will work perfectly
-- 3. No more complex component relationships
-- 4. The simple ComponentsSlider will work as intended
-- 5. Products will store selected_components as a simple JSON array

-- The simple system stores components like this in products.selected_components:
-- [
--   {"id": "cpu", "name": "Processor", "category": "CPU"},
--   {"id": "gpu", "name": "Graphics Card", "category": "GPU"}
-- ]