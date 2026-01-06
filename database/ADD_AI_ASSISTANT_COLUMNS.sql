-- Add AI Assistant branding columns to website_settings table
-- This allows admins to customize the AI assistant name and logo

-- Add ai_name column
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS ai_name TEXT DEFAULT 'AI Assistant';

-- Add ai_logo_url column
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS ai_logo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN website_settings.ai_name IS 'Custom name for the AI shopping assistant displayed in the chat interface';
COMMENT ON COLUMN website_settings.ai_logo_url IS 'URL to the custom logo/avatar for the AI shopping assistant';

-- Update existing row to set default AI name if none exists
UPDATE website_settings 
SET ai_name = 'AI Shopping Assistant'
WHERE id = 1 AND (ai_name IS NULL OR ai_name = '');

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'website_settings' 
AND column_name IN ('ai_name', 'ai_logo_url');
