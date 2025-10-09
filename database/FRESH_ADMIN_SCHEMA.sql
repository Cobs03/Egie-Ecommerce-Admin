-- 🎯 FRESH ECOMMERCE SCHEMA - ADMIN FOCUSED
-- Clean, minimal schema that matches your admin exactly
-- Run this AFTER FRESH_CLEANUP.sql

-- ==========================================
-- 🔧 SETUP
-- ==========================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 👤 PROFILES - ENSURE CORRECT STRUCTURE
-- ==========================================

-- Update profiles table to ensure it has admin functionality
-- (Only adds missing columns, won't break existing data)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==========================================
-- 🏷️ BRANDS TABLE (for ProductBasicInfo)
-- ==========================================

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 📦 PRODUCTS TABLE (matches ProductCreate exactly)
-- ==========================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info (from ProductBasicInfo component)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  warranty VARCHAR(50),
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  
  -- Pricing (calculated from variants)
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  
  -- Media (from MediaUpload component)
  images JSONB DEFAULT '[]',
  
  -- Admin Data (exactly what ProductCreate sends)
  selected_components JSONB DEFAULT '[]',  -- From ComponentsSlider
  specifications JSONB DEFAULT '{}',       -- From ComponentSpecifications
  variants JSONB DEFAULT '[]',             -- From VariantManager
  metadata JSONB DEFAULT '{}',             -- officialPrice, initialPrice, discount, etc.
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 🎁 BUNDLES TABLE (matches BundleCreate exactly)
-- ==========================================

CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info (from BundleCreate)
  bundle_name VARCHAR(255) NOT NULL,
  description TEXT,
  warranty VARCHAR(50),
  
  -- Pricing (from BundleCreate form)
  official_price DECIMAL(12,2) NOT NULL,
  initial_price DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(5,2) DEFAULT 0,
  
  -- Media (from MediaUpload)
  images JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 🔗 BUNDLE PRODUCTS (links bundles to products)
-- ==========================================

CREATE TABLE bundle_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  
  -- Store product details (from ProductData.json selection)
  product_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(100),
  product_price DECIMAL(12,2) NOT NULL,
  product_image TEXT,
  
  -- Position in bundle
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique products per bundle
  UNIQUE(bundle_id, product_name)
);

-- ==========================================
-- 🔧 INDEXES FOR PERFORMANCE
-- ==========================================

-- Product indexes
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Brand indexes
CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_brands_active ON brands(is_active);

-- Bundle indexes
CREATE INDEX idx_bundles_name ON bundles(bundle_name);
CREATE INDEX idx_bundles_status ON bundles(status);

-- Bundle product indexes
CREATE INDEX idx_bundle_products_bundle ON bundle_products(bundle_id);

-- ==========================================
-- 🛡️ ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_products ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 🔐 RLS POLICIES (SIMPLE & CLEAN)
-- ==========================================

-- BRANDS POLICIES
CREATE POLICY "Public can view active brands" ON brands
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage brands" ON brands
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- PRODUCTS POLICIES
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- BUNDLES POLICIES
CREATE POLICY "Public can view active bundles" ON bundles
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage bundles" ON bundles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- BUNDLE PRODUCTS POLICIES
CREATE POLICY "Public can view bundle products" ON bundle_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bundles 
      WHERE id = bundle_products.bundle_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Admins can manage bundle products" ON bundle_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ==========================================
-- 🎭 STORAGE SETUP
-- ==========================================

-- Create products storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'products' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'products' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ==========================================
-- 🌱 SAMPLE DATA
-- ==========================================

-- Sample brands for testing
INSERT INTO brands (name, slug, description) VALUES
  ('Apple', 'apple', 'Technology company'),
  ('Samsung', 'samsung', 'Electronics manufacturer'),
  ('ASUS', 'asus', 'Computer hardware'),
  ('MSI', 'msi', 'Gaming hardware'),
  ('Corsair', 'corsair', 'Gaming peripherals'),
  ('Intel', 'intel', 'Processor manufacturer'),
  ('AMD', 'amd', 'Processor and graphics'),
  ('NVIDIA', 'nvidia', 'Graphics cards'),
  ('Generic', 'generic', 'Generic/unbranded products')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- ✅ VERIFICATION
-- ==========================================

-- Check tables created
SELECT 
  'brands' as table_name, 
  count(*) as record_count 
FROM brands
UNION ALL
SELECT 
  'products' as table_name, 
  count(*) as record_count 
FROM products
UNION ALL
SELECT 
  'bundles' as table_name, 
  count(*) as record_count 
FROM bundles
UNION ALL
SELECT 
  'bundle_products' as table_name, 
  count(*) as record_count 
FROM bundle_products;

-- ==========================================
-- 📋 WHAT THIS SCHEMA SUPPORTS
-- ==========================================

/*
✅ ADMIN PRODUCT MANAGEMENT:
- ProductBasicInfo: name, description, warranty, brand selection
- MediaUpload: images stored in 'products' bucket
- ComponentsSlider: selected_components as JSONB
- ComponentSpecifications: specifications as JSONB
- VariantManager: variants as JSONB
- All metadata: officialPrice, initialPrice, discount

✅ ADMIN BUNDLE MANAGEMENT:
- BundleCreate: bundle_name, description, warranty
- Bundle pricing: official_price, initial_price, discount
- Bundle images: stored in 'products' bucket
- Product selection: stored in bundle_products table

✅ BRAND MANAGEMENT:
- BrandService: full CRUD operations
- Brand selection in ProductBasicInfo

✅ SECURITY:
- Admin-only access for management
- Public read access for active items
- Proper RLS policies

✅ PERFORMANCE:
- Optimized indexes
- Clean structure
- Minimal complexity

🎯 DESIGNED FOR YOUR ADMIN COMPONENTS:
This schema matches exactly what your admin creates.
No complex features you don't need.
Easy to query and maintain.
*/

SELECT 
  '🎉 FRESH SCHEMA SETUP COMPLETE!' as status,
  'Ready for your admin to create products and bundles!' as message;