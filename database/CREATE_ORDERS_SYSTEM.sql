-- ============================================
-- COMPLETE ORDERS SYSTEM WITH PAYMENTS
-- ============================================
-- Creates: orders, order_items, payments, shipping_addresses tables
-- Supports: COD, GCash, Credit Card payments
-- Delivery types: Local Delivery, Store Pickup
-- Connected to existing cart system
-- ============================================

-- Step 1: Create shipping_addresses table
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Address details
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  
  -- Address components
  street_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Philippines',
  
  -- Additional info
  address_type VARCHAR(20) DEFAULT 'home', -- home, work, other
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_is_default ON shipping_addresses(user_id, is_default);

-- Add comment
COMMENT ON TABLE shipping_addresses IS 'Customer shipping addresses';

-- Step 2: Create orders table
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Order details
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  shipping_fee DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Delivery information
  delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('local_delivery', 'store_pickup')),
  shipping_address_id UUID REFERENCES shipping_addresses(id),
  
  -- Order status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'completed')
  ),
  
  -- Additional info
  order_notes TEXT,
  customer_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Add comment
COMMENT ON TABLE orders IS 'Customer orders with delivery and payment info';

-- Step 3: Create order_items table
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  
  -- Product snapshot at time of order
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  
  -- Variant information
  variant_name VARCHAR(100),
  variant_value TEXT,
  
  -- Pricing
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Add comment
COMMENT ON TABLE order_items IS 'Items in orders with product snapshots';

-- Step 4: Create payments table
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- Payment details
  payment_method VARCHAR(20) NOT NULL CHECK (
    payment_method IN ('cod', 'gcash', 'credit_card', 'debit_card')
  ),
  amount DECIMAL(10, 2) NOT NULL,
  
  -- Payment status
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled')
  ),
  
  -- Payment method specific info
  card_last_four VARCHAR(4), -- For card payments
  card_type VARCHAR(20), -- visa, mastercard, etc.
  gcash_reference VARCHAR(100), -- For GCash
  gcash_phone VARCHAR(20), -- For GCash
  
  -- Additional info
  payment_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);

-- Add comment
COMMENT ON TABLE payments IS 'Payment records for orders';

-- Step 5: Create function to generate order number
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  number_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate order number format: EGIE-YYYYMMDD-XXXXX
    new_order_number := 'EGIE-' || 
                        TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                        LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
    
    -- Check if number already exists
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_order_number) INTO number_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT number_exists;
  END LOOP;
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create function to generate transaction ID
-- ============================================
CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS TEXT AS $$
DECLARE
  new_transaction_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate transaction ID format: TXN-YYYYMMDD-XXXXX
    new_transaction_id := 'TXN-' || 
                          TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                          LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM payments WHERE transaction_id = new_transaction_id) INTO id_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create function to create order from cart
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
  
  -- Copy cart items to order items
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
    p.images->0->>'url',
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

-- Step 8: Create function to update order timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_order_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_order_timestamp ON orders;
CREATE TRIGGER trigger_update_order_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_order_timestamp();

-- Step 9: Create function to update payment timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_payment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Set paid_at when status changes to paid
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    NEW.paid_at = NOW();
  END IF;
  
  -- Set failed_at when status changes to failed
  IF NEW.payment_status = 'failed' AND OLD.payment_status != 'failed' THEN
    NEW.failed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_payment_timestamp ON payments;
CREATE TRIGGER trigger_update_payment_timestamp
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_payment_timestamp();

-- Step 10: Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Step 11: RLS Policies for shipping_addresses
-- ============================================

-- Users can view their own addresses
DROP POLICY IF EXISTS "Users can view own addresses" ON shipping_addresses;
CREATE POLICY "Users can view own addresses"
ON shipping_addresses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own addresses
DROP POLICY IF EXISTS "Users can create own addresses" ON shipping_addresses;
CREATE POLICY "Users can create own addresses"
ON shipping_addresses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
DROP POLICY IF EXISTS "Users can update own addresses" ON shipping_addresses;
CREATE POLICY "Users can update own addresses"
ON shipping_addresses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own addresses
DROP POLICY IF EXISTS "Users can delete own addresses" ON shipping_addresses;
CREATE POLICY "Users can delete own addresses"
ON shipping_addresses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 12: RLS Policies for orders
-- ============================================

-- Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Users can create their own orders
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can create own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending orders (cancel only)
DROP POLICY IF EXISTS "Users can update own pending orders" ON orders;
CREATE POLICY "Users can update own pending orders"
ON orders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can update all orders
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'manager')
  )
);

-- Step 13: RLS Policies for order_items
-- ============================================

-- Users can view items in their own orders
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

-- Admins can view all order items
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Step 14: RLS Policies for payments
-- ============================================

-- Users can view their own payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

-- Admins can view all payments
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments"
ON payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'manager')
  )
);

-- Admins can update payments
DROP POLICY IF EXISTS "Admins can update payments" ON payments;
CREATE POLICY "Admins can update payments"
ON payments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'manager')
  )
);

-- Step 15: Verification and Success Message
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ORDERS SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  • shipping_addresses';
  RAISE NOTICE '  • orders';
  RAISE NOTICE '  • order_items';
  RAISE NOTICE '  • payments';
  RAISE NOTICE '';
  RAISE NOTICE 'Features Enabled:';
  RAISE NOTICE '  • COD, GCash, Credit Card payments';
  RAISE NOTICE '  • Local Delivery & Store Pickup';
  RAISE NOTICE '  • Order notes and customer notes';
  RAISE NOTICE '  • Auto order number generation';
  RAISE NOTICE '  • Auto transaction ID generation';
  RAISE NOTICE '  • Create order from cart function';
  RAISE NOTICE '  • Row Level Security';
  RAISE NOTICE '  • Admin access to all orders';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Run this SQL in Supabase SQL Editor';
  RAISE NOTICE '  2. Create OrderService.js in ecommerce app';
  RAISE NOTICE '  3. Update Cart to support notes & delivery';
  RAISE NOTICE '  4. Update Checkout to create orders';
  RAISE NOTICE '  5. Update Admin app to fetch real orders';
  RAISE NOTICE '========================================';
END $$;
