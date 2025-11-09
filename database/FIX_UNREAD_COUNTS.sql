-- Fix unread tracking - Reset all read status correctly
-- This ensures the counts are accurate

-- Step 1: Reset all read status based on who wrote the reply
UPDATE inquiry_replies
SET read_by_staff = CASE 
  WHEN is_admin_reply = true THEN true   -- Staff wrote it, mark as read by staff
  ELSE false                              -- Customer wrote it, not read by staff yet
END,
read_by_customer = CASE
  WHEN is_admin_reply = false THEN true  -- Customer wrote it, mark as read by customer
  ELSE false                              -- Staff wrote it, not read by customer yet
END;

-- Step 2: Verify the view is working
-- Run this query to check unread counts:
SELECT 
  pi.id as inquiry_id,
  pi.subject,
  pi.status,
  COALESCE(uc.unread_by_staff, 0) as unread_by_staff,
  COALESCE(uc.unread_by_customer, 0) as unread_by_customer
FROM product_inquiries pi
LEFT JOIN inquiry_unread_counts uc ON pi.id = uc.inquiry_id
ORDER BY pi.created_at DESC
LIMIT 10;

-- Step 3: Check individual replies
-- Run this to see each reply's read status:
SELECT 
  ir.id,
  ir.inquiry_id,
  ir.reply_text,
  ir.is_admin_reply,
  ir.read_by_staff,
  ir.read_by_customer,
  ir.created_at
FROM inquiry_replies ir
ORDER BY ir.created_at DESC
LIMIT 20;
