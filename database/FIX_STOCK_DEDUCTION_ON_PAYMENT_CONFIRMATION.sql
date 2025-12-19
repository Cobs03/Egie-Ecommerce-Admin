-- ========================================
-- FIX STOCK DEDUCTION TIMING
-- ========================================
-- Issue: Stock is deducted immediately when order is created,
--        even before payment is confirmed. This causes issues
--        with pending orders reserving stock unnecessarily.
--
-- Solution: Only deduct stock when payment is CONFIRMED
-- ========================================

-- Step 1: Update create_order_from_cart to NOT deduct stock
-- Stock will be deducted only after payment confirmation

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
  
  -- Calculate shipping fee
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
  
  -- Copy cart items to order items (WITHOUT deducting stock yet)
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
    -- ⚠️ CHECK STOCK AVAILABILITY (but don't deduct yet)
    IF v_item_record.stock_quantity < v_item_record.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product "%". Available: %, Requested: %', 
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
    
    -- ✅ NO STOCK DEDUCTION HERE - Will be done on payment confirmation
    RAISE NOTICE '📦 Order item added: % x% (Stock will be deducted on payment confirmation)', 
      v_item_record.name, v_item_record.quantity;
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
    'pending'
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
  
  RAISE NOTICE '✅ Order created: % (Status: pending, Stock: NOT deducted yet)', v_order_number;
  
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
-- Step 2: Create function to deduct stock when payment is confirmed OR order is shipped
-- ========================================

CREATE OR REPLACE FUNCTION deduct_stock_on_payment_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_record RECORD;
  v_item_record RECORD;
BEGIN
  -- Only proceed if payment status changed to 'paid' or 'completed'
  IF (NEW.payment_status IN ('paid', 'completed')) 
     AND (OLD.payment_status IS NULL OR OLD.payment_status NOT IN ('paid', 'completed')) THEN
    
    -- Get order details
    SELECT * INTO v_order_record FROM orders WHERE id = NEW.order_id;
    
    IF v_order_record IS NULL THEN
      RAISE EXCEPTION 'Order not found for payment: %', NEW.id;
    END IF;
    
    -- Update order status to 'confirmed'
    UPDATE orders 
    SET status = 'confirmed',
        confirmed_at = NOW()
    WHERE id = NEW.order_id
      AND status = 'pending'; -- Only update if still pending
    
    -- Deduct stock for each order item
    FOR v_item_record IN 
      SELECT 
        oi.product_id,
        oi.product_name,
        oi.variant_name,
        oi.quantity,
        p.stock_quantity
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = NEW.order_id
    LOOP
      -- Check if enough stock is available
      IF v_item_record.stock_quantity < v_item_record.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for variant "%" of product "%". Available: %, Requested: %', 
          v_item_record.variant_name, 
          v_item_record.product_name, 
          v_item_record.stock_quantity, 
          v_item_record.quantity;
      END IF;
      
      -- Deduct stock
      UPDATE products 
      SET stock_quantity = stock_quantity - v_item_record.quantity
      WHERE id = v_item_record.product_id;
      
      RAISE NOTICE '✅ Stock deducted: % x% from "%" (New stock: %)', 
        v_item_record.quantity,
        v_item_record.product_name,
        v_item_record.variant_name,
        (v_item_record.stock_quantity - v_item_record.quantity);
    END LOOP;
    
    RAISE NOTICE '✅ Payment confirmed and stock deducted for order: %', v_order_record.order_number;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for payment confirmation
DROP TRIGGER IF EXISTS trigger_deduct_stock_on_payment ON payments;
CREATE TRIGGER trigger_deduct_stock_on_payment
  AFTER UPDATE ON payments
  FOR EACH ROW
  WHEN (NEW.payment_status IN ('paid', 'completed'))
  EXECUTE FUNCTION deduct_stock_on_payment_confirmation();

-- ========================================
-- NEW: Deduct stock when order is shipped (for COD orders)
-- ========================================

CREATE OR REPLACE FUNCTION deduct_stock_on_order_shipped()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_record RECORD;
  v_stock_already_deducted BOOLEAN := FALSE;
BEGIN
  -- Only proceed if order status changed to 'shipped' or 'processing'
  IF (NEW.status IN ('shipped', 'processing', 'ready_for_pickup')) 
     AND (OLD.status NOT IN ('shipped', 'processing', 'confirmed', 'ready_for_pickup')) THEN
    
    -- Check if stock was already deducted (order was confirmed)
    v_stock_already_deducted := (OLD.status IN ('confirmed', 'processing'));
    
    IF NOT v_stock_already_deducted THEN
      -- Deduct stock for each order item
      FOR v_item_record IN 
        SELECT 
          oi.product_id,
          oi.product_name,
          oi.variant_name,
          oi.quantity,
          p.stock_quantity
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = NEW.id
      LOOP
        -- Check if enough stock is available
        IF v_item_record.stock_quantity < v_item_record.quantity THEN
          RAISE EXCEPTION 'Insufficient stock for variant "%" of product "%". Available: %, Requested: %', 
            v_item_record.variant_name, 
            v_item_record.product_name, 
            v_item_record.stock_quantity, 
            v_item_record.quantity;
        END IF;
        
        -- Deduct stock
        UPDATE products 
        SET stock_quantity = stock_quantity - v_item_record.quantity
        WHERE id = v_item_record.product_id;
        
        RAISE NOTICE '✅ Stock deducted on shipping: % x% from "%" (New stock: %)', 
          v_item_record.quantity,
          v_item_record.product_name,
          v_item_record.variant_name,
          (v_item_record.stock_quantity - v_item_record.quantity);
      END LOOP;
      
      -- Set confirmed_at if not already set
      IF NEW.confirmed_at IS NULL THEN
        UPDATE orders 
        SET confirmed_at = NOW()
        WHERE id = NEW.id;
      END IF;
      
      RAISE NOTICE '✅ Stock deducted on order status change to % for order: %', NEW.status, NEW.order_number;
    ELSE
      RAISE NOTICE 'ℹ️ Stock already deducted for order: %', NEW.order_number;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS trigger_deduct_stock_on_shipped ON orders;
CREATE TRIGGER trigger_deduct_stock_on_shipped
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status IN ('shipped', 'processing', 'ready_for_pickup'))
  EXECUTE FUNCTION deduct_stock_on_order_shipped();

