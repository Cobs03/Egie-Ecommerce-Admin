-- =====================================================
-- POPUP ADS SYSTEM - Complete Database Setup
-- =====================================================
-- This creates the popup ads table, storage bucket, and RLS policies
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. CREATE POPUP ADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS popup_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  images TEXT[] DEFAULT '{}',  -- Array of image URLs
  link_url TEXT,
  link_type VARCHAR(20) DEFAULT 'external' CHECK (link_type IN ('external', 'product', 'category', 'none')),
  
  -- Display Settings
  display_frequency VARCHAR(30) DEFAULT 'once_per_session' 
    CHECK (display_frequency IN ('once_per_session', 'once_per_day', 'every_visit', 'once_forever')),
  delay_seconds INTEGER DEFAULT 2,
  auto_close_seconds INTEGER,  -- null = manual close only
  show_on_pages TEXT[] DEFAULT ARRAY['home']::TEXT[],  -- ['home', 'products', 'cart', 'all']
  target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'new_users', 'returning_users', 'logged_in', 'guests')),
  
  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Analytics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CONSTRAINT positive_delay CHECK (delay_seconds >= 0),
  CONSTRAINT positive_auto_close CHECK (auto_close_seconds IS NULL OR auto_close_seconds > 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_popup_ads_is_active ON popup_ads(is_active);
CREATE INDEX IF NOT EXISTS idx_popup_ads_dates ON popup_ads(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_popup_ads_created_at ON popup_ads(created_at DESC);

-- Add table comment
COMMENT ON TABLE popup_ads IS 'Popup advertisements displayed on the customer-facing site';

-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE popup_ads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can view all popup ads" ON popup_ads;
DROP POLICY IF EXISTS "Admins can create popup ads" ON popup_ads;
DROP POLICY IF EXISTS "Admins can update popup ads" ON popup_ads;
DROP POLICY IF EXISTS "Admins can delete popup ads" ON popup_ads;
DROP POLICY IF EXISTS "Public can view active popup ads" ON popup_ads;

-- Admin policies (full access)
CREATE POLICY "Admins can view all popup ads"
  ON popup_ads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can create popup ads"
  ON popup_ads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update popup ads"
  ON popup_ads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete popup ads"
  ON popup_ads FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Public policy (customers can view active ads)
CREATE POLICY "Public can view active popup ads"
  ON popup_ads FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- =====================================================
-- 3. CREATE RPC FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Function to increment impression count
CREATE OR REPLACE FUNCTION increment_popup_impression(popup_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE popup_ads
  SET impressions = impressions + 1
  WHERE id = popup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_popup_click(popup_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE popup_ads
  SET clicks = clicks + 1
  WHERE id = popup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_popup_impression(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_popup_click(UUID) TO anon, authenticated;

-- =====================================================
-- 4. STORAGE BUCKET SETUP (Run separately if needed)
-- =====================================================
-- Note: Storage buckets need to be created in Supabase Dashboard
-- or using the storage API. Here's the configuration:

-- Bucket name: 'popup-ads' (inside 'products' bucket)
-- Public: true (so images can be displayed)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- Storage RLS Policies (if using separate bucket):
-- CREATE POLICY "Anyone can view popup ad images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'popup-ads');

-- CREATE POLICY "Admins can upload popup ad images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'popup-ads' AND
--     auth.role() = 'authenticated' AND
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role IN ('admin', 'super_admin')
--     )
--   );

-- CREATE POLICY "Admins can delete popup ad images"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'popup-ads' AND
--     auth.role() = 'authenticated' AND
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role IN ('admin', 'super_admin')
--     )
--   );

-- =====================================================
-- 5. SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to insert sample popup ads

/*
INSERT INTO popup_ads (
  title,
  images,
  link_url,
  link_type,
  display_frequency,
  delay_seconds,
  show_on_pages,
  target_audience,
  is_active
) VALUES
(
  'Welcome Sale - 20% Off!',
  ARRAY['https://example.com/welcome-popup.jpg'],
  '/products',
  'external',
  'once_per_session',
  3,
  ARRAY['home'],
  'new_users',
  true
),
(
  'Free Shipping on Orders Over $50',
  ARRAY['https://example.com/shipping-popup.jpg'],
  NULL,
  'none',
  'once_per_day',
  5,
  ARRAY['home', 'products'],
  'all',
  true
);
*/

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ POPUP ADS SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  ✅ popup_ads table';
  RAISE NOTICE '  ✅ RLS policies (admin + public)';
  RAISE NOTICE '  ✅ Analytics functions (impression/click tracking)';
  RAISE NOTICE '  ✅ Indexes for performance';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. ✅ Table is ready - your PopupAdService.js will work!';
  RAISE NOTICE '  2. 📁 Images will be stored in "products" bucket under "popup-ads/" folder';
  RAISE NOTICE '  3. 🎨 Use admin panel to create your first popup ad';
  RAISE NOTICE '  4. 🧪 Test on customer site (should appear based on settings)';
  RAISE NOTICE '';
  RAISE NOTICE 'To verify setup:';
  RAISE NOTICE '  SELECT * FROM popup_ads;';
  RAISE NOTICE '========================================';
END $$;
