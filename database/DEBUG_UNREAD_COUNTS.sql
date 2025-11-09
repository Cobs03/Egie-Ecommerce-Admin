-- Debug query to check what's happening with the unread counts
-- Run this in Supabase SQL Editor

-- Step 1: Check the actual replies for this inquiry
SELECT 
  ir.id,
  ir.inquiry_id,
  SUBSTRING(ir.reply_text, 1, 50) as reply_preview,
  ir.is_admin_reply,
  ir.read_by_staff,
  ir.read_by_customer,
  ir.created_at
FROM inquiry_replies ir
WHERE ir.inquiry_id = '6a39738b-5ad0-480f-ace3-39de47a4d134'
ORDER BY ir.created_at;

-- Step 2: Check what the view returns
SELECT * FROM inquiry_unread_counts 
WHERE inquiry_id = '6a39738b-5ad0-480f-ace3-39de47a4d134';

-- Step 3: Manual count to verify
SELECT 
  inquiry_id,
  COUNT(*) FILTER (WHERE is_admin_reply = false AND read_by_staff = false) as manual_unread_by_staff,
  COUNT(*) FILTER (WHERE is_admin_reply = true AND read_by_customer = false) as manual_unread_by_customer
FROM inquiry_replies
WHERE inquiry_id = '6a39738b-5ad0-480f-ace3-39de47a4d134'
GROUP BY inquiry_id;

-- Step 4: Check if there are customer replies that should be unread
SELECT 
  id,
  SUBSTRING(reply_text, 1, 50) as reply_preview,
  is_admin_reply,
  read_by_staff,
  'SHOULD BE UNREAD' as note
FROM inquiry_replies
WHERE inquiry_id = '6a39738b-5ad0-480f-ace3-39de47a4d134'
  AND is_admin_reply = false  -- Customer replies
  AND read_by_staff = true;   -- But marked as read (this is the problem!)
