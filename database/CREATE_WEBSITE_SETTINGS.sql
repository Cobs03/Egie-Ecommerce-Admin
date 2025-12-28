-- Create website_settings table
CREATE TABLE IF NOT EXISTS website_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  brand_name TEXT DEFAULT 'EGIE E-Commerce',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#22c55e',
  secondary_color TEXT DEFAULT '#2176ae',
  accent_color TEXT DEFAULT '#ffe14d',
  terms_and_conditions TEXT,
  privacy_policy TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row_constraint CHECK (id = 1)
);

-- Create website_policies table
CREATE TABLE IF NOT EXISTS website_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('terms', 'privacy')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on type for better query performance
CREATE INDEX IF NOT EXISTS idx_website_policies_type ON website_policies(type);

-- Insert default settings
INSERT INTO website_settings (id) 
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_policies ENABLE ROW LEVEL SECURITY;

-- Allow admins to read and update website_settings
CREATE POLICY "Admins can read website settings"
  ON website_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role IN ('admin', 'manager'))
    )
  );

CREATE POLICY "Admins can update website settings"
  ON website_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Allow public read access for customer-facing website
CREATE POLICY "Public can read website settings"
  ON website_settings
  FOR SELECT
  TO anon
  USING (true);

-- Policies for website_policies table
CREATE POLICY "Admins can read policies"
  ON website_policies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role IN ('admin', 'manager'))
    )
  );

CREATE POLICY "Admins can insert policies"
  ON website_policies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Admins can update policies"
  ON website_policies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Admins can delete policies"
  ON website_policies
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Public can read policies
CREATE POLICY "Public can read policies"
  ON website_policies
  FOR SELECT
  TO anon
  USING (true);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_website_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_website_policies_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_website_settings_timestamp ON website_settings;
CREATE TRIGGER update_website_settings_timestamp
  BEFORE UPDATE ON website_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_website_settings_timestamp();

DROP TRIGGER IF EXISTS update_website_policies_timestamp ON website_policies;
CREATE TRIGGER update_website_policies_timestamp
  BEFORE UPDATE ON website_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_website_policies_timestamp();

-- Grant permissions
GRANT SELECT ON website_settings TO anon;
GRANT SELECT, UPDATE ON website_settings TO authenticated;
GRANT SELECT ON website_policies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON website_policies TO authenticated;
