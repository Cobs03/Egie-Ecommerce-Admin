-- Add contact and social media fields to website_settings table
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

-- Update the default row if it exists
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
