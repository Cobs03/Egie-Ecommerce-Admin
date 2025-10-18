-- =====================================================
-- COMPLETE FIX - Run this entire script at once
-- Copy and paste ALL of this into Supabase SQL Editor
-- =====================================================

-- Step 1: Add last_login column if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Step 2: Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_login 
ON public.profiles(last_login DESC);

-- Step 3: Drop old function if exists (all possible signatures)
DROP FUNCTION IF EXISTS public.update_user_last_login(UUID);
DROP FUNCTION IF EXISTS public.update_user_last_login;

-- Step 4: Create the RPC function
CREATE OR REPLACE FUNCTION public.update_user_last_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET last_login = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION public.update_user_last_login(UUID) TO authenticated;

-- Step 6: Set last_login to created_at for all NULL values
UPDATE public.profiles
SET last_login = created_at
WHERE last_login IS NULL;

-- Step 7: Update YOUR last_login to NOW
UPDATE public.profiles
SET last_login = NOW()
WHERE id = auth.uid();

-- Step 8: Verify it worked
SELECT 
  email,
  role,
  last_login,
  created_at,
  CASE 
    WHEN last_login IS NULL THEN 'NULL - ERROR'
    WHEN last_login > NOW() - INTERVAL '1 minute' THEN 'Active Now'
    WHEN last_login > NOW() - INTERVAL '1 hour' THEN 'Active (less than 1 hour)'
    WHEN last_login > NOW() - INTERVAL '24 hours' THEN 'Active today'
    ELSE 'Older'
  END as status
FROM public.profiles
ORDER BY last_login DESC NULLS LAST
LIMIT 10;

-- =====================================================
-- Expected Output:
-- You should see all users with last_login timestamps
-- Your user should show "Active Now"
-- No NULL values should appear
-- =====================================================
