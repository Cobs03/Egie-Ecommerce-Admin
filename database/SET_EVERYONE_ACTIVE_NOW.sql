-- =====================================================
-- Set Everyone Active Now (For Initial Testing)
-- Run this once to set all users to current time
-- =====================================================

-- Update ALL users to show as "Active Now"
UPDATE public.profiles
SET last_login = NOW()
WHERE role IN ('admin', 'manager', 'employee');

-- Verify the update
SELECT 
  email,
  role,
  last_login,
  AGE(NOW(), last_login) as time_ago,
  CASE 
    WHEN last_login > NOW() - INTERVAL '1 minute' THEN '🟢 Active Now'
    WHEN last_login > NOW() - INTERVAL '10 minutes' THEN '🟢 Active (< 10 min)'
    WHEN last_login > NOW() - INTERVAL '1 hour' THEN '🟡 Active (< 1 hour)'
    ELSE '⚫ Older'
  END as display_status
FROM public.profiles
WHERE role IN ('admin', 'manager', 'employee')
ORDER BY last_login DESC;

-- =====================================================
-- What Happens Next:
-- =====================================================
-- 
-- 1. All users now show "Active Now" 🟢
-- 2. Activity tracker updates every 5 minutes automatically
-- 3. After 5 minutes, still shows "5 minutes ago" 🟢
-- 4. After 1 hour, shows "1 hour ago" 🟡
-- 5. Users who log in get updated to NOW automatically
-- 6. Users who don't log in show older times
--
-- =====================================================
