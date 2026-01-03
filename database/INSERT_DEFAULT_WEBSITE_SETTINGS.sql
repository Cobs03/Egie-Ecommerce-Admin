-- Insert the default website settings row
-- Run this after creating the table

INSERT INTO website_settings (
  id,
  brand_name,
  contact_email,
  contact_phone,
  contact_address,
  showroom_hours,
  facebook_url,
  instagram_url,
  about_us_title,
  about_us_content,
  footer_text
) VALUES (
  1,
  'EGIE Gameshop',
  'support@egiegameshop.com',
  '(123) 456-7890',
  '1234 Street Address City Address, 1234',
  'Mon-Sunday: 8:00 AM - 5:30 PM',
  'https://facebook.com',
  'https://instagram.com',
  'About Us',
  'Welcome to our gaming store! We provide the best PC gaming hardware and accessories.',
  'All rights reserved.'
)
ON CONFLICT (id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  contact_address = EXCLUDED.contact_address,
  showroom_hours = EXCLUDED.showroom_hours,
  facebook_url = EXCLUDED.facebook_url,
  instagram_url = EXCLUDED.instagram_url,
  about_us_title = EXCLUDED.about_us_title,
  about_us_content = EXCLUDED.about_us_content,
  footer_text = EXCLUDED.footer_text;

-- Verify the insert
SELECT * FROM website_settings WHERE id = 1;
