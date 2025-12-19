-- ============================================
-- FIX VOUCHER VALIDATION AMBIGUOUS COLUMN
-- ============================================
-- This fixes the "column reference voucher_id is ambiguous" error
-- by using table aliases in the voucher usage check
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
  
  -- Check user-specific usage (per_customer_limit) - FIXED: Qualified column name
  SELECT COUNT(*) INTO v_usage_count
  FROM voucher_usage vu
  WHERE vu.voucher_id = v_voucher.id
  AND vu.customer_id = p_user_id;
  
  IF v_usage_count >= v_voucher.per_customer_limit THEN
    RETURN QUERY SELECT false, 'You have already used this voucher', NULL::UUID, 0::DECIMAL, NULL::VARCHAR, 0::DECIMAL;
    RETURN;
  END IF;
  
  -- Check user eligibility based on user_restriction
  IF v_voucher.user_restriction IS NOT NULL AND v_voucher.user_restriction != 'all' THEN
    -- Determine if user is new (has no completed orders)
    SELECT NOT EXISTS (
      SELECT 1 FROM orders o
      WHERE o.user_id = p_user_id 
      AND o.status IN ('delivered', 'completed')
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

-- Summary
DO $$ 
BEGIN
  RAISE NOTICE '✅ Fixed ambiguous column reference in validate_voucher_for_user()';
  RAISE NOTICE '📋 Added table aliases to voucher_usage and orders queries';
END $$;
