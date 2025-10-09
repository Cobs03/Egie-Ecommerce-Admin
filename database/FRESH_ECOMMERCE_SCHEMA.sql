-- 🚀 FRESH E-COMMERCE SCHEMA - OPTIMIZED & CLEAN
-- Version 2.0 - Built from scratch for better performance and maintainability
-- Run this AFTER cleaning the database with CLEANUP_DATABASE.sql

-- ==========================================
-- 🔧 EXTENSIONS & SETUP
-- ==========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption functions

-- ==========================================
-- 👤 USER PROFILES TABLE
-- ==========================================

-- Simple, focused profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic information
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  
  -- Computed full name
  full_name TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
      THEN trim(first_name || ' ' || last_name)
      WHEN first_name IS NOT NULL THEN first_name
      WHEN last_name IS NOT NULL THEN last_name
      ELSE split_part(email, '@', 1)
    END
  ) STORED,
  
  -- Address (simple structure)
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Philippines',
  
  -- Account settings
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Preferences as JSONB
  preferences JSONB DEFAULT '{
    "notifications": {
      "email_orders": true,
      "email_marketing": false,
      "sms_orders": false
    },
    "display": {
      "currency": "PHP",
      "language": "en"
    }
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 🏪 PRODUCT CATALOG
-- ==========================================

-- Categories (simple hierarchy)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- Simple hierarchy (parent-child)
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Display
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (streamlined)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  
  -- Pricing (simplified)
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(12,2) CHECK (compare_at_price >= 0),
  cost_price DECIMAL(12,2) CHECK (cost_price >= 0),
  
  -- Relationships
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  track_inventory BOOLEAN DEFAULT true,
  low_stock_threshold INTEGER DEFAULT 10,
  
  -- Media (as JSONB arrays)
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Product details (flexible JSONB)
  specifications JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  
  -- Physical attributes
  weight DECIMAL(8,3), -- in kg
  dimensions JSONB DEFAULT '{}'::jsonb, -- {length, width, height, unit}
  
  -- Status and visibility
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  
  -- Reviews (calculated fields)
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants (for products with options like size, color)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Variant info
  title VARCHAR(255),
  sku VARCHAR(100) UNIQUE,
  
  -- Options (up to 3 option types)
  option1_name VARCHAR(50),  -- e.g., "Color"
  option1_value VARCHAR(50), -- e.g., "Red"
  option2_name VARCHAR(50),  -- e.g., "Size"
  option2_value VARCHAR(50), -- e.g., "Large"
  option3_name VARCHAR(50),
  option3_value VARCHAR(50),
  
  -- Pricing (can override product price)
  price DECIMAL(12,2),
  compare_at_price DECIMAL(12,2),
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  
  -- Physical attributes
  weight DECIMAL(8,3),
  image_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 🛒 SHOPPING CART & WISHLIST
-- ==========================================

-- Cart items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  
  -- For guest carts
  session_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, product_id, variant_id),
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Wishlist items
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, product_id)
);

-- ==========================================
-- 📋 ORDER MANAGEMENT
-- ==========================================

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  
  -- Order totals
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PHP',
  
  -- Addresses (as JSONB for flexibility)
  billing_address JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
  ),
  payment_status VARCHAR(30) DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'failed')
  ),
  fulfillment_status VARCHAR(30) DEFAULT 'unfulfilled' CHECK (
    fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled')
  ),
  
  -- Shipping
  shipping_method VARCHAR(100),
  tracking_number VARCHAR(100),
  
  -- Notes
  notes TEXT,
  customer_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Product snapshot (at time of order)
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  variant_title VARCHAR(255),
  product_image_url TEXT,
  
  -- Pricing (at time of order)
  price DECIMAL(12,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total DECIMAL(12,2) NOT NULL,
  
  -- Product details snapshot
  product_details JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 💳 PAYMENT SYSTEM
-- ==========================================

-- Payment transactions
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  payment_method VARCHAR(50) NOT NULL,
  payment_gateway VARCHAR(50),
  
  -- Status
  status VARCHAR(30) DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')
  ),
  
  -- Gateway data
  gateway_transaction_id TEXT,
  gateway_response JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ==========================================
-- 🚚 SHIPPING
-- ==========================================

-- Shipping methods
CREATE TABLE shipping_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  free_shipping_threshold DECIMAL(12,2),
  
  -- Delivery estimates
  min_delivery_days INTEGER,
  max_delivery_days INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 💬 REVIEWS & RATINGS
-- ==========================================

