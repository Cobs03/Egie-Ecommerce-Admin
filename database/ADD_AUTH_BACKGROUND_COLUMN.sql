-- Add authentication background image column to website_settings table

ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS auth_background_url TEXT;

COMMENT ON COLUMN website_settings.auth_background_url IS 'URL for the background image displayed on admin authentication pages (sign-in, forgot password, reset password)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'website_settings' 
  AND column_name = 'auth_background_url';
