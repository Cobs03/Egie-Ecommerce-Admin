-- ============================================
-- FIX: Ensure User Has Customer Role
-- ============================================
-- This checks and fixes user roles

-- 1. Check your user's role
-- Replace with your actual email
SELECT 
  id,
  email,
  role,
  full_name
FROM profiles
WHERE email = 'YOUR-EMAIL-HERE@example.com';

-- 2. If role is NULL or not 'customer', update it:
-- Replace with your actual user ID
UPDATE profiles
SET role = 'customer'
WHERE id = 'YOUR-USER-ID-HERE'
AND (role IS NULL OR role != 'customer');

-- 3. Check all users and their roles
SELECT 
  id,
  email,
  role,
  full_name,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 20;

-- 4. Manually test creating a notification for yourself
-- Replace YOUR-USER-ID with actual customer user ID
INSERT INTO user_notifications (
  user_id,
  notification_type,
  category,
  title,
  message,
  action_type,
  action_data
) VALUES (
  'YOUR-USER-ID'::uuid,
  'voucher',
  'promotion',
  'Test Voucher',
  'Use code TEST123 for 10% off',
  'copy_code',
  '{"code": "TEST123", "discount": "10%"}'::jsonb
);

-- 5. Then try fetching it
SELECT * FROM get_user_notifications(
  'YOUR-USER-ID'::uuid,
  'promotion',
  NULL,
  50
);
