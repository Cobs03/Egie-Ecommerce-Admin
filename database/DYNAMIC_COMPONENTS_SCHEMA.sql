-- =====================================================
-- DYNAMIC COMPONENTS SYSTEM SCHEMA
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
  spec_label VARCHAR(100) NOT NULL, -- Display name
  spec_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'dropdown', 'boolean', 'textarea'
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  placeholder TEXT,
  validation_rules JSONB, -- min, max, pattern, etc.
  options JSONB, -- for dropdown: {"options": ["Option1", "Option2"]}
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
  specifications JSONB NOT NULL DEFAULT '{}', -- actual spec values
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

-- =====================================================
-- SAMPLE DATA - Migrate from hardcoded components
-- =====================================================

-- Insert existing categories
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
('Mouse', 'mouse', 'Input devices - mice', 12);

-- Sample specifications for Processor category
INSERT INTO category_specifications (category_id, spec_name, spec_label, spec_type, is_required, options, display_order) 
SELECT 
  id,
  'brand',
  'Brand',
  'dropdown',
  true,
  '{"options": ["Intel", "AMD", "Apple"]}',
  1
FROM product_categories WHERE slug = 'processor';

INSERT INTO category_specifications (category_id, spec_name, spec_label, spec_type, is_required, display_order) 
SELECT 
  id,
  'cores',
  'Number of Cores',
  'number',
  true,
  2
FROM product_categories WHERE slug = 'processor';

INSERT INTO category_specifications (category_id, spec_name, spec_label, spec_type, is_required, display_order) 
SELECT 
  id,
  'base_clock',
  'Base Clock Speed (GHz)',
  'number',
  true,
  3
FROM product_categories WHERE slug = 'processor';

INSERT INTO category_specifications (category_id, spec_name, spec_label, spec_type, display_order) 
SELECT 
  id,
  'boost_clock',
  'Boost Clock Speed (GHz)',
  'number',
  false,
  4
FROM product_categories WHERE slug = 'processor';

INSERT INTO category_specifications (category_id, spec_name, spec_label, spec_type, is_required, display_order) 
SELECT 
  id,
  'socket',
  'Socket Type',
  'text',
  true,
  5
FROM product_categories WHERE slug = 'processor';

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_categories_updated_at 
  BEFORE UPDATE ON product_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_specifications_updated_at 
  BEFORE UPDATE ON category_specifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_category_assignments_updated_at 
  BEFORE UPDATE ON product_category_assignments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_product_categories_slug ON product_categories(slug);
CREATE INDEX idx_product_categories_active ON product_categories(is_active);
CREATE INDEX idx_category_specifications_category ON category_specifications(category_id);
CREATE INDEX idx_category_specifications_order ON category_specifications(display_order);
CREATE INDEX idx_product_category_assignments_product ON product_category_assignments(product_id);
CREATE INDEX idx_product_category_assignments_category ON product_category_assignments(category_id);

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

-- View to get all specifications for a category
CREATE OR REPLACE VIEW category_specifications_view AS
SELECT 
  cs.*,
  pc.name as category_name,
  pc.slug as category_slug
FROM category_specifications cs
JOIN product_categories pc ON cs.category_id = pc.id
WHERE pc.is_active = true
ORDER BY cs.display_order;

-- View to get product with all its category data
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