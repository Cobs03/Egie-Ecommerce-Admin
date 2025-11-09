-- =====================================================
-- VOUCHER & DISCOUNT SYSTEM - Complete Database Schema
-- =====================================================
-- This script creates tables matching your Promotions.jsx UI
-- Supports both VOUCHERS (with codes) and DISCOUNTS (automatic)
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create VOUCHERS table (matches your promotionData.js structure)
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info (matches your UI fields)
  name VARCHAR(255) NOT NULL,              -- "Free Delivery", "Discount"
  code VARCHAR(50) UNIQUE NOT NULL,        -- "A10KLJ", "8X1L05"
  price DECIMAL(10,2) NOT NULL,            -- ₱50, ₱10 (the voucher value)
  
  -- Date Range (matches "active" field: "05/05/24 - 06/06/25")
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Usage Tracking (matches your UI)
  usage_limit INTEGER NOT NULL,            -- "limit" field (49, 48)
  usage_count INTEGER DEFAULT 0,           -- "used" field (1, 0)
  
  -- Additional useful fields
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  per_customer_limit INTEGER DEFAULT 1,    -- Each customer can use X times
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_usage CHECK (usage_count >= 0 AND usage_count <= usage_limit)
);

-- 2. Create DISCOUNTS table (matches your discountData.js structure)
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info (matches your UI fields)
  name VARCHAR(255) NOT NULL,              -- "Summer Sale", "Flash Discount"
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percent', 'fixed')),  -- "percent" or "fixed"
  discount_value DECIMAL(10,2) NOT NULL,   -- 20 (for 20%), 100 (for ₱100)
  
  -- Date Range (matches "dates" field: "06/01/25 - 06/30/25")
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Usage Tracking
  usage_count INTEGER DEFAULT 0,           -- "used" field (145, 89, 320)
  
  -- Application Rules (matches your UI)
  applies_to TEXT,                         -- "All Products", "Controllers", "Gaming Accessories"
  min_spend DECIMAL(10,2),                 -- 500, 1000, null
  user_eligibility VARCHAR(50),            -- "All Users", "New Users", "Existing Users", "Selected"
  
  -- Additional fields
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  max_discount_amount DECIMAL(10,2),       -- Cap for percentage discounts
  
  -- Product/Category targeting (for advanced filtering)
  applicable_products JSONB DEFAULT '[]'::jsonb,
  applicable_categories JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_discount_value CHECK (discount_value >= 0),
  CONSTRAINT valid_usage_count CHECK (usage_count >= 0)
);

-- 3. Create VOUCHER_USAGE table (track who used which voucher)
CREATE TABLE IF NOT EXISTS voucher_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id),
  order_id UUID, -- Will reference orders table when you build it
  
  -- Usage Details
  discount_amount DECIMAL(10,2) NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  
  -- Timestamp
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_amounts CHECK (
    discount_amount >= 0 AND 
    original_amount >= 0 AND 
    final_amount >= 0
  )
);

-- 4. Create DISCOUNT_USAGE table (track discount applications)
CREATE TABLE IF NOT EXISTS discount_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id),
  order_id UUID, -- Will reference orders table when you build it
  
  -- Usage Details
  discount_amount DECIMAL(10,2) NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  
  -- Timestamp
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_discount_amounts CHECK (
    discount_amount >= 0 AND 
    original_amount >= 0 AND 
    final_amount >= 0
  )
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);
CREATE INDEX IF NOT EXISTS idx_vouchers_valid_dates ON vouchers(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_valid_dates ON discounts(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_voucher_id ON voucher_usage(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_customer_id ON voucher_usage(customer_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_discount_id ON discount_usage(discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_customer_id ON discount_usage(customer_id);

-- 6. Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_voucher_timestamp
  BEFORE UPDATE ON vouchers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER trigger_update_discount_timestamp
  BEFORE UPDATE ON discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

-- 7. Create triggers to increment usage_count
CREATE OR REPLACE FUNCTION increment_voucher_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vouchers 
  SET usage_count = usage_count + 1 
  WHERE id = NEW.voucher_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_discount_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE discounts 
  SET usage_count = usage_count + 1 
  WHERE id = NEW.discount_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_voucher_usage
  AFTER INSERT ON voucher_usage
  FOR EACH ROW
  EXECUTE FUNCTION increment_voucher_usage_count();

CREATE TRIGGER trigger_increment_discount_usage
  AFTER INSERT ON discount_usage
  FOR EACH ROW
  EXECUTE FUNCTION increment_discount_usage_count();

-- 8. Row Level Security (RLS) Policies
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;

-- Admins and Managers can do everything with vouchers
CREATE POLICY "Admins and Managers full access to vouchers"
  ON vouchers
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'manager')
    )
  );

-- Admins and Managers can do everything with discounts
CREATE POLICY "Admins and Managers full access to discounts"
  ON discounts
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'manager')
    )
  );

