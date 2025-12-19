-- ========================================
-- FIX VARIANT STOCK DEDUCTION
-- ========================================
-- Updates the create_order_from_cart function to:
-- 1. Deduct stock from specific variants (JSONB)
-- 2. Update main product stock_quantity
-- 3. Validate variant stock before purchase
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
  v_variants JSONB;
  v_variant_found BOOLEAN;
  v_variant_stock INTEGER;
  v_updated_variants JSONB;
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
  
  -- Calculate total
  v_total_before_voucher := v_subtotal + v_shipping_fee;
  v_total := v_total_before_voucher - COALESCE(p_voucher_discount, 0);
  
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
  
  -- Process each cart item
  FOR v_item_record IN 
    SELECT
      ci.product_id,
      ci.quantity,
      ci.price_at_add,
      ci.variant_name,
      p.name,
      p.images,
      p.stock_quantity,
      p.variants
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = v_cart_id
  LOOP
    
    -- 🔥 HANDLE VARIANT STOCK DEDUCTION
    IF v_item_record.variant_name IS NOT NULL AND v_item_record.variant_name != '' THEN
      -- Product has variants, update specific variant stock
      v_variants := v_item_record.variants;
      v_variant_found := FALSE;
      v_updated_variants := '[]'::jsonb;
      
      -- Loop through variants to find and update the matching one
      FOR i IN 0..jsonb_array_length(v_variants)-1 LOOP
        DECLARE
          v_variant JSONB := v_variants->i;
          v_variant_name_in_db TEXT;
        BEGIN
          -- Get variant name (could be in 'name' or 'variant' field)
          v_variant_name_in_db := COALESCE(v_variant->>'name', v_variant->>'variant');
          
          IF v_variant_name_in_db = v_item_record.variant_name THEN
            -- Found the matching variant
            v_variant_found := TRUE;
            v_variant_stock := (v_variant->>'stock')::INTEGER;
            
            -- Check if enough stock
            IF v_variant_stock < v_item_record.quantity THEN
              RAISE EXCEPTION 'Insufficient stock for variant "%" of product "%". Available: %, Requested: %', 
                v_item_record.variant_name, v_item_record.name, v_variant_stock, v_item_record.quantity;
            END IF;
            
            -- Deduct stock from variant
            v_variant := jsonb_set(v_variant, '{stock}', to_jsonb(v_variant_stock - v_item_record.quantity));
            
            RAISE NOTICE '✅ Deducted % units from variant "%" of product "%". New stock: %', 
              v_item_record.quantity, v_item_record.variant_name, v_item_record.name, 
              (v_variant_stock - v_item_record.quantity);
          END IF;
          
          -- Add variant to updated array
          v_updated_variants := v_updated_variants || v_variant;
        END;
      END LOOP;
      
      IF NOT v_variant_found THEN
        RAISE EXCEPTION 'Variant "%" not found for product "%"', v_item_record.variant_name, v_item_record.name;
      END IF;
      
      -- Update product with new variant stock
      UPDATE products 
      SET variants = v_updated_variants
      WHERE id = v_item_record.product_id;
      
    ELSE
      -- No variant, deduct from main stock
      IF v_item_record.stock_quantity < v_item_record.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product: %. Available: %, Requested: %', 
          v_item_record.name, v_item_record.stock_quantity, v_item_record.quantity;
      END IF;
      
      UPDATE products 
      SET stock_quantity = stock_quantity - v_item_record.quantity
      WHERE id = v_item_record.product_id;
      
      RAISE NOTICE '✅ Deducted % units from product: %. New stock: %', 
        v_item_record.quantity, v_item_record.name, 
        (v_item_record.stock_quantity - v_item_record.quantity);
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
  
  -- Record voucher usage
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
-- RESTORE VARIANT STOCK ON CANCELLATION
-- ========================================

CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_variants JSONB;
  v_updated_variants JSONB;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    
    FOR v_item IN 
      SELECT product_id, variant_name, quantity 
      FROM order_items 
      WHERE order_id = NEW.id
    LOOP
      
      IF v_item.variant_name IS NOT NULL AND v_item.variant_name != '' THEN
        -- Restore variant stock
        SELECT variants INTO v_variants FROM products WHERE id = v_item.product_id;
        v_updated_variants := '[]'::jsonb;
        
        FOR i IN 0..jsonb_array_length(v_variants)-1 LOOP
          DECLARE
            v_variant JSONB := v_variants->i;
            v_variant_name TEXT;
            v_stock INTEGER;
          BEGIN
            v_variant_name := COALESCE(v_variant->>'name', v_variant->>'variant');
            
            IF v_variant_name = v_item.variant_name THEN
              v_stock := (v_variant->>'stock')::INTEGER;
              v_variant := jsonb_set(v_variant, '{stock}', to_jsonb(v_stock + v_item.quantity));
              
              RAISE NOTICE '✅ Restored % units to variant "%" of order %', 
                v_item.quantity, v_item.variant_name, NEW.order_number;
            END IF;
            
            v_updated_variants := v_updated_variants || v_variant;
          END;
        END LOOP;
        
        UPDATE products SET variants = v_updated_variants WHERE id = v_item.product_id;
        
      ELSE
        -- Restore main stock
        UPDATE products 
        SET stock_quantity = stock_quantity + v_item.quantity
        WHERE id = v_item.product_id;
        
        RAISE NOTICE '✅ Restored % units to product of order %', 
          v_item.quantity, NEW.order_number;
      END IF;
      
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
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
  RAISE NOTICE '✅ VARIANT STOCK DEDUCTION FIXED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Features:';
  RAISE NOTICE '  • Deducts stock from specific variants';
  RAISE NOTICE '  • Updates variant stock in JSONB';
  RAISE NOTICE '  • Validates variant availability';
  RAISE NOTICE '  • Restores variant stock on cancel';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Protection:';
  RAISE NOTICE '  • Checks variant stock before order';
  RAISE NOTICE '  • Transaction rollback on failure';
  RAISE NOTICE '  • Automatic restoration on cancel';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
