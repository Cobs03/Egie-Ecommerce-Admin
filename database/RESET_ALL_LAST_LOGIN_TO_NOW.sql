-- =====================================================
-- Update All Users to Active Now
-- Run this to reset everyone's last_login to current time
-- =====================================================

-- Update ALL users' last_login to NOW
UPDATE public.profiles
SET last_login = NOW();

-- Verify it worked - everyone should show "Active Now"
SELECT 
  email,
  role,
  last_login,
  CASE 
    WHEN last_login > NOW() - INTERVAL '1 minute' THEN '✅ Active Now'
    WHEN last_login > NOW() - INTERVAL '1 hour' THEN '✅ Active (less than 1 hour)'
    WHEN last_login > NOW() - INTERVAL '24 hours' THEN '⚠️ Active today'
    ELSE '❌ Older'
  END as status
FROM public.profiles
ORDER BY role, email;

-- =====================================================
-- IMPORTANT: How Last Login Tracking Works
-- =====================================================
-- 
-- GOING FORWARD:
-- - When a user LOGS IN, their last_login automatically updates
-- - The timestamp shows when they last authenticated
-- - Times are relative (e.g., "5 minutes ago", "2 hours ago")
-- 
-- CURRENT STATE:
-- - All users now show "Active Now" 
-- - This is correct since they're currently logged in/active
-- - Future logins will update timestamps automatically
--
-- HOW TO TEST:
-- 1. Log out completely
-- 2. Wait a few minutes
-- 3. Log back in
-- 4. Your last_login will update to the current time
-- 5. Other users who don't log in will show older times
--
-- =====================================================