-- Employees can only view vouchers and discounts
CREATE POLICY "Employees can view vouchers"
  ON vouchers
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role = 'employee'
    )
  );

CREATE POLICY "Employees can view discounts"
  ON discounts
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role = 'employee'
    )
  );

-- Customers can view active vouchers and discounts
CREATE POLICY "Customers can view active vouchers"
  ON vouchers
  FOR SELECT
  USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

CREATE POLICY "Customers can view active discounts"
  ON discounts
  FOR SELECT
  USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

-- Everyone can view their own usage
CREATE POLICY "Users can view their own voucher usage"
  ON voucher_usage
  FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Users can view their own discount usage"
  ON discount_usage
  FOR SELECT
  USING (customer_id = auth.uid());

-- Admins and Managers can view all usage
CREATE POLICY "Admins and Managers can view all voucher usage"
  ON voucher_usage
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and Managers can view all discount usage"
  ON discount_usage
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'manager')
    )
  );

-- 9. Insert sample data matching your UI structure

-- Sample VOUCHERS (matches your promotionData.js)
INSERT INTO vouchers (name, code, price, valid_from, valid_until, usage_limit, usage_count, is_active, description, min_purchase_amount)
VALUES 
  -- Free Delivery voucher
  ('Free Delivery', 'A10KLJ', 50.00, 
   '2024-05-05'::timestamp, '2025-06-06'::timestamp, 
   49, 1, true, 
   'Get free delivery on your order', 0),
  
  -- Discount voucher
  ('Discount', '8X1L05', 10.00, 
   '2024-05-05'::timestamp, '2025-06-06'::timestamp, 
   48, 0, true, 
   'Save ₱10 on your purchase', 0),
  
  -- Welcome voucher
  ('Welcome Gift', 'WELCOME100', 100.00,
   NOW(), NOW() + INTERVAL '90 days',
   1000, 15, true,
   'New customer welcome voucher', 500),
  
  -- Premium voucher
  ('VIP Discount', 'VIP50', 50.00,
   NOW(), NOW() + INTERVAL '30 days',
   200, 45, true,
   'Exclusive VIP discount', 1000)
ON CONFLICT (code) DO NOTHING;

-- Sample DISCOUNTS (matches your discountData.js)
INSERT INTO discounts (name, discount_type, discount_value, valid_from, valid_until, usage_count, applies_to, min_spend, user_eligibility, is_active, description)
VALUES 
  -- Summer Sale
  ('Summer Sale', 'percent', 20.00,
   '2025-06-01'::timestamp, '2025-06-30'::timestamp,
   145, 'All Products', 500, 'All Users', true,
   'Summer clearance sale - 20% off everything'),
  
  -- Flash Discount
  ('Flash Discount', 'fixed', 100.00,
   '2025-05-15'::timestamp, '2025-05-20'::timestamp,
   89, 'Controllers', 1000, 'New Users', true,
   'Limited time flash discount'),
  
  -- Member Exclusive
  ('Member Exclusive', 'percent', 15.00,
   '2025-01-01'::timestamp, '2025-12-31'::timestamp,
   320, 'Gaming Accessories', NULL, 'Existing Users', true,
   'Year-round member discount'),
  
  -- Bundle Deal
  ('Bundle Deal', 'fixed', 250.00,
   '2025-07-01'::timestamp, '2025-07-15'::timestamp,
   56, 'Console Bundles', 5000, 'Selected', true,
   'Special bundle discount'),
  
  -- Black Friday
  ('Black Friday', 'percent', 30.00,
   '2025-11-24'::timestamp, '2025-11-26'::timestamp,
   512, 'All Products', NULL, 'All Users', true,
   'Black Friday mega sale - 30% off!')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SUCCESS! Voucher & Discount system tables created
-- =====================================================

-- 📊 SUMMARY OF TABLES CREATED:
-- 
-- 1. VOUCHERS table - Stores voucher codes with:
--    ✅ name, code, price (voucher value)
--    ✅ valid_from, valid_until (date range)
--    ✅ usage_limit, usage_count (tracking)
--    ✅ Matches your promotionData.js structure
--
-- 2. DISCOUNTS table - Stores automatic discounts with:
--    ✅ name, discount_type (percent/fixed), discount_value
--    ✅ valid_from, valid_until (date range)
--    ✅ applies_to, min_spend, user_eligibility
--    ✅ Matches your discountData.js structure
--
-- 3. VOUCHER_USAGE table - Tracks who used which voucher
-- 4. DISCOUNT_USAGE table - Tracks discount applications
--
-- =====================================================
-- NEXT STEPS:
-- =====================================================
-- 1. ✅ Run this SQL in Supabase SQL Editor
-- 2. 🔄 I'll create VoucherService.js and DiscountService.js
-- 3. 🎨 Connect to your Promotions.jsx UI
-- 4. 🧪 Test creating/editing vouchers and discounts
-- =====================================================

-- 🎯 TO RUN THIS:
-- 1. Open Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Paste this entire file
-- 4. Click "Run"
-- =====================================================
