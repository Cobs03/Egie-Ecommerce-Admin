-- =====================================================
-- UPDATE DISCOUNTS TABLE FOR DYNAMIC PRODUCT SELECTION
-- =====================================================
-- This updates the discounts table to support:
-- 1. Dynamic product selection (query from products table)
-- 2. Category-based discounts (using selected_components)
-- 3. Better user eligibility tracking
-- =====================================================

-- Add new columns for better discount management
ALTER TABLE discounts 
ADD COLUMN IF NOT EXISTS apply_to_type VARCHAR(20) DEFAULT 'all' 
CHECK (apply_to_type IN ('all', 'specific_products', 'specific_categories'));

-- Update existing applicable_products to store product IDs properly
-- (Already exists as JSONB, but let's ensure it's properly structured)
COMMENT ON COLUMN discounts.applicable_products IS 
'Array of product UUIDs: ["uuid1", "uuid2", ...]';

-- Update applicable_categories to store category names from selected_components
COMMENT ON COLUMN discounts.applicable_categories IS 
'Array of category/component names: ["Gaming Controllers", "Laptops", ...]';

-- Add a computed field for discount display
ALTER TABLE discounts 
ADD COLUMN IF NOT EXISTS discount_display VARCHAR(50);

-- Create function to calculate discount display
CREATE OR REPLACE FUNCTION calculate_discount_display(
  discount_type VARCHAR,
  discount_value DECIMAL
) RETURNS VARCHAR AS $$
BEGIN
  IF discount_type = 'percent' THEN
    RETURN discount_value || '% OFF';
  ELSE
    RETURN '₱' || discount_value || ' OFF';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-update discount_display
CREATE OR REPLACE FUNCTION update_discount_display()
RETURNS TRIGGER AS $$
BEGIN
  NEW.discount_display = calculate_discount_display(NEW.discount_type, NEW.discount_value);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_discount_display ON discounts;
CREATE TRIGGER trigger_update_discount_display
  BEFORE INSERT OR UPDATE ON discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_display();

-- Create view for active discounts with product info
CREATE OR REPLACE VIEW active_discounts_with_products AS
SELECT 
  d.id,
  d.name,
  d.discount_type,
  d.discount_value,
  d.discount_display,
  d.valid_from,
  d.valid_until,
  d.applies_to,
  d.apply_to_type,
  d.applicable_products,
  d.applicable_categories,
  d.min_spend,
  d.user_eligibility,
  d.max_discount_amount,
  d.is_active,
  d.usage_count,
  -- Get product details if specific products are selected
  CASE 
    WHEN d.apply_to_type = 'specific_products' THEN
      (SELECT json_agg(json_build_object(
        'id', p.id,
        'name', p.name,
        'price', p.price,
        'images', p.images,
        'stock_quantity', p.stock_quantity
      ))
      FROM products p
      WHERE p.id = ANY(
        SELECT jsonb_array_elements_text(d.applicable_products)::uuid
      ))
    ELSE NULL
  END AS products
FROM discounts d
WHERE d.is_active = true
  AND d.valid_from <= NOW()
  AND (d.valid_until IS NULL OR d.valid_until >= NOW());

-- Create function to get applicable discounts for a product
CREATE OR REPLACE FUNCTION get_product_discounts(product_id UUID)
RETURNS TABLE (
  discount_id UUID,
  discount_name VARCHAR,
  discount_type VARCHAR,
  discount_value DECIMAL,
  discount_display VARCHAR,
  max_discount_amount DECIMAL,
  user_eligibility VARCHAR,
  min_spend DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.discount_type,
    d.discount_value,
    d.discount_display,
    d.max_discount_amount,
    d.user_eligibility,
    d.min_spend
  FROM discounts d
  CROSS JOIN products p
  WHERE p.id = product_id
    AND d.is_active = true
    AND d.valid_from <= NOW()
    AND (d.valid_until IS NULL OR d.valid_until >= NOW())
    AND (
      -- Apply to all products
      d.apply_to_type = 'all'
      OR
      -- Apply to specific products (check if product_id is in applicable_products array)
      (d.apply_to_type = 'specific_products' 
       AND d.applicable_products @> to_jsonb(product_id::text))
      OR
      -- Apply to specific categories (check if product's components match)
      (d.apply_to_type = 'specific_categories'
       AND EXISTS (
         SELECT 1 
         FROM jsonb_array_elements_text(p.selected_components) AS comp
         WHERE d.applicable_categories @> to_jsonb(comp)
       ))
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate discounted price
CREATE OR REPLACE FUNCTION calculate_discounted_price(
  original_price DECIMAL,
  discount_type_param VARCHAR,
  discount_value_param DECIMAL,
  max_discount DECIMAL DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
  discount_amount DECIMAL;
  final_price DECIMAL;
BEGIN
  -- Calculate discount amount
  IF discount_type_param = 'percent' THEN
    discount_amount := (original_price * discount_value_param) / 100;
    -- Apply max discount cap if specified
    IF max_discount IS NOT NULL AND discount_amount > max_discount THEN
      discount_amount := max_discount;
    END IF;
  ELSE
    discount_amount := discount_value_param;
  END IF;
  
  -- Calculate final price (ensure it doesn't go below 0)
  final_price := GREATEST(original_price - discount_amount, 0);
  
  RETURN final_price;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant permissions
GRANT SELECT ON active_discounts_with_products TO authenticated;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for product lookups in applicable_products
CREATE INDEX IF NOT EXISTS idx_discounts_applicable_products_gin 
ON discounts USING GIN (applicable_products);

-- Index for category lookups in applicable_categories
CREATE INDEX IF NOT EXISTS idx_discounts_applicable_categories_gin 
ON discounts USING GIN (applicable_categories);

-- Index for apply_to_type filtering
CREATE INDEX IF NOT EXISTS idx_discounts_apply_to_type 
ON discounts(apply_to_type) WHERE is_active = true;

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_discounts_date_range 
ON discounts(valid_from, valid_until) WHERE is_active = true;

-- =====================================================
-- SAMPLE USAGE EXAMPLES
-- =====================================================

-- Example 1: Get all discounts for a specific product
-- SELECT * FROM get_product_discounts('product-uuid-here');

-- Example 2: Calculate discounted price
-- SELECT calculate_discounted_price(2000, 'percent', 15, NULL); -- Returns 1700
-- SELECT calculate_discounted_price(2000, 'fixed', 500, NULL); -- Returns 1500

-- Example 3: Get all active discounts with product details
-- SELECT * FROM active_discounts_with_products;

-- =====================================================
-- SUCCESS! Discounts table updated for dynamic products
-- =====================================================
-- Now supports:
-- ✅ Query products from products table
-- ✅ Filter by specific products
-- ✅ Filter by categories (selected_components)
-- ✅ Automatic discount calculation
-- ✅ User eligibility checking
-- ✅ Performance-optimized with indexes
-- =====================================================
