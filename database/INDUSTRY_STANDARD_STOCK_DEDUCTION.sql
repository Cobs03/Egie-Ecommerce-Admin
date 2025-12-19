-- ========================================
-- INDUSTRY STANDARD STOCK DEDUCTION
-- ========================================
-- Based on best practices from Amazon, Shopify, Lazada, Shopee
--
-- Rules:
-- 1. Online Payment (GCash): Deduct when payment confirmed
-- 2. COD: Deduct when admin confirms order (before shipping)
-- 3. Cancelled orders: Restore stock if it was deducted
-- ========================================

-- Step 1: Update create_order_from_cart to NOT deduct stock
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
  SELECT id INTO v_cart_id FROM carts WHERE user_id = p_user_id;
  
  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'Cart not found for user';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM cart_items WHERE cart_id = v_cart_id) THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;
  
  SELECT SUM(quantity * price_at_add) INTO v_subtotal
  FROM cart_items
  WHERE cart_id = v_cart_id;
  
  IF p_delivery_type = 'local_delivery' THEN
    v_shipping_fee := 50;
  ELSE
    v_shipping_fee := 0;
  END IF;
  
  v_total_before_voucher := v_subtotal + v_shipping_fee;
  v_total := v_total_before_voucher - COALESCE(p_voucher_discount, 0);
  
  IF v_total < 0 THEN
    v_total := 0;
  END IF;
  
  v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  
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
    IF v_item_record.stock_quantity < v_item_record.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product "%". Available: %, Requested: %', 
        v_item_record.name, v_item_record.stock_quantity, v_item_record.quantity;
    END IF;
    
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
  END LOOP;
  
  v_transaction_id := 'TXN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  
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
    'pending'
  ) RETURNING id INTO v_payment_id;
  
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
  
  DELETE FROM cart_items WHERE cart_id = v_cart_id;
  
  RAISE NOTICE '✅ Order created: % (Status: pending, Stock: NOT deducted yet)', v_order_number;
  
  RETURN QUERY SELECT 
    v_order_id,
    v_order_number,
    v_payment_id,
    v_transaction_id,
    v_total;
END;
$$;

-- ========================================
-- Step 2: Deduct stock when payment is paid (GCash) OR order is confirmed (COD)
-- ========================================

CREATE OR REPLACE FUNCTION deduct_stock_on_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_record RECORD;
  v_payment_method VARCHAR;
  v_payment_status VARCHAR;
  v_should_deduct BOOLEAN := FALSE;
  v_variant_stock INT;
  v_new_variants JSONB;
