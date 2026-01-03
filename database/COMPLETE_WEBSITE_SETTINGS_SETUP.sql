-- =====================================================
-- COMPLETE WEBSITE SETTINGS SETUP
-- Run this script to create the table and add all columns
-- =====================================================

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

-- Add contact and social media fields
ALTER TABLE website_settings
ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT 'support@egiegameshop.com',
ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '(123) 456-7890',
ADD COLUMN IF NOT EXISTS contact_address TEXT DEFAULT '1234 Street Address City Address, 1234',
ADD COLUMN IF NOT EXISTS showroom_hours TEXT DEFAULT 'Mon-Sunday: 8:00 AM - 5:30 PM',
ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT 'https://facebook.com',
ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT 'https://instagram.com',
ADD COLUMN IF NOT EXISTS tiktok_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS twitter_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS about_us_title TEXT DEFAULT 'About Us',
ADD COLUMN IF NOT EXISTS about_us_content TEXT DEFAULT 'Welcome to our gaming store! We provide the best PC gaming hardware and accessories.',
ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT 'All rights reserved.';

-- Update the default row with contact info
UPDATE website_settings
SET 
  contact_email = COALESCE(contact_email, 'support@egiegameshop.com'),
  contact_phone = COALESCE(contact_phone, '(123) 456-7890'),
  contact_address = COALESCE(contact_address, '1234 Street Address City Address, 1234'),
  showroom_hours = COALESCE(showroom_hours, 'Mon-Sunday: 8:00 AM - 5:30 PM'),
  facebook_url = COALESCE(facebook_url, 'https://facebook.com'),
  instagram_url = COALESCE(instagram_url, 'https://instagram.com'),
  tiktok_url = COALESCE(tiktok_url, ''),
  twitter_url = COALESCE(twitter_url, ''),
  about_us_title = COALESCE(about_us_title, 'About Us'),
  about_us_content = COALESCE(about_us_content, 'Welcome to our gaming store! We provide the best PC gaming hardware and accessories.'),
  footer_text = COALESCE(footer_text, 'All rights reserved.')
WHERE id = 1;

-- Enable RLS
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_policies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read website settings" ON website_settings;
DROP POLICY IF EXISTS "Admins can update website settings" ON website_settings;
DROP POLICY IF EXISTS "Public can read website settings" ON website_settings;
DROP POLICY IF EXISTS "Admins can read policies" ON website_policies;
DROP POLICY IF EXISTS "Admins can insert policies" ON website_policies;
DROP POLICY IF EXISTS "Admins can update policies" ON website_policies;
DROP POLICY IF EXISTS "Admins can delete policies" ON website_policies;
DROP POLICY IF EXISTS "Public can read policies" ON website_policies;

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

-- Add column comments
COMMENT ON COLUMN website_settings.contact_email IS 'Contact email displayed in footer and contact pages';
COMMENT ON COLUMN website_settings.contact_phone IS 'Contact phone number displayed in footer';
COMMENT ON COLUMN website_settings.contact_address IS 'Physical showroom address';
COMMENT ON COLUMN website_settings.showroom_hours IS 'Business operating hours';
COMMENT ON COLUMN website_settings.facebook_url IS 'Facebook page URL';
COMMENT ON COLUMN website_settings.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN website_settings.tiktok_url IS 'TikTok profile URL (optional)';
COMMENT ON COLUMN website_settings.twitter_url IS 'Twitter/X profile URL (optional)';
COMMENT ON COLUMN website_settings.about_us_title IS 'About Us page title';
COMMENT ON COLUMN website_settings.about_us_content IS 'About Us page content';
COMMENT ON COLUMN website_settings.footer_text IS 'Footer copyright text';

-- Verify the setup
SELECT 'Setup complete! Website settings table created with all columns.' AS status;
SELECT * FROM website_settings WHERE id = 1;
