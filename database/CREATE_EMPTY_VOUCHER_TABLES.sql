-- =====================================================
-- VOUCHER & DISCOUNT SYSTEM - Empty Tables (No Sample Data)
-- =====================================================
-- Run this in Supabase SQL Editor to create fresh tables
-- =====================================================

-- 1. Create VOUCHERS table
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  
  -- Date Range
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Usage Tracking
  usage_limit INTEGER NOT NULL,
  usage_count INTEGER DEFAULT 0,
  
  -- Additional fields
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  per_customer_limit INTEGER DEFAULT 1,
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_usage CHECK (usage_count >= 0 AND usage_count <= usage_limit)
);

-- 2. Create DISCOUNTS table
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  
  -- Date Range
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Usage Tracking
  usage_count INTEGER DEFAULT 0,
  
  -- Application Rules
  applies_to TEXT,
  min_spend DECIMAL(10,2),
  user_eligibility VARCHAR(50),
  
  -- Additional fields
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  max_discount_amount DECIMAL(10,2),
  
  -- Product/Category targeting
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

-- 3. Create VOUCHER_USAGE table
CREATE TABLE IF NOT EXISTS voucher_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id),
  order_id UUID,
  discount_amount DECIMAL(10,2) NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_amounts CHECK (
    discount_amount >= 0 AND 
    original_amount >= 0 AND 
    final_amount >= 0
  )
);

-- 4. Create DISCOUNT_USAGE table
CREATE TABLE IF NOT EXISTS discount_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id),
  order_id UUID,
  discount_amount DECIMAL(10,2) NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_discount_amounts CHECK (
    discount_amount >= 0 AND 
    original_amount >= 0 AND 
    final_amount >= 0
  )
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);
CREATE INDEX IF NOT EXISTS idx_vouchers_valid_dates ON vouchers(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_valid_dates ON discounts(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_voucher_id ON voucher_usage(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_customer_id ON voucher_usage(customer_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_discount_id ON discount_usage(discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_customer_id ON discount_usage(customer_id);

-- 6. Create triggers for updated_at
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

-- Admins and Managers full access
CREATE POLICY "Admins and Managers full access to vouchers"
  ON vouchers FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

CREATE POLICY "Admins and Managers full access to discounts"
  ON discounts FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

-- Employees can only view
CREATE POLICY "Employees can view vouchers"
  ON vouchers FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'employee'));

CREATE POLICY "Employees can view discounts"
  ON discounts FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'employee'));

-- Customers can view active ones
CREATE POLICY "Customers can view active vouchers"
  ON vouchers FOR SELECT
  USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

CREATE POLICY "Customers can view active discounts"
  ON discounts FOR SELECT
  USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

-- Usage policies
CREATE POLICY "Users can view their own voucher usage"
  ON voucher_usage FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Users can view their own discount usage"
  ON discount_usage FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Admins and Managers can view all voucher usage"
  ON voucher_usage FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

CREATE POLICY "Admins and Managers can view all discount usage"
  ON discount_usage FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

-- =====================================================
-- ✅ DONE! Tables created (empty, ready for data)
-- =====================================================
-- Now you can add vouchers/discounts from the admin UI
-- They will automatically save to the database!
-- =====================================================
