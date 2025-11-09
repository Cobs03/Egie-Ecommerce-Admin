-- =====================================================
-- ADD VOUCHER TYPE COLUMN
-- =====================================================
-- This adds the discount_type column to vouchers table
-- to support both fixed amount and percentage discounts
-- =====================================================

-- Add discount_type column to vouchers table
ALTER TABLE vouchers 
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'fixed' 
CHECK (discount_type IN ('fixed', 'percent'));

-- Set existing vouchers to 'fixed' type (default)
UPDATE vouchers 
SET discount_type = 'fixed' 
WHERE discount_type IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE vouchers 
ALTER COLUMN discount_type SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN vouchers.discount_type IS 'Type of discount: fixed (₱ amount) or percent (% value)';

-- =====================================================
-- SUCCESS! discount_type column added to vouchers
-- =====================================================
-- Now vouchers can be either:
-- - 'fixed': price = 100 means ₱100 off
-- - 'percent': price = 10 means 10% off
-- =====================================================
