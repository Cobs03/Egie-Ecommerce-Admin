-- ========================================
-- SIMPLIFIED STOCK DEDUCTION SYSTEM
-- ========================================
-- This version ensures marking payment as paid:
-- 1. Auto-confirms the order
-- 2. Deducts stock immediately
-- 3. Works in a single transaction
-- ========================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS trigger_deduct_stock_on_payment ON payments;
DROP TRIGGER IF EXISTS trigger_deduct_stock_on_payment_paid ON payments;
DROP TRIGGER IF EXISTS trigger_deduct_stock_on_order_confirm ON orders;
DROP TRIGGER IF EXISTS trigger_restore_stock_on_cancel ON orders;
DROP TRIGGER IF EXISTS trigger_handle_payment_failure ON payments;

-- Main function: Deduct stock when payment marked as paid
CREATE OR REPLACE FUNCTION deduct_stock_on_payment_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_record RECORD;
  v_order_status TEXT;
  v_payment_method TEXT;
BEGIN
  -- Only process if payment status changed to 'paid' or 'completed'
  IF (NEW.payment_status IN ('paid', 'completed')) 
     AND (OLD.payment_status NOT IN ('paid', 'completed') OR OLD.payment_status IS NULL) THEN
    
    -- Check payment method - skip stock deduction for COD
    SELECT payment_method INTO v_payment_method FROM payments WHERE id = NEW.id;
    
    -- For COD, only update order status but don't deduct stock yet
    -- Stock will be deducted when order is confirmed by order trigger
    IF v_payment_method = 'cod' THEN
      -- Get current order status
      SELECT status INTO v_order_status FROM orders WHERE id = NEW.order_id;
      
      -- Auto-confirm order if still pending (but don't deduct stock)
      IF v_order_status = 'pending' THEN
        UPDATE orders 
        SET status = 'confirmed',
            confirmed_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.order_id;
        
        RAISE NOTICE '✅ COD Order auto-confirmed - Stock will be deducted by order trigger';
      END IF;
      
      RETURN NEW;
    END IF;
    
    -- For non-COD (GCash/Online), proceed with stock deduction
    -- Get current order status
    SELECT status INTO v_order_status
    FROM orders
    WHERE id = NEW.order_id;
    
    -- Auto-confirm order if still pending
    IF v_order_status = 'pending' THEN
      UPDATE orders 
      SET status = 'confirmed',
          confirmed_at = NOW(),
          updated_at = NOW()
      WHERE id = NEW.order_id;
      
      RAISE NOTICE '✅ Order auto-confirmed after payment marked as paid';
    END IF;
    
    -- Deduct stock for all items in this order
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
      WHERE oi.order_id = NEW.order_id
    LOOP
      -- Check stock availability
      IF v_item_record.stock_quantity < v_item_record.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for "%" (%). Available: %, Requested: %', 
          v_item_record.product_name,
          COALESCE(v_item_record.variant_name, 'default'), 
          v_item_record.stock_quantity, 
          v_item_record.quantity;
      END IF;
      
      -- Deduct main stock
      UPDATE products 
      SET stock_quantity = stock_quantity - v_item_record.quantity,
          updated_at = NOW()
      WHERE id = v_item_record.product_id;
      
      -- Deduct variant stock if applicable
      IF v_item_record.variant_name IS NOT NULL AND v_item_record.variants IS NOT NULL THEN
        UPDATE products
        SET variants = (
          SELECT jsonb_agg(
            CASE 
              WHEN (variant->>'name') = v_item_record.variant_name THEN
                variant || jsonb_build_object(
                  'stock', GREATEST(0, COALESCE((variant->>'stock')::int, 0) - v_item_record.quantity)
                )
              ELSE variant
            END
          )
          FROM jsonb_array_elements(v_item_record.variants) AS variant
        ),
        updated_at = NOW()
        WHERE id = v_item_record.product_id;
      END IF;

      RAISE NOTICE '✅ Stock deducted: % x "%" (Variant: %)', 
        v_item_record.quantity,
        v_item_record.product_name,
        COALESCE(v_item_record.variant_name, 'N/A');
    END LOOP;
    
    RAISE NOTICE '🎉 Payment marked as paid - Order confirmed - Stock deducted';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for payments
CREATE TRIGGER trigger_deduct_stock_on_payment_paid
  AFTER UPDATE OF payment_status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION deduct_stock_on_payment_paid();

-- Function: Deduct stock when order is confirmed (for COD)
CREATE OR REPLACE FUNCTION deduct_stock_on_order_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_record RECORD;
  v_payment_method TEXT;
  v_payment_status TEXT;
BEGIN
  -- Only when order moves from pending to confirmed (or other forward status)
  IF OLD.status = 'pending' 
     AND NEW.status IN ('confirmed', 'processing', 'shipped', 'ready_for_pickup', 'delivered') THEN
    
    -- Get payment info
    SELECT payment_method, payment_status INTO v_payment_method, v_payment_status
    FROM payments
    WHERE order_id = NEW.id
    LIMIT 1;
    
    -- Only deduct if COD order
    -- Skip if online payment (payment trigger already handled it)
    IF v_payment_method = 'cod' THEN
      
      -- Deduct stock for all items
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
        WHERE oi.order_id = NEW.id
      LOOP
        -- Check stock
        IF v_item_record.stock_quantity < v_item_record.quantity THEN
          RAISE EXCEPTION 'Insufficient stock for "%" (%). Available: %, Requested: %', 
            v_item_record.product_name,
            COALESCE(v_item_record.variant_name, 'default'), 
            v_item_record.stock_quantity, 
            v_item_record.quantity;
        END IF;
        
        -- Deduct main stock
        UPDATE products 
        SET stock_quantity = stock_quantity - v_item_record.quantity,
            updated_at = NOW()
        WHERE id = v_item_record.product_id;
        
        -- Deduct variant stock
        IF v_item_record.variant_name IS NOT NULL AND v_item_record.variants IS NOT NULL THEN
          UPDATE products
          SET variants = (
            SELECT jsonb_agg(
              CASE 
                WHEN (variant->>'name') = v_item_record.variant_name THEN
                  variant || jsonb_build_object(
                    'stock', GREATEST(0, COALESCE((variant->>'stock')::int, 0) - v_item_record.quantity)
                  )
                ELSE variant
              END
            )
            FROM jsonb_array_elements(v_item_record.variants) AS variant
          ),
          updated_at = NOW()
          WHERE id = v_item_record.product_id;
        END IF;

        RAISE NOTICE '✅ Stock deducted: % x "%" (Variant: %)', 
          v_item_record.quantity,
          v_item_record.product_name,
          COALESCE(v_item_record.variant_name, 'N/A');
      END LOOP;
      
      RAISE NOTICE '🎉 Order confirmed - Stock deducted (Method: %)', v_payment_method;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for orders
CREATE TRIGGER trigger_deduct_stock_on_order_confirm
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION deduct_stock_on_order_confirm();

-- Function: Restore stock on cancellation
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_record RECORD;
BEGIN
  -- Only restore if order was previously confirmed/shipped
  IF NEW.status = 'cancelled' 
     AND OLD.status IN ('confirmed', 'processing', 'shipped', 'ready_for_pickup', 'delivered') THEN
    
    FOR v_item_record IN
      SELECT 
        oi.product_id,
        oi.product_name,
        oi.variant_name,
        oi.quantity,
        p.variants
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = NEW.id
    LOOP
      -- Restore main stock
      UPDATE products 
      SET stock_quantity = stock_quantity + v_item_record.quantity,
          updated_at = NOW()
      WHERE id = v_item_record.product_id;
      
      -- Restore variant stock
      IF v_item_record.variant_name IS NOT NULL AND v_item_record.variants IS NOT NULL THEN
        UPDATE products
        SET variants = (
          SELECT jsonb_agg(
            CASE 
              WHEN (variant->>'name') = v_item_record.variant_name THEN
                variant || jsonb_build_object(
                  'stock', COALESCE((variant->>'stock')::int, 0) + v_item_record.quantity
                )
              ELSE variant
            END
          )
          FROM jsonb_array_elements(v_item_record.variants) AS variant
        ),
        updated_at = NOW()
        WHERE id = v_item_record.product_id;
      END IF;
      
      RAISE NOTICE '↩️ Stock restored: % x "%"', 
        v_item_record.quantity,
        v_item_record.product_name;
    END LOOP;
    
    RAISE NOTICE '✅ Stock restored for cancelled order: %', NEW.order_number;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for cancellations
CREATE TRIGGER trigger_restore_stock_on_cancel
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cancel();

-- Function: Handle payment failures
CREATE OR REPLACE FUNCTION handle_payment_failure()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (NEW.payment_status IN ('failed', 'expired', 'cancelled')) 
     AND (OLD.payment_status NOT IN ('failed', 'expired', 'cancelled') OR OLD.payment_status IS NULL) THEN
    
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

-- Create trigger for payment failures
CREATE TRIGGER trigger_handle_payment_failure
  AFTER UPDATE OF payment_status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION handle_payment_failure();

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SIMPLIFIED STOCK SYSTEM DEPLOYED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 How it works:';
  RAISE NOTICE '';
  RAISE NOTICE '💳 Mark Payment as Paid:';
  RAISE NOTICE '  → Auto-confirms order (if pending)';
  RAISE NOTICE '  → Deducts stock immediately';
  RAISE NOTICE '  → Works for both GCash and COD';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Confirm Order (COD):';
  RAISE NOTICE '  → Deducts stock when confirmed';
  RAISE NOTICE '';
  RAISE NOTICE '❌ Cancel Order:';
  RAISE NOTICE '  → Restores stock if already deducted';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
