-- ============================================
-- FIX CREATE ORDER FUNCTION FOR VOUCHER SUPPORT
-- ============================================
-- Drop existing function and recreate with correct parameters
-- ============================================

-- Drop the existing function
DROP FUNCTION IF EXISTS create_order_from_cart(uuid,character varying,uuid,text,character varying,uuid,character varying,numeric);

-- Recreate with correct voucher parameters
CREATE OR REPLACE FUNCTION create_order_from_cart(
  p_user_id UUID,
  p_delivery_type VARCHAR(20),
  p_shipping_address_id UUID,
  p_customer_notes TEXT,
  p_payment_method VARCHAR(20),
  p_voucher_id UUID DEFAULT NULL,
  p_voucher_code VARCHAR(50) DEFAULT NULL,
  p_voucher_discount DECIMAL(10, 2) DEFAULT 0
)
RETURNS TABLE(
  order_id UUID,
  order_number VARCHAR(50),
  payment_id UUID,
  transaction_id VARCHAR(100),
  total DECIMAL(10, 2)
) AS $$
DECLARE
  v_order_id UUID;
  v_order_number VARCHAR(50);
  v_payment_id UUID;
  v_transaction_id VARCHAR(100);
  v_cart_id UUID;
  v_subtotal DECIMAL(10, 2);
  v_shipping_fee DECIMAL(10, 2);
  v_total DECIMAL(10, 2);
  v_total_before_voucher DECIMAL(10, 2);
BEGIN
  -- Get user's cart
  SELECT id INTO v_cart_id
  FROM carts
  WHERE user_id = p_user_id;
  
  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'Cart not found for user';
  END IF;
  
  -- Calculate subtotal from cart items
  SELECT COALESCE(SUM(quantity * price_at_add), 0) INTO v_subtotal
  FROM cart_items
  WHERE cart_id = v_cart_id;
  
  IF v_subtotal = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;
  
  -- Calculate shipping fee (free for store pickup, 100 for local delivery)
  v_shipping_fee := CASE 
    WHEN p_delivery_type = 'store_pickup' THEN 0
    ELSE 100
  END;
  
  -- Calculate total before voucher
  v_total_before_voucher := v_subtotal + v_shipping_fee;
  
  -- Apply voucher discount
  v_total := v_total_before_voucher - COALESCE(p_voucher_discount, 0);
  
  -- Ensure total is not negative
  IF v_total < 0 THEN
    v_total := 0;
  END IF;
  
  -- Generate order number
  v_order_number := generate_order_number();
  
  -- Create order with voucher information
  INSERT INTO orders (
    order_number,
    user_id,
    subtotal,
    discount,
    shipping_fee,
    total,
    delivery_type,
    shipping_address_id,
    customer_notes,
    status,
    voucher_id,
    voucher_code,
    voucher_discount
  ) VALUES (
    v_order_number,
    p_user_id,
    v_subtotal,
    0,
    v_shipping_fee,
    v_total,
    p_delivery_type,
    p_shipping_address_id,
    p_customer_notes,
    'pending',
    p_voucher_id,
    p_voucher_code,
    COALESCE(p_voucher_discount, 0)
  ) RETURNING id INTO v_order_id;
  
  -- Copy cart items to order items with improved image extraction
  INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_image,
    variant_name,
    quantity,
    unit_price,
    subtotal,
    discount,
    total
  )
  SELECT
    v_order_id,
    ci.product_id,
    p.name,
    -- Enhanced image extraction: handles both array of strings and array of objects
    CASE
      -- If images is an array of objects with 'url' property
      WHEN jsonb_typeof(p.images->0) = 'object' THEN p.images->0->>'url'
      -- If images is an array of strings
      WHEN jsonb_typeof(p.images->0) = 'string' THEN p.images->>0
      -- Fallback to null if images is empty or invalid
      ELSE NULL
    END,
    ci.variant_name,
    ci.quantity,
    ci.price_at_add,
    ci.quantity * ci.price_at_add,
    0,
    ci.quantity * ci.price_at_add
  FROM cart_items ci
  JOIN products p ON ci.product_id = p.id
  WHERE ci.cart_id = v_cart_id;
  
  -- Generate transaction ID
  v_transaction_id := 'TXN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  
  -- Create payment record
  INSERT INTO payments (
    order_id,
    transaction_id,
    payment_method,
    amount,
    payment_status
  ) VALUES (
    v_order_id,
    v_transaction_id,
    p_payment_method,
    v_total,
    CASE 
      WHEN p_payment_method = 'cod' THEN 'pending'
      ELSE 'pending'
    END
  ) RETURNING id INTO v_payment_id;
  
  -- If voucher was used, record the usage
  IF p_voucher_id IS NOT NULL THEN
    PERFORM record_voucher_usage(
      p_voucher_id,
      p_user_id,
      v_order_id,
      p_voucher_discount,
      v_total_before_voucher,
      v_total
    );
  END IF;
  
  -- Clear the cart
  DELETE FROM cart_items WHERE cart_id = v_cart_id;
  
  -- Return order details
  RETURN QUERY SELECT 
    v_order_id,
    v_order_number,
    v_payment_id,
    v_transaction_id,
    v_total;
END;
$$ LANGUAGE plpgsql;

-- Summary
DO $$ 
BEGIN
  RAISE NOTICE '✅ create_order_from_cart() function fixed and recreated!';
  RAISE NOTICE '📋 Now accepts voucher parameters: p_voucher_id, p_voucher_code, p_voucher_discount';
  RAISE NOTICE '📋 Automatically records voucher usage when order is created';
  RAISE NOTICE '📋 Calculates final total with voucher discount applied';
END $$;
