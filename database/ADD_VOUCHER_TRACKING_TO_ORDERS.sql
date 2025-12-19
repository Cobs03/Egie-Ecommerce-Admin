-- ============================================
-- ADD VOUCHER TRACKING TO ORDERS
-- ============================================
-- This script adds voucher tracking columns to orders table
-- and creates functions for voucher validation and usage tracking
-- ============================================

-- Step 1: Add voucher columns to orders table
-- ============================================
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS voucher_discount DECIMAL(10, 2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN orders.voucher_id IS 'Reference to the voucher used in this order';
COMMENT ON COLUMN orders.voucher_code IS 'Snapshot of voucher code at time of order';
COMMENT ON COLUMN orders.voucher_discount IS 'Amount discounted by voucher';

-- Add index for voucher queries
CREATE INDEX IF NOT EXISTS idx_orders_voucher_id ON orders(voucher_id);

-- Step 2: Create function to validate voucher for user
-- ============================================
CREATE OR REPLACE FUNCTION validate_voucher_for_user(
  p_voucher_code VARCHAR(50),
  p_user_id UUID,
  p_cart_total DECIMAL(10, 2)
)
RETURNS TABLE(
  valid BOOLEAN,
  message TEXT,
  voucher_id UUID,
  discount_amount DECIMAL(10, 2),
  discount_type VARCHAR(20),
  voucher_value DECIMAL(10, 2)
) AS $$
DECLARE
  v_voucher RECORD;
  v_usage_count INTEGER;
  v_discount DECIMAL(10, 2);
  v_user_is_new BOOLEAN;
BEGIN
  -- Find the voucher
  SELECT * INTO v_voucher
  FROM vouchers
  WHERE code = UPPER(p_voucher_code)
  AND is_active = true;
  
  -- Check if voucher exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Invalid voucher code', NULL::UUID, 0::DECIMAL, NULL::VARCHAR, 0::DECIMAL;
    RETURN;
  END IF;
  
  -- Check if voucher is within valid dates
  IF NOW() < v_voucher.valid_from THEN
    RETURN QUERY SELECT false, 'This voucher is not yet valid', NULL::UUID, 0::DECIMAL, NULL::VARCHAR, 0::DECIMAL;
    RETURN;
  END IF;
  
  IF NOW() > v_voucher.valid_until THEN
    RETURN QUERY SELECT false, 'This voucher has expired', NULL::UUID, 0::DECIMAL, NULL::VARCHAR, 0::DECIMAL;
    RETURN;
  END IF;
  
  -- Check if voucher has reached global usage limit
  IF v_voucher.usage_count >= v_voucher.usage_limit THEN
    RETURN QUERY SELECT false, 'This voucher has reached its usage limit', NULL::UUID, 0::DECIMAL, NULL::VARCHAR, 0::DECIMAL;
    RETURN;
  END IF;
  
  -- Check minimum purchase amount
  IF p_cart_total < v_voucher.min_purchase_amount THEN
    RETURN QUERY SELECT 
      false, 
      'Minimum purchase of ₱' || v_voucher.min_purchase_amount || ' required',
      NULL::UUID,
      0::DECIMAL,
      NULL::VARCHAR,
      0::DECIMAL;
    RETURN;
  END IF;
  
  -- Check user-specific usage (per_customer_limit)
  SELECT COUNT(*) INTO v_usage_count
  FROM voucher_usage
  WHERE voucher_id = v_voucher.id
  AND customer_id = p_user_id;
  
  IF v_usage_count >= v_voucher.per_customer_limit THEN
    RETURN QUERY SELECT false, 'You have already used this voucher', NULL::UUID, 0::DECIMAL, NULL::VARCHAR, 0::DECIMAL;
    RETURN;
  END IF;
  
  -- Check user eligibility based on user_restriction
  IF v_voucher.user_restriction IS NOT NULL AND v_voucher.user_restriction != 'all' THEN
    -- Determine if user is new (has no completed orders)
    SELECT NOT EXISTS (
      SELECT 1 FROM orders 
      WHERE user_id = p_user_id 
      AND status IN ('delivered', 'completed')
    ) INTO v_user_is_new;
    
    IF v_voucher.user_restriction = 'new' AND NOT v_user_is_new THEN
      RETURN QUERY SELECT false, 'This voucher is only for new customers', NULL::UUID, 0::DECIMAL, NULL::VARCHAR, 0::DECIMAL;
      RETURN;
    END IF;
    
    IF v_voucher.user_restriction = 'existing' AND v_user_is_new THEN
      RETURN QUERY SELECT false, 'This voucher is only for existing customers', NULL::UUID, 0::DECIMAL, NULL::VARCHAR, 0::DECIMAL;
      RETURN;
    END IF;
  END IF;
  
  -- Calculate discount based on type
  IF v_voucher.discount_type = 'percent' THEN
    -- Percentage discount
    v_discount := p_cart_total * (v_voucher.price / 100);
    -- Round to 2 decimal places
    v_discount := ROUND(v_discount, 2);
  ELSE
    -- Fixed amount discount
    v_discount := v_voucher.price;
    -- Don't allow discount to exceed cart total
    IF v_discount > p_cart_total THEN
      v_discount := p_cart_total;
    END IF;
  END IF;
  
  -- All validations passed
  RETURN QUERY SELECT 
    true, 
    'Voucher applied successfully'::TEXT,
    v_voucher.id,
    v_discount,
    v_voucher.discount_type,
    v_voucher.price;
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create function to record voucher usage
-- ============================================
CREATE OR REPLACE FUNCTION record_voucher_usage(
  p_voucher_id UUID,
  p_customer_id UUID,
  p_order_id UUID,
  p_discount_amount DECIMAL(10, 2),
  p_original_amount DECIMAL(10, 2),
  p_final_amount DECIMAL(10, 2)
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert voucher usage record
  INSERT INTO voucher_usage (
    voucher_id,
    customer_id,
    order_id,
    discount_amount,
    original_amount,
    final_amount
  ) VALUES (
    p_voucher_id,
    p_customer_id,
    p_order_id,
    p_discount_amount,
    p_original_amount,
    p_final_amount
  );
  
  -- Increment voucher usage count
  UPDATE vouchers
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = p_voucher_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Add user_restriction column to vouchers table if it doesn't exist
-- ============================================
ALTER TABLE vouchers
ADD COLUMN IF NOT EXISTS user_restriction VARCHAR(50) DEFAULT 'all'
CHECK (user_restriction IN ('all', 'new', 'existing', 'selected'));

COMMENT ON COLUMN vouchers.user_restriction IS 'User eligibility: all, new, existing, or selected customers';

-- Step 5: Update voucher_usage table to reference orders
-- ============================================
DO $$ 
BEGIN
  -- Add order_id foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'voucher_usage_order_id_fkey'
  ) THEN
    ALTER TABLE voucher_usage
    ADD CONSTRAINT voucher_usage_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Summary
DO $$ 
BEGIN
  RAISE NOTICE '✅ Voucher tracking added to orders table!';
  RAISE NOTICE '✅ Voucher validation function created!';
  RAISE NOTICE '✅ Voucher usage recording function created!';
  RAISE NOTICE '📋 Orders table now has: voucher_id, voucher_code, voucher_discount columns';
  RAISE NOTICE '📋 validate_voucher_for_user() - validates voucher eligibility and calculates discount';
  RAISE NOTICE '📋 record_voucher_usage() - tracks voucher usage and increments counter';
END $$;
