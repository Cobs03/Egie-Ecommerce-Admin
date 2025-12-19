-- ========================================
-- ADD STOCK DEDUCTION TO ORDER CREATION
-- ========================================
-- This script updates the create_order_from_cart function
-- to automatically deduct stock when an order is placed
-- ========================================

CREATE OR REPLACE FUNCTION create_order_from_cart(
  p_user_id UUID,
  p_delivery_type VARCHAR,
  p_shipping_address_id UUID DEFAULT NULL,
  p_customer_notes TEXT DEFAULT NULL,
  p_payment_method VARCHAR DEFAULT 'cod',
  p_voucher_id UUID DEFAULT NULL,
  p_voucher_code VARCHAR DEFAULT NULL,
  p_voucher_discount NUMERIC DEFAULT 0
)
RETURNS TABLE (
  order_id UUID,
  order_number VARCHAR,
  payment_id UUID,
  transaction_id VARCHAR,
  total NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cart_id UUID;
  v_order_id UUID;
  v_order_number VARCHAR;
  v_payment_id UUID;
  v_transaction_id VARCHAR;
  v_subtotal NUMERIC := 0;
  v_shipping_fee NUMERIC := 0;
  v_total NUMERIC := 0;
  v_total_before_voucher NUMERIC := 0;
  v_item_record RECORD;
BEGIN
  -- Get user's cart
  SELECT id INTO v_cart_id FROM carts WHERE user_id = p_user_id;
  
  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'Cart not found for user';
  END IF;
  
  -- Check if cart has items
  IF NOT EXISTS (SELECT 1 FROM cart_items WHERE cart_id = v_cart_id) THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;
  
  -- Calculate subtotal
  SELECT SUM(quantity * price_at_add) INTO v_subtotal
  FROM cart_items
  WHERE cart_id = v_cart_id;
  
  -- Calculate shipping fee (free for pickup, ₱50 for delivery)
  IF p_delivery_type = 'local_delivery' THEN
    v_shipping_fee := 50;
  ELSE
    v_shipping_fee := 0;
  END IF;
  
  -- Calculate total before voucher
  v_total_before_voucher := v_subtotal + v_shipping_fee;
  
  -- Apply voucher discount
  v_total := v_total_before_voucher - COALESCE(p_voucher_discount, 0);
  
  -- Ensure total is not negative
  IF v_total < 0 THEN
    v_total := 0;
  END IF;
  
  -- Generate order number
  v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  
  -- Create order
  INSERT INTO orders (
    order_number,
    user_id,
    subtotal,
    discount,
    shipping_fee,
    total_amount,
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
  
  -- Copy cart items to order items AND deduct stock
  FOR v_item_record IN 
    SELECT
      ci.product_id,
      ci.quantity,
      ci.price_at_add,
      ci.variant_name,
      p.name,
      p.images,
      p.stock_quantity
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = v_cart_id
  LOOP
    -- Check if enough stock is available
    IF v_item_record.stock_quantity < v_item_record.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product: %. Available: %, Requested: %', 
        v_item_record.name, v_item_record.stock_quantity, v_item_record.quantity;
    END IF;
    
    -- Insert order item
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
    ) VALUES (
      v_order_id,
      v_item_record.product_id,
      v_item_record.name,
      -- Enhanced image extraction
      CASE
        WHEN jsonb_typeof(v_item_record.images->0) = 'object' THEN v_item_record.images->0->>'url'
        WHEN jsonb_typeof(v_item_record.images->0) = 'string' THEN v_item_record.images->>0
        ELSE NULL
      END,
      v_item_record.variant_name,
      v_item_record.quantity,
      v_item_record.price_at_add,
      v_item_record.quantity * v_item_record.price_at_add,
      0,
      v_item_record.quantity * v_item_record.price_at_add
    );
    
    -- 🔥 DEDUCT STOCK FROM PRODUCT
    UPDATE products 
    SET stock_quantity = stock_quantity - v_item_record.quantity
    WHERE id = v_item_record.product_id;
    
    RAISE NOTICE '✅ Deducted % units from product: % (New stock: %)', 
      v_item_record.quantity, v_item_record.name, 
      (v_item_record.stock_quantity - v_item_record.quantity);
  END LOOP;
  
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
$$;

-- ========================================
-- RESTORE STOCK ON ORDER CANCELLATION
-- ========================================

CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only restore stock if order is being cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Restore stock for all order items
    UPDATE products p
    SET stock_quantity = stock_quantity + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id = p.id;
    
    RAISE NOTICE '✅ Stock restored for cancelled order: %', NEW.order_number;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order cancellation
DROP TRIGGER IF EXISTS trigger_restore_stock_on_cancel ON orders;
CREATE TRIGGER trigger_restore_stock_on_cancel
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled')
  EXECUTE FUNCTION restore_stock_on_cancel();

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ STOCK DEDUCTION ADDED TO ORDERS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Changes made:';
  RAISE NOTICE '  • Stock is deducted when order is placed';
  RAISE NOTICE '  • Stock validation prevents overselling';
  RAISE NOTICE '  • Stock is restored when order is cancelled';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Protection:';
  RAISE NOTICE '  • Insufficient stock throws error';
  RAISE NOTICE '  • Transaction rollback on failure';
  RAISE NOTICE '  • Automatic stock restoration on cancel';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
