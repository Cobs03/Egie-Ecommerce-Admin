-- ============================================
-- DEBUG NOTIFICATION SYSTEM
-- ============================================
-- Run these queries to diagnose why promotions aren't showing

-- 1. Check if promotion notifications exist
SELECT 
  id, 
  user_id, 
  notification_type,
  category, 
  title, 
  message, 
  voucher_id, 
  discount_id,
  action_type,
  action_data,
  is_read,
  created_at
FROM user_notifications 
WHERE category = 'promotion'
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check customer count
SELECT COUNT(*) as customer_count
FROM profiles
WHERE role = 'customer';

-- 3. Check if specific user has notifications
-- Replace 'YOUR-USER-ID' with actual user ID from auth
SELECT 
  id, 
  notification_type,
  category, 
  title, 
  message,
  is_read,
  created_at
FROM user_notifications 
WHERE user_id = 'YOUR-USER-ID'
ORDER BY created_at DESC;

-- 4. Check RLS policies on user_notifications
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_notifications';

-- 5. Test the RPC function directly
-- Replace 'YOUR-USER-ID' with actual user ID
SELECT * FROM get_user_notifications(
  'YOUR-USER-ID'::uuid,
  'promotion',
  NULL,
  50
);

-- 6. Check if there are ANY notifications
SELECT 
  category,
  COUNT(*) as count,
  COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count
FROM user_notifications
GROUP BY category;
