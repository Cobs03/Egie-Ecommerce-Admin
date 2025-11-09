-- ============================================
-- SHOPPING CART SYSTEM - COMPLETE SETUP
-- ============================================
-- Creates: carts, cart_items tables with RLS
-- Each user has their own cart
-- Handles variants (8gb, 16gb, etc.)
-- Stores price at time of adding
-- ============================================

-- Step 1: Create carts table
-- ============================================
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one cart per user
  UNIQUE(user_id)
);

-- Add comment
COMMENT ON TABLE carts IS 'Shopping carts - one per user';

-- Create index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

-- Step 2: Create cart_items table
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Variant information (e.g., "8gb", "16gb", "blue", "large")
  variant_name VARCHAR(100), -- e.g., "8gb"
  variant_value TEXT, -- Additional variant details if needed
  
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  
  -- Store price at time of adding to cart (in case price changes later)
  price_at_add DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate product+variant in same cart
  UNIQUE(cart_id, product_id, variant_name)
);

-- Add comment
COMMENT ON TABLE cart_items IS 'Items in shopping carts with variant support';

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Step 3: Create function to update cart timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE carts 
  SET updated_at = NOW() 
  WHERE id = NEW.cart_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update cart timestamp when items change
DROP TRIGGER IF EXISTS trigger_update_cart_timestamp ON cart_items;
CREATE TRIGGER trigger_update_cart_timestamp
AFTER INSERT OR UPDATE OR DELETE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION update_cart_timestamp();

-- Step 4: Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies for carts
-- ============================================

-- Users can only view their own cart
DROP POLICY IF EXISTS "Users can view own cart" ON carts;
CREATE POLICY "Users can view own cart"
ON carts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own cart
DROP POLICY IF EXISTS "Users can create own cart" ON carts;
CREATE POLICY "Users can create own cart"
ON carts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart
DROP POLICY IF EXISTS "Users can update own cart" ON carts;
CREATE POLICY "Users can update own cart"
ON carts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own cart
DROP POLICY IF EXISTS "Users can delete own cart" ON carts;
CREATE POLICY "Users can delete own cart"
ON carts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 6: Create RLS Policies for cart_items
-- ============================================

-- Users can view items in their own cart
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
CREATE POLICY "Users can view own cart items"
ON cart_items FOR SELECT
TO authenticated
USING (
  cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid()
  )
);

-- Users can add items to their own cart
DROP POLICY IF EXISTS "Users can add items to own cart" ON cart_items;
CREATE POLICY "Users can add items to own cart"
ON cart_items FOR INSERT
TO authenticated
WITH CHECK (
  cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid()
  )
);

-- Users can update items in their own cart
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
CREATE POLICY "Users can update own cart items"
ON cart_items FOR UPDATE
TO authenticated
USING (
  cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid()
  )
);

-- Users can delete items from their own cart
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
CREATE POLICY "Users can delete own cart items"
ON cart_items FOR DELETE
TO authenticated
USING (
  cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid()
  )
);

-- Step 7: Create helper function to get or create cart
-- ============================================
CREATE OR REPLACE FUNCTION get_or_create_cart(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_cart_id UUID;
BEGIN
  -- Try to get existing cart
  SELECT id INTO v_cart_id
  FROM carts
  WHERE user_id = p_user_id;
  
  -- If no cart exists, create one
  IF v_cart_id IS NULL THEN
    INSERT INTO carts (user_id)
    VALUES (p_user_id)
    RETURNING id INTO v_cart_id;
  END IF;
  
  RETURN v_cart_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create function to get cart with items (for frontend)
-- ============================================
CREATE OR REPLACE FUNCTION get_cart_with_items(p_user_id UUID)
RETURNS TABLE(
  cart_id UUID,
  item_id UUID,
  product_id UUID,
  product_name TEXT,
  product_image TEXT,
  variant_name VARCHAR(100),
  quantity INTEGER,
  price_at_add DECIMAL(10, 2),
  current_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as cart_id,
    ci.id as item_id,
    ci.product_id,
    p.name as product_name,
    p.images->0->>'url' as product_image,
    ci.variant_name,
    ci.quantity,
    ci.price_at_add,
    p.price as current_price,
    (ci.quantity * ci.price_at_add) as total_price
  FROM carts c
  JOIN cart_items ci ON ci.cart_id = c.id
  JOIN products p ON p.id = ci.product_id
  WHERE c.user_id = p_user_id
  ORDER BY ci.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Verification Queries
-- ============================================

-- Check if tables were created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carts') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items') THEN
    RAISE NOTICE '✅ Tables created successfully: carts, cart_items';
  ELSE
    RAISE NOTICE '❌ Tables creation failed';
  END IF;
END $$;

-- Check if RLS is enabled
DO $$
BEGIN
  IF (SELECT relrowsecurity FROM pg_class WHERE relname = 'carts') AND
     (SELECT relrowsecurity FROM pg_class WHERE relname = 'cart_items') THEN
    RAISE NOTICE '✅ Row Level Security enabled on both tables';
  ELSE
    RAISE NOTICE '❌ RLS not enabled';
  END IF;
END $$;

-- Check policies count
DO $$
DECLARE
  cart_policies_count INTEGER;
  cart_items_policies_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cart_policies_count
  FROM pg_policies
  WHERE tablename = 'carts';
  
  SELECT COUNT(*) INTO cart_items_policies_count
  FROM pg_policies
  WHERE tablename = 'cart_items';
  
  RAISE NOTICE '✅ Policies created - carts: %, cart_items: %', cart_policies_count, cart_items_policies_count;
END $$;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SHOPPING CART SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  • carts (user carts)';
  RAISE NOTICE '  • cart_items (items in carts)';
  RAISE NOTICE '';
  RAISE NOTICE 'Features Enabled:';
  RAISE NOTICE '  • One cart per user';
  RAISE NOTICE '  • Variant support (8gb, 16gb, etc.)';
  RAISE NOTICE '  • Price at time of adding';
  RAISE NOTICE '  • Auto-update timestamps';
  RAISE NOTICE '  • Row Level Security';
  RAISE NOTICE '  • Helper functions';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Create CartService.js in frontend';
  RAISE NOTICE '  2. Create CartContext for state management';
  RAISE NOTICE '  3. Update ProductGrid to use real cart';
  RAISE NOTICE '  4. Build Cart UI component';
  RAISE NOTICE '========================================';
END $$;