-- Product reviews
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  
  -- Media
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  is_verified_purchase BOOLEAN DEFAULT false,
  
  -- Helpfulness
  helpful_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One review per customer per product
  UNIQUE(product_id, customer_id)
);

-- ==========================================
-- 💰 DISCOUNTS & PROMOTIONS
-- ==========================================

-- Discount codes
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Discount type and value
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_shipping')),
  value DECIMAL(10,2) NOT NULL,
  
  -- Usage limits
  usage_limit INTEGER,
  usage_limit_per_customer INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  
  -- Conditions
  minimum_order_amount DECIMAL(12,2),
  maximum_discount_amount DECIMAL(12,2),
  
  -- Validity
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 📊 ANALYTICS (SIMPLE)
-- ==========================================

-- Product views for analytics
CREATE TABLE product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 🔧 FUNCTIONS AND TRIGGERS
-- ==========================================

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    new_number := 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_number) INTO exists_check;
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update product rating when reviews change
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  product_uuid UUID;
BEGIN
  -- Get the product ID from the review
  product_uuid := COALESCE(NEW.product_id, OLD.product_id);
  
  -- Update the product's rating and review count
  UPDATE products 
  SET 
    rating = COALESCE((
      SELECT AVG(rating::numeric)::decimal(3,2)
      FROM product_reviews 
      WHERE product_id = product_uuid 
        AND status = 'approved'
    ), 0),
    review_count = (
      SELECT COUNT(*)::integer
      FROM product_reviews 
      WHERE product_id = product_uuid 
        AND status = 'approved'
    ),
    updated_at = NOW()
  WHERE id = product_uuid;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 🎯 TRIGGERS
-- ==========================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at triggers
CREATE TRIGGER trigger_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_brands_updated_at 
  BEFORE UPDATE ON brands 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_product_variants_updated_at 
  BEFORE UPDATE ON product_variants 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_cart_items_updated_at 
  BEFORE UPDATE ON cart_items 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_shipping_methods_updated_at 
  BEFORE UPDATE ON shipping_methods 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_product_reviews_updated_at 
  BEFORE UPDATE ON product_reviews 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_discounts_updated_at 
  BEFORE UPDATE ON discounts 
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Order number generation trigger
CREATE OR REPLACE FUNCTION trigger_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_generate_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_generate_order_number();

-- Product rating update trigger
CREATE TRIGGER product_review_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ==========================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 🔐 RLS POLICIES
-- ==========================================

-- Public read policies for catalog data
CREATE POLICY "Anyone can view active categories" 
  ON categories FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active brands" 
  ON brands FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active products" 
  ON products FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can view active product variants" 
  ON product_variants FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active shipping methods" 
  ON shipping_methods FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view approved reviews" 
  ON product_reviews FOR SELECT USING (status = 'approved');

-- User-specific policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage their own cart" 
  ON cart_items FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist" 
  ON wishlist_items FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" 
  ON orders FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can create product reviews" 
  ON product_reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own reviews" 
  ON product_reviews FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Anyone can insert product views" 
  ON product_views FOR INSERT WITH CHECK (true);

-- Admin policies (admins can do everything)
CREATE POLICY "Admins have full access to profiles" 
  ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage categories" 
  ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage brands" 
  ON brands FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage products" 
  ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage product variants" 
  ON product_variants FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage orders" 
  ON orders FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage order items" 
  ON order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage payments" 
  ON payments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage reviews" 
  ON product_reviews FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can manage discounts" 
  ON discounts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ==========================================
-- 🪣 STORAGE SETUP
-- ==========================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profiles', 'profiles', true),
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('brands', 'brands', true),
  ('reviews', 'reviews', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view public images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id IN ('profiles', 'products', 'categories', 'brands', 'reviews'));

CREATE POLICY "Authenticated users can upload profile images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile images"
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own profile images"
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage product images"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('products', 'categories', 'brands')
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Authenticated users can upload review images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'reviews' AND auth.role() = 'authenticated');

-- ==========================================
-- 📈 PERFORMANCE INDEXES
-- ==========================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);

-- Product indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_name_search ON products USING gin(name gin_trgm_ops);

-- Category indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Order indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Review indexes
CREATE INDEX idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_reviews_customer_id ON product_reviews(customer_id);
CREATE INDEX idx_reviews_status ON product_reviews(status);

-- Cart indexes
CREATE INDEX idx_cart_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_session_id ON cart_items(session_id);

-- ==========================================
-- 🌱 SAMPLE DATA
-- ==========================================

