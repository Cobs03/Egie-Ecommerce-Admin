-- =====================================================
-- ENSURE USER TRACKING COLUMNS EXIST
-- =====================================================
-- This ensures phone_number and last_login columns exist
-- and login tracking works properly

-- =====================================================
-- PART 1: Add phone_number column (if not exists)
-- =====================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add index for phone number searches
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number
ON public.profiles(phone_number);

-- =====================================================
-- PART 2: Add last_login column (if not exists)
-- =====================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Add index for last_login queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_login
ON public.profiles(last_login DESC);

-- =====================================================
-- PART 3: Create RPC function for last_login update
-- =====================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.update_user_last_login(UUID);
DROP FUNCTION IF EXISTS public.update_user_last_login;

-- Create function to update last_login timestamp
CREATE OR REPLACE FUNCTION public.update_user_last_login(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_login = NOW()
  WHERE id = user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_last_login(UUID) TO authenticated, anon;

-- =====================================================
-- PART 4: Verify columns exist
-- =====================================================

-- Check if columns exist (for verification)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('phone_number', 'last_login')
ORDER BY column_name;

-- =====================================================
-- NOTES
-- =====================================================
-- After running this:
-- 1. phone_number column will be available for users to fill in
-- 2. last_login will be tracked automatically on login
-- 3. Existing users will show "N/A" for phone and "Never" for last login
-- 4. After users log in, their last_login will be updated
-- 5. Users can update their phone number in their profile