BEGIN
  -- Scenario 1: Payment status changed to 'paid' (GCash/Online Payment)
  IF TG_TABLE_NAME = 'payments' THEN
    IF (NEW.payment_status IN ('paid', 'completed')) 
       AND (OLD.payment_status IS NULL OR OLD.payment_status NOT IN ('paid', 'completed')) THEN
      
      -- Always deduct stock when payment is marked as paid (regardless of payment method)
      v_should_deduct := TRUE;
      
      -- Update order status to 'confirmed'
      UPDATE orders 
      SET status = 'confirmed',
          confirmed_at = NOW()
      WHERE id = NEW.order_id
        AND status = 'pending';
      
      RAISE NOTICE '💳 Payment marked as paid for order ID: % - Auto-confirming order', NEW.order_id;
    END IF;
  END IF;
  
  -- Scenario 2: Order status moved forward (covers COD and late status changes)
  IF TG_TABLE_NAME = 'orders' THEN
    IF OLD.status = 'pending' 
       AND NEW.status IN ('confirmed', 'processing', 'shipped', 'ready_for_pickup', 'delivered') THEN
      -- Get payment method and status
      SELECT payment_method, payment_status INTO v_payment_method, v_payment_status
      FROM payments
      WHERE order_id = NEW.id
      LIMIT 1;
      
      -- COD: deduct on first forward status
      IF v_payment_method = 'cod' THEN
        v_should_deduct := TRUE;
        RAISE NOTICE '📦 COD order moved to % by staff: %', NEW.status, NEW.order_number;
      -- Online: deduct only if payment already paid
      ELSIF v_payment_status IN ('paid', 'completed') THEN
        v_should_deduct := TRUE;
        RAISE NOTICE '💳 Paid order moved to % by staff: %', NEW.status, NEW.order_number;
      END IF;
    END IF;
  END IF;
  
  -- Deduct stock if needed
  IF v_should_deduct THEN
    FOR v_item_record IN 
      SELECT 
        oi.product_id,
        oi.product_name,
        oi.variant_name,
        oi.quantity,
        p.stock_quantity,
        p.variants
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = CASE 
        WHEN TG_TABLE_NAME = 'payments' THEN NEW.order_id
        ELSE NEW.id
      END
    LOOP
      IF v_item_record.stock_quantity < v_item_record.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for "%" (%). Available: %, Requested: %', 
          v_item_record.product_name,
          v_item_record.variant_name, 
          v_item_record.stock_quantity, 
          v_item_record.quantity;
      END IF;
      
      UPDATE products 
      SET stock_quantity = stock_quantity - v_item_record.quantity
      WHERE id = v_item_record.product_id;
      
      -- Also decrement variant stock if applicable
      IF v_item_record.variant_name IS NOT NULL THEN
        SELECT jsonb_agg(
          CASE 
            WHEN (variant->>'name') = v_item_record.variant_name THEN
              variant || jsonb_build_object(
                'stock', GREATEST(0, COALESCE((variant->>'stock')::int, 0) - v_item_record.quantity)
              )
            ELSE variant
          END
        ) INTO v_new_variants
        FROM products p
        CROSS JOIN jsonb_array_elements(p.variants) AS variant
        WHERE p.id = v_item_record.product_id;

        UPDATE products p2
        SET variants = COALESCE(v_new_variants, p2.variants)
        WHERE p2.id = v_item_record.product_id;
      END IF;

      RAISE NOTICE '✅ Stock deducted: % x "%s" (New stock: %)', 
        v_item_record.quantity,
        v_item_record.product_name,
        (v_item_record.stock_quantity - v_item_record.quantity);
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_deduct_stock_on_payment ON payments;
CREATE TRIGGER trigger_deduct_stock_on_payment
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION deduct_stock_on_confirmation();

DROP TRIGGER IF EXISTS trigger_deduct_stock_on_order_confirm ON orders;
CREATE TRIGGER trigger_deduct_stock_on_order_confirm
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION deduct_stock_on_confirmation();

-- ========================================
-- Step 3: Restore stock on cancellation
-- ========================================

CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_record RECORD;
  v_was_confirmed BOOLEAN;
BEGIN
  v_was_confirmed := (OLD.status IN ('confirmed', 'processing', 'shipped', 'ready_for_pickup', 'delivered'));
  
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' AND v_was_confirmed THEN
    FOR v_item_record IN
      SELECT 
        oi.product_id,
        oi.product_name,
        oi.variant_name,
        oi.quantity
      FROM order_items oi
      WHERE oi.order_id = NEW.id
    LOOP
      UPDATE products 
      SET stock_quantity = stock_quantity + v_item_record.quantity
      WHERE id = v_item_record.product_id;
      
      RAISE NOTICE '↩️ Stock restored: % x "%s"', 
        v_item_record.quantity,
        v_item_record.product_name;
    END LOOP;
    
    RAISE NOTICE '✅ Stock restored for cancelled order: %', NEW.order_number;
  ELSIF NEW.status = 'cancelled' AND NOT v_was_confirmed THEN
    RAISE NOTICE 'ℹ️ Order cancelled before confirmation - no stock to restore: %', NEW.order_number;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_restore_stock_on_cancel ON orders;
CREATE TRIGGER trigger_restore_stock_on_cancel
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled')
  EXECUTE FUNCTION restore_stock_on_cancel();

-- ========================================
-- Step 4: Handle payment failures
-- ========================================

