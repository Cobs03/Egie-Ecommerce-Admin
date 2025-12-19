-- CORRECT Fix for unread tracking
-- The logic was backwards!

UPDATE inquiry_replies
SET read_by_staff = CASE 
  WHEN is_admin_reply = false THEN false  -- Customer wrote it = staff needs to read = unread by staff
  ELSE true                                -- Staff wrote it = staff already read it (they wrote it)
END,
read_by_customer = CASE
  WHEN is_admin_reply = true THEN false   -- Staff wrote it = customer needs to read = unread by customer  
  ELSE true                                -- Customer wrote it = customer already read it (they wrote it)
END;

-- Verify the fix
SELECT 
  COUNT(*) FILTER (WHERE is_admin_reply = false AND read_by_staff = false) as customer_replies_unread_by_staff,
  COUNT(*) FILTER (WHERE is_admin_reply = true AND read_by_customer = false) as staff_replies_unread_by_customer,
  COUNT(*) FILTER (WHERE is_admin_reply = false AND read_by_staff = true) as customer_replies_already_read,
  COUNT(*) FILTER (WHERE is_admin_reply = true AND read_by_customer = true) as staff_replies_already_read
FROM inquiry_replies;