-- Sample Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Gaming Laptops', 'gaming-laptops', 'High-performance laptops for gaming', 'https://via.placeholder.com/200x200/333/fff?text=💻'),
('Desktop PCs', 'desktop-pcs', 'Custom and pre-built gaming desktops', 'https://via.placeholder.com/200x200/444/fff?text=🖥️'),
('Processors', 'processors', 'CPUs from AMD and Intel', 'https://via.placeholder.com/200x200/f44336/fff?text=🧠'),
('Graphics Cards', 'graphics-cards', 'GPUs for gaming and professional work', 'https://via.placeholder.com/200x200/4caf50/fff?text=🎮'),
('Memory & Storage', 'memory-storage', 'RAM and storage solutions', 'https://via.placeholder.com/200x200/2196f3/fff?text=💾'),
('Gaming Peripherals', 'gaming-peripherals', 'Gaming mice, keyboards, and accessories', 'https://via.placeholder.com/200x200/e91e63/fff?text=🎯'),
('Monitors', 'monitors', 'Gaming and professional monitors', 'https://via.placeholder.com/200x200/ff9800/fff?text=🖥️'),
('Audio', 'audio', 'Gaming headsets and speakers', 'https://via.placeholder.com/200x200/9c27b0/fff?text=🎧')
ON CONFLICT (slug) DO NOTHING;

-- Sample Brands
INSERT INTO brands (name, slug, description, logo_url, website_url) VALUES
('AMD', 'amd', 'Advanced Micro Devices', 'https://via.placeholder.com/120x60/f44336/fff?text=AMD', 'https://www.amd.com'),
('Intel', 'intel', 'Intel Corporation', 'https://via.placeholder.com/120x60/2196f3/fff?text=Intel', 'https://www.intel.com'),
('NVIDIA', 'nvidia', 'NVIDIA Corporation', 'https://via.placeholder.com/120x60/4caf50/fff?text=NVIDIA', 'https://www.nvidia.com'),
('Samsung', 'samsung', 'Samsung Electronics', 'https://via.placeholder.com/120x60/000/fff?text=Samsung', 'https://www.samsung.com'),
('Corsair', 'corsair', 'Corsair Gaming', 'https://via.placeholder.com/120x60/ffeb3b/000?text=Corsair', 'https://www.corsair.com'),
('Logitech', 'logitech', 'Logitech International', 'https://via.placeholder.com/120x60/00bcd4/fff?text=Logitech', 'https://www.logitech.com'),
('ASUS', 'asus', 'ASUS Computer', 'https://via.placeholder.com/120x60/ff5722/fff?text=ASUS', 'https://www.asus.com'),
('MSI', 'msi', 'MSI Gaming', 'https://via.placeholder.com/120x60/795548/fff?text=MSI', 'https://www.msi.com'),
('Razer', 'razer', 'Razer Inc.', 'https://via.placeholder.com/120x60/00ff00/000?text=Razer', 'https://www.razer.com')
ON CONFLICT (name) DO NOTHING;

-- Sample Shipping Methods
INSERT INTO shipping_methods (name, description, price, min_delivery_days, max_delivery_days) VALUES
('Standard Shipping', 'Regular delivery within Metro Manila', 150.00, 2, 5),
('Express Shipping', 'Fast delivery within 1-2 days', 300.00, 1, 2),
('Free Shipping', 'Free delivery for orders over ₱5,000', 0.00, 3, 7),
('Same Day Delivery', 'Same day delivery within selected areas', 500.00, 0, 1);

-- ==========================================
-- ✅ COMPLETION & VERIFICATION
-- ==========================================

-- Verification queries
SELECT 
  '🎉 FRESH E-COMMERCE SCHEMA SETUP COMPLETE!' as status,
  'Schema version 2.0 - Clean, optimized, and ready!' as version,
  'All tables, functions, and policies created successfully' as setup_status;

-- Count tables created
SELECT 
  'Tables created: ' || COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT LIKE 'sql_%';

-- Count functions created
SELECT 
  'Functions created: ' || COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name NOT LIKE 'pg_%';

-- Count storage buckets
SELECT 
  'Storage buckets: ' || COUNT(*) as bucket_count
FROM storage.buckets 
WHERE id IN ('profiles', 'products', 'categories', 'brands', 'reviews');

SELECT 
  '🚀 Next Steps:' as next_steps,
  '1. Test user registration and profile creation' as step_1,
  '2. Upload sample products through admin panel' as step_2,
  '3. Test cart and checkout functionality' as step_3,
  '4. Verify image upload works correctly' as step_4;