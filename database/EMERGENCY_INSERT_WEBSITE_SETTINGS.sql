-- =====================================================
-- EMERGENCY FIX - Website Settings
-- Run this if nothing else worked
-- =====================================================

-- Delete any existing row (start fresh)
DELETE FROM website_settings WHERE id = 1;

-- Insert fresh row with ALL fields
INSERT INTO website_settings (
  id,
  brand_name,
  logo_url,
  primary_color,
  secondary_color,
  accent_color,
  contact_email,
  contact_phone,
  contact_address,
  showroom_hours,
  facebook_url,
  instagram_url,
  tiktok_url,
  twitter_url,
  about_us_title,
  about_us_content,
  footer_text,
  created_at,
  updated_at
) VALUES (
  1,
  'NameLess Dev',
  'https://mhhnfftaoihhltbknenq.supabase.co/storage/v1/object/public/products/logos/nameless-logo.png',
  '#22c55e',
  '#2176ae',
  '#ffe14d',
  'egiegameshop2025@gmail.com',
  '+639151855519',
  '1234 Street Address City Address, 1234',
  'Mon-Sunday: 8:00 AM - 5:00 PM',
  'https://facebook.com',
  'https://instagram.com',
  '',
  '',
  'About Us',
  'Welcome to our gaming store! We provide the best PC gaming hardware and accessories.',
  'All rights reserved.',
  NOW(),
  NOW()
);

-- Verify it worked
SELECT 'Row inserted successfully!' AS status;
SELECT * FROM website_settings WHERE id = 1;
