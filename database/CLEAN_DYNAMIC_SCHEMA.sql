-- =====================================================
-- CLEAN DYNAMIC COMPONENTS SCHEMA - NO CONFLICTS
-- Run this complete script in Supabase SQL Editor
-- =====================================================

-- 1. Product Categories (replaces hardcoded components)
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Category Specifications Template
CREATE TABLE IF NOT EXISTS category_specifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  spec_name VARCHAR(100) NOT NULL,
  spec_label VARCHAR(100) NOT NULL,
  spec_type VARCHAR(50) NOT NULL,
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  placeholder TEXT,
  validation_rules JSONB,
  options JSONB,
  display_order INTEGER DEFAULT 0,
  help_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, spec_name)
);

-- 3. Product Category Assignments (bridge table)
CREATE TABLE IF NOT EXISTS product_category_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  specifications JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

-- =====================================================
-- INSERT CATEGORIES
-- =====================================================

INSERT INTO product_categories (name, slug, description, display_order) VALUES
('Processor', 'processor', 'CPU components and processors', 1),
('Motherboard', 'motherboard', 'Motherboard and chipset components', 2),
('RAM', 'ram', 'Memory modules and storage', 3),
('SSD', 'ssd', 'Solid State Drives', 4),
('HDD', 'hdd', 'Hard Disk Drives', 5),
('Graphics Card', 'graphics-card', 'GPU and graphics components', 6),
('Power Supply', 'power-supply', 'PSU and power components', 7),
('Cooling', 'cooling', 'Fans and cooling systems', 8),
('Case', 'case', 'Computer cases and enclosures', 9),
('Monitor', 'monitor', 'Display devices', 10),
('Keyboard', 'keyboard', 'Input devices - keyboards', 11),
('Mouse', 'mouse', 'Input devices - mice', 12)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- BASIC SPECIFICATIONS (Simple approach)
-- =====================================================

-- Get category IDs for reference
DO $$
DECLARE
    processor_id UUID;
    ram_id UUID;
    ssd_id UUID;
    gpu_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO processor_id FROM product_categories WHERE slug = 'processor';
    SELECT id INTO ram_id FROM product_categories WHERE slug = 'ram';
    SELECT id INTO ssd_id FROM product_categories WHERE slug = 'ssd';
    SELECT id INTO gpu_id FROM product_categories WHERE slug = 'graphics-card';
    
    -- Processor specifications
    INSERT INTO category_specifications (category_id, spec_name, spec_label, spec_type, is_required, options, display_order) VALUES
    (processor_id, 'brand', 'Brand', 'dropdown', true, '{"options": ["Intel", "AMD", "Apple"]}', 1),
    (processor_id, 'cores', 'Number of Cores', 'number', true, null, 2),
    (processor_id, 'base_clock', 'Base Clock Speed (GHz)', 'number', true, null, 3),
    (processor_id, 'boost_clock', 'Boost Clock Speed (GHz)', 'number', false, null, 4),
    (processor_id, 'socket', 'Socket Type', 'text', true, null, 5)
    ON CONFLICT (category_id, spec_name) DO NOTHING;
    
    -- RAM specifications
    INSERT INTO category_specifications (category_id, spec_name, spec_label, spec_type, is_required, options, display_order) VALUES
    (ram_id, 'capacity', 'Capacity', 'dropdown', true, '{"options": ["4GB", "8GB", "16GB", "32GB", "64GB"]}', 1),
    (ram_id, 'speed', 'Speed (MHz)', 'dropdown', true, '{"options": ["2400", "2666", "3200", "3600", "4000"]}', 2),
    (ram_id, 'type', 'Type', 'dropdown', true, '{"options": ["DDR4", "DDR5"]}', 3)
    ON CONFLICT (category_id, spec_name) DO NOTHING;
    
    -- SSD specifications
    INSERT INTO category_specifications (category_id, spec_name, spec_label, spec_type, is_required, options, display_order) VALUES
    (ssd_id, 'capacity', 'Capacity', 'dropdown', true, '{"options": ["128GB", "256GB", "512GB", "1TB", "2TB", "4TB"]}', 1),
    (ssd_id, 'interface', 'Interface', 'dropdown', true, '{"options": ["SATA III", "M.2 NVMe", "PCIe"]}', 2)
    ON CONFLICT (category_id, spec_name) DO NOTHING;
    
    -- Graphics Card specifications
    INSERT INTO category_specifications (category_id, spec_name, spec_label, spec_type, is_required, options, display_order) VALUES
    (gpu_id, 'brand', 'Brand', 'dropdown', true, '{"options": ["NVIDIA", "AMD", "Intel"]}', 1),
    (gpu_id, 'vram', 'VRAM (GB)', 'number', true, null, 2),
    (gpu_id, 'memory_type', 'Memory Type', 'dropdown', true, '{"options": ["GDDR6", "GDDR6X", "HBM2"]}', 3)
    ON CONFLICT (category_id, spec_name) DO NOTHING;
    
END $$;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_category_specifications_category ON category_specifications(category_id);
CREATE INDEX IF NOT EXISTS idx_category_specifications_order ON category_specifications(display_order);
CREATE INDEX IF NOT EXISTS idx_product_category_assignments_product ON product_category_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_category_assignments_category ON product_category_assignments(category_id);

-- =====================================================
-- VIEWS
-- =====================================================

CREATE OR REPLACE VIEW category_specifications_view AS
SELECT 
  cs.*,
  pc.name as category_name,
  pc.slug as category_slug
FROM category_specifications cs
JOIN product_categories pc ON cs.category_id = pc.id
WHERE pc.is_active = true
ORDER BY cs.display_order;

CREATE OR REPLACE VIEW product_categories_view AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  pc.id as category_id,
  pc.name as category_name,
  pc.slug as category_slug,
  pca.specifications
FROM products p
LEFT JOIN product_category_assignments pca ON p.id = pca.product_id
LEFT JOIN product_categories pc ON pca.category_id = pc.id
WHERE pc.is_active = true;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Dynamic Components System successfully installed!';
    RAISE NOTICE '📊 Tables created: product_categories, category_specifications, product_category_assignments';
    RAISE NOTICE '🎯 Sample categories added: Processor, RAM, SSD, Graphics Card, and 8 more';
    RAISE NOTICE '🚀 Ready to add new categories without code changes!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '1. Test by adding a Laptop category';
    RAISE NOTICE '2. Build admin interface for category management';
    RAISE NOTICE '3. Update ProductCreate to use dynamic categories';
END $$;