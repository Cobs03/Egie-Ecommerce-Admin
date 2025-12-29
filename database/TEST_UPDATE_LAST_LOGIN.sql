-- =====================================================
-- TEST LAST_LOGIN UPDATE
-- =====================================================
-- Run this to manually update last_login for testing

-- First, let's see current state of profiles
SELECT 
    id,
    email,
    full_name,
    last_login,
    phone_number,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- TEST: Manually update last_login for a specific user
-- =====================================================
-- Replace YOUR_USER_ID with your actual user ID from above query
-- Example: UPDATE public.profiles SET last_login = NOW() WHERE id = '7ebb4d00-fc6e-48d0-9a84-7178f2a34877';

-- UPDATE public.profiles 
-- SET last_login = NOW() 
-- WHERE id = 'YOUR_USER_ID';

-- =====================================================
-- TEST: Call the RPC function
-- =====================================================
-- Replace YOUR_USER_ID with your actual user ID
-- Example: SELECT update_user_last_login('7ebb4d00-fc6e-48d0-9a84-7178f2a34877');

-- SELECT update_user_last_login('YOUR_USER_ID');

-- =====================================================
-- Verify the update worked
-- =====================================================
-- SELECT 
--     id,
--     email,
--     last_login,
--     last_login > NOW() - INTERVAL '1 minute' as updated_just_now
-- FROM public.profiles
-- WHERE id = 'YOUR_USER_ID';
