-- PROFESSIONAL COMPONENTS SYSTEM
-- This creates a proper e-commerce component management system

-- ==========================================
-- 🔧 COMPONENTS TABLE (Dynamic, Admin Managed)
-- ==========================================

CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- CPU, GPU, RAM, Storage, Motherboard, PSU, Cooling, Peripherals
  description TEXT,
  specifications JSONB DEFAULT '{}', -- Component-specific specs
  icon_url TEXT, -- For UI display
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(name, category) -- Prevent duplicate components
);

-- ==========================================
-- 🏷️ PRODUCT CATEGORIES (Auto-component assignment)
-- ==========================================

CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL, -- "Processors", "Graphics Cards", "Memory", etc.
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  default_component_categories TEXT[] DEFAULT '{}', -- Auto-assign these component types: ['CPU'] for processor products
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 🔗 MANY-TO-MANY: PRODUCT ↔ COMPONENTS
-- ==========================================

CREATE TABLE product_components (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  component_id UUID REFERENCES components(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1, -- For bundle products that might have multiple of same component
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (product_id, component_id)
);

-- ==========================================
-- 📦 UPDATE PRODUCTS TABLE
-- ==========================================

-- Add category reference to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);

-- Keep existing selected_components for backward compatibility, but it will be phased out
-- The new system will use product_components table instead

-- ==========================================
-- 🎯 SEED DATA - COMPONENT CATEGORIES ONLY
-- ==========================================

INSERT INTO product_categories (name, slug, description, default_component_categories) VALUES
('Processors', 'processors', 'CPU and processing units', ARRAY['CPU']),
('Graphics Cards', 'graphics-cards', 'GPU and graphics processing units', ARRAY['GPU']),
('Memory', 'memory', 'RAM and system memory', ARRAY['RAM']),
('Storage', 'storage', 'Hard drives, SSDs, and storage devices', ARRAY['Storage']),
('Motherboards', 'motherboards', 'System motherboards and mainboards', ARRAY['Motherboard']),
('Power Supplies', 'power-supplies', 'PSU and power management', ARRAY['PSU']),
('Cooling', 'cooling', 'Fans, coolers, and thermal management', ARRAY['Cooling']),
('Cases', 'cases', 'PC cases and enclosures', ARRAY['Case']),
('Peripherals', 'peripherals', 'Keyboards, mice, and input devices', ARRAY['Peripherals']),
('Complete PCs', 'complete-pcs', 'Pre-built computer systems', ARRAY['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Cooling', 'Case']),
('Laptops', 'laptops', 'Laptop computers', ARRAY['CPU', 'GPU', 'RAM', 'Storage', 'Display']),
('Monitors', 'monitors', 'Display screens and monitors', ARRAY['Display']),
('Audio', 'audio', 'Speakers, headphones, and audio equipment', ARRAY['Audio']),
('General', 'general', 'General products and miscellaneous items', ARRAY[]);

-- ==========================================
-- 📝 NOTE: COMPONENTS TABLE IS EMPTY
-- ==========================================
-- The components table is created but empty.
-- You can now add your own components manually through:
-- 1. Admin interface (recommended)
-- 2. Direct SQL inserts
-- 3. Import from CSV/JSON

-- Example of how to add a component manually:
-- INSERT INTO components (name, category, description) VALUES 
-- ('Your Component Name', 'CPU', 'Your component description');

-- ==========================================
-- 🔍 VERIFICATION QUERIES
-- ==========================================

-- Show component categories
SELECT name, default_component_categories FROM product_categories ORDER BY name;

-- Show components count (should be 0 initially)
SELECT category, COUNT(*) as component_count FROM components GROUP BY category ORDER BY category;

-- Show all components (should be empty initially)
SELECT name, category, description FROM components ORDER BY category, name;