CREATE OR REPLACE FUNCTION handle_payment_failure()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (NEW.payment_status IN ('failed', 'expired', 'cancelled')) 
     AND (OLD.payment_status IS NULL OR OLD.payment_status NOT IN ('failed', 'expired', 'cancelled')) THEN
    
    UPDATE orders 
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE id = NEW.order_id
      AND status = 'pending';
    
    RAISE NOTICE '❌ Payment % - Order auto-cancelled', NEW.payment_status;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_handle_payment_failure ON payments;
CREATE TRIGGER trigger_handle_payment_failure
  AFTER UPDATE ON payments
  FOR EACH ROW
  WHEN (NEW.payment_status IN ('failed', 'expired', 'cancelled'))
  EXECUTE FUNCTION handle_payment_failure();

-- ========================================
-- Step 5: Fix existing shipped orders (one-time)
-- ========================================

DO $$
DECLARE
  v_order RECORD;
  v_item RECORD;
BEGIN
  RAISE NOTICE '🔧 Fixing stock for existing shipped/confirmed orders...';
  
  -- Find all confirmed/shipped orders where stock wasn't deducted
  FOR v_order IN
    SELECT DISTINCT o.id, o.order_number, o.status, o.created_at
    FROM orders o
    WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered', 'ready_for_pickup')
      AND o.confirmed_at IS NOT NULL
    ORDER BY o.created_at DESC
  LOOP
    -- Deduct stock for each item in this order
    FOR v_item IN
      SELECT 
        oi.product_id,
        oi.product_name,
        oi.quantity,
        p.stock_quantity
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = v_order.id
    LOOP
      -- Only deduct if stock is available
      IF v_item.stock_quantity >= v_item.quantity THEN
        UPDATE products 
        SET stock_quantity = stock_quantity - v_item.quantity
        WHERE id = v_item.product_id;
        
        RAISE NOTICE '  ✅ Fixed: % x "%s" (Order: %)', 
          v_item.quantity,
          v_item.product_name,
          v_order.order_number;
      ELSE
        RAISE NOTICE '  ⚠️ Skip: Insufficient stock for "%s" in order %', 
          v_item.product_name,
          v_order.order_number;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE '✅ Existing orders fixed!';
END $$;

-- ========================================
-- Step 6: Sync single-variant stock to match stock_quantity
-- ========================================

UPDATE products p SET variants = sub.new_variants
FROM (
  SELECT id,
    jsonb_agg(
      CASE 
        WHEN ord = 1 THEN variant || jsonb_build_object('stock', p.stock_quantity)
        ELSE variant
      END
    ) AS new_variants
  FROM products p
  CROSS JOIN LATERAL jsonb_array_elements(p.variants) WITH ORDINALITY AS elems(variant, ord)
  WHERE jsonb_typeof(p.variants) = 'array'
    AND jsonb_array_length(p.variants) = 1
  GROUP BY id
) sub
WHERE p.id = sub.id;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ INDUSTRY STANDARD STOCK SYSTEM ACTIVE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 How it works:';
  RAISE NOTICE '';
  RAISE NOTICE '🔵 GCash/Online Payment:';
  RAISE NOTICE '  1. Checkout → Order: pending → Stock: AVAILABLE';
  RAISE NOTICE '  2. Payment paid → Order: confirmed → Stock: DEDUCTED ✅';
  RAISE NOTICE '  3. Mark shipped → Order: shipped → (stock already deducted)';
  RAISE NOTICE '';
  RAISE NOTICE '🟡 Cash on Delivery (COD):';
  RAISE NOTICE '  1. Checkout → Order: pending → Stock: AVAILABLE';
  RAISE NOTICE '  2. Admin confirms → Order: confirmed → Stock: DEDUCTED ✅';
  RAISE NOTICE '  3. Mark shipped → Order: shipped → (stock already deducted)';
  RAISE NOTICE '  4. Customer pays → Payment: paid → (stock already deducted)';
  RAISE NOTICE '';
  RAISE NOTICE '🔴 Cancellation:';
  RAISE NOTICE '  • Before confirmation → Stock: NOT AFFECTED';
  RAISE NOTICE '  • After confirmation → Stock: RESTORED ✅';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
