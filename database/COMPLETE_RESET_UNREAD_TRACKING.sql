-- COMPLETE RESET AND FIX FOR UNREAD TRACKING
-- Run this entire script to fix everything

-- Step 1: Drop existing trigger and view
DROP TRIGGER IF EXISTS set_reply_read_status ON inquiry_replies;
DROP VIEW IF EXISTS inquiry_unread_counts;

-- Step 2: Ensure columns exist
ALTER TABLE inquiry_replies 
ADD COLUMN IF NOT EXISTS read_by_staff BOOLEAN DEFAULT false;

ALTER TABLE inquiry_replies 
ADD COLUMN IF NOT EXISTS read_by_customer BOOLEAN DEFAULT false;

-- Step 3: Fix ALL existing data (set correct read status)
-- IMPORTANT: Customer replies should be UNREAD by staff
-- IMPORTANT: Staff replies should be UNREAD by customer
UPDATE inquiry_replies
SET 
  read_by_staff = (is_admin_reply = true),      -- TRUE if staff wrote (they already read their own), FALSE if customer wrote (staff hasn't read)
  read_by_customer = (is_admin_reply = false);  -- TRUE if customer wrote (they already read their own), FALSE if staff wrote (customer hasn't read)

-- Step 4: Create CORRECT trigger function
-- This triggers when NEW replies are inserted
CREATE OR REPLACE FUNCTION mark_own_reply_as_read()
RETURNS TRIGGER AS $$
BEGIN
  -- Staff writing a reply
  IF NEW.is_admin_reply = true THEN
    NEW.read_by_staff = true;      -- Staff wrote it = staff already read
    NEW.read_by_customer = false;  -- Customer hasn't read staff reply yet
  -- Customer writing a reply
  ELSE
    NEW.read_by_staff = false;     -- Customer wrote it = staff hasn't read it yet
    NEW.read_by_customer = true;   -- Customer wrote it = customer already read
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Recreate trigger
CREATE TRIGGER set_reply_read_status
  BEFORE INSERT ON inquiry_replies
  FOR EACH ROW
  EXECUTE FUNCTION mark_own_reply_as_read();

-- Step 6: Recreate view
CREATE OR REPLACE VIEW inquiry_unread_counts AS
SELECT 
  ir.inquiry_id,
  COUNT(*) FILTER (WHERE ir.is_admin_reply = false AND ir.read_by_staff = false) as unread_by_staff,
  COUNT(*) FILTER (WHERE ir.is_admin_reply = true AND ir.read_by_customer = false) as unread_by_customer
FROM inquiry_replies ir
GROUP BY ir.inquiry_id;

-- Step 7: Grant permissions
GRANT SELECT ON inquiry_unread_counts TO authenticated;

-- Step 8: Verify the fix works
SELECT 
  'Customer replies that staff needs to read' as description,
  COUNT(*) as count
FROM inquiry_replies
WHERE is_admin_reply = false AND read_by_staff = false

UNION ALL

SELECT 
  'Staff replies that customer needs to read' as description,
  COUNT(*) as count
FROM inquiry_replies
WHERE is_admin_reply = true AND read_by_customer = false

UNION ALL

SELECT 
  'Total inquiries with unread staff counts' as description,
  COUNT(*) as count
FROM inquiry_unread_counts
WHERE unread_by_staff > 0

UNION ALL

SELECT 
  'Total inquiries with unread customer counts' as description,
  COUNT(*) as count
FROM inquiry_unread_counts
WHERE unread_by_customer > 0;

-- Step 9: Check specific inquiry
SELECT 
  pi.id,
  pi.subject,
  pi.status,
  COALESCE(uc.unread_by_staff, 0) as unread_by_staff,
  COALESCE(uc.unread_by_customer, 0) as unread_by_customer
FROM product_inquiries pi
LEFT JOIN inquiry_unread_counts uc ON pi.id = uc.inquiry_id
WHERE pi.id = '6a39738b-5ad0-480f-ace3-39de47a4d134';

-- Step 10: Show actual replies for that inquiry
SELECT 
  id,
  SUBSTRING(reply_text, 1, 40) as preview,
  is_admin_reply,
  read_by_staff,
  read_by_customer,
  created_at
FROM inquiry_replies
WHERE inquiry_id = '6a39738b-5ad0-480f-ace3-39de47a4d134'
ORDER BY created_at;