-- ========================================
-- Step 3: Update restore stock function to handle ALL cancellations
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
  -- Check if this order was previously confirmed (stock was deducted)
  v_was_confirmed := (OLD.status IN ('confirmed', 'processing', 'shipped', 'ready_for_pickup'));
  
  -- Only restore stock if order is being cancelled AND stock was previously deducted
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' AND v_was_confirmed THEN
    
    -- Restore stock for all order items
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
      
      RAISE NOTICE '↩️ Stock restored: % x% to "%" (Reason: Order cancelled)', 
        v_item_record.quantity,
        v_item_record.product_name,
        v_item_record.variant_name;
    END LOOP;
    
    RAISE NOTICE '✅ Stock restored for cancelled order: %', NEW.order_number;
    
  ELSIF NEW.status = 'cancelled' AND NOT v_was_confirmed THEN
    RAISE NOTICE 'ℹ️ Order cancelled but stock was never deducted (order was not confirmed): %', NEW.order_number;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger for order cancellation
DROP TRIGGER IF EXISTS trigger_restore_stock_on_cancel ON orders;
CREATE TRIGGER trigger_restore_stock_on_cancel
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled')
  EXECUTE FUNCTION restore_stock_on_cancel();

-- ========================================
-- Step 4: Handle payment failures/expirations
-- ========================================

CREATE OR REPLACE FUNCTION handle_payment_failure()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If payment failed or expired, cancel the order
  IF (NEW.payment_status IN ('failed', 'expired', 'cancelled')) 
     AND (OLD.payment_status IS NULL OR OLD.payment_status NOT IN ('failed', 'expired', 'cancelled')) THEN
    
    -- Update order status to cancelled
    UPDATE orders 
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE id = NEW.order_id
      AND status = 'pending'; -- Only cancel if still pending
    
    RAISE NOTICE '❌ Payment % - Order cancelled: %', NEW.payment_status, NEW.transaction_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for payment failures
DROP TRIGGER IF EXISTS trigger_handle_payment_failure ON payments;
CREATE TRIGGER trigger_handle_payment_failure
  AFTER UPDATE ON payments
  FOR EACH ROW
  WHEN (NEW.payment_status IN ('failed', 'expired', 'cancelled'))
  EXECUTE FUNCTION handle_payment_failure();

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ STOCK DEDUCTION TIMING FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Changes Applied:';
  RAISE NOTICE '  1. create_order_from_cart() - Stock checked but NOT deducted';
  RAISE NOTICE '  2. deduct_stock_on_payment_confirmation() - Deducts stock when payment confirmed';
  RAISE NOTICE '  3. deduct_stock_on_order_shipped() - Deducts stock when order shipped (for COD)';
  RAISE NOTICE '  4. restore_stock_on_cancel() - Restores stock only if it was deducted';
  RAISE NOTICE '  5. handle_payment_failure() - Auto-cancels orders with failed payments';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Flow:';
  RAISE NOTICE '  Order Created (GCash) → Status: pending → Stock: AVAILABLE';
  RAISE NOTICE '  Payment Confirmed (GCash) → Status: confirmed → Stock: DEDUCTED';
  RAISE NOTICE '  Order Created (COD) → Status: pending → Stock: AVAILABLE';
  RAISE NOTICE '  Order Shipped (COD) → Status: shipped → Stock: DEDUCTED';
  RAISE NOTICE '  Order Cancelled → Status: cancelled → Stock: RESTORED (if was deducted)';
  RAISE NOTICE '  Payment Failed → Status: cancelled → Stock: NEVER DEDUCTED';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
