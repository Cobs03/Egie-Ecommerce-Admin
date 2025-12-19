-- ============================================
-- FIX ORDER ITEMS PRODUCT IMAGE EXTRACTION
-- ============================================
-- This fixes the create_order_from_cart function to properly extract
-- product images from the JSONB images column, handling both:
-- 1. Array of strings: ["image1.jpg", "image2.jpg"]
-- 2. Array of objects: [{"url": "image1.jpg"}, {"url": "image2.jpg"}]
-- ============================================

CREATE OR REPLACE FUNCTION create_order_from_cart(
  p_user_id UUID,
  p_delivery_type VARCHAR(20),
  p_shipping_address_id UUID,
  p_customer_notes TEXT,
  p_payment_method VARCHAR(20)
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
  
  -- Calculate total
  v_total := v_subtotal + v_shipping_fee;
  
  -- Generate order number
  v_order_number := generate_order_number();
  
  -- Create order
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
    status
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
    'pending'
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
  JOIN products p ON p.id = ci.product_id
  WHERE ci.cart_id = v_cart_id;
  
  -- Generate transaction ID
  v_transaction_id := generate_transaction_id();
  
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
      ELSE 'processing'
    END
  ) RETURNING id INTO v_payment_id;
  
  -- Clear cart after successful order
  DELETE FROM cart_items WHERE cart_id = v_cart_id;
  
  -- Return order and payment info
  RETURN QUERY
  SELECT 
    v_order_id,
    v_order_number,
    v_payment_id,
    v_transaction_id,
    v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to check existing order_items that have null images:
-- SELECT 
--   oi.id,
--   oi.order_id,
--   oi.product_name,
--   oi.product_image,
--   p.images
-- FROM order_items oi
-- JOIN products p ON p.id = oi.product_id
-- WHERE oi.product_image IS NULL;

-- ============================================
-- FIX EXISTING NULL IMAGES (OPTIONAL)
-- ============================================
-- Uncomment and run this to fix existing order_items with null images:

-- UPDATE order_items oi
-- SET product_image = (
--   SELECT 
--     CASE
--       WHEN jsonb_typeof(p.images->0) = 'object' THEN p.images->0->>'url'
--       WHEN jsonb_typeof(p.images->0) = 'string' THEN p.images->>0
--       ELSE NULL
--     END
--   FROM products p
--   WHERE p.id = oi.product_id
-- )
-- WHERE oi.product_image IS NULL;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ORDER ITEMS IMAGE FIX COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Function Updated:';
  RAISE NOTICE '  • create_order_from_cart() - Enhanced image extraction';
  RAISE NOTICE '';
  RAISE NOTICE 'Image Extraction Now Handles:';
  RAISE NOTICE '  1. Array of objects: [{"url": "image.jpg"}]';
  RAISE NOTICE '  2. Array of strings: ["image.jpg"]';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Run this SQL in Supabase SQL Editor';
  RAISE NOTICE '  2. (Optional) Uncomment and run UPDATE query to fix existing orders';
  RAISE NOTICE '  3. Test by creating a new order';
  RAISE NOTICE '  4. Check admin panel - product images should now display';
  RAISE NOTICE '========================================';
END $$;
