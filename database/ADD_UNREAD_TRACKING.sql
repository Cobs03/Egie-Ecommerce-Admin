-- Add read tracking columns to inquiry_replies table
-- This tracks whether staff (admin/manager/employee) or customer has read each reply

-- Add column to track if staff (admin/manager/employee) has read the reply
ALTER TABLE inquiry_replies 
ADD COLUMN IF NOT EXISTS read_by_staff BOOLEAN DEFAULT false;

-- Add column to track if customer has read the reply
ALTER TABLE inquiry_replies 
ADD COLUMN IF NOT EXISTS read_by_customer BOOLEAN DEFAULT false;

-- Auto-mark staff replies as read by staff (they wrote it)
-- Auto-mark customer replies as read by customer (they wrote it)
CREATE OR REPLACE FUNCTION mark_own_reply_as_read()
RETURNS TRIGGER AS $$
BEGIN
  -- If it's a staff reply (admin/manager/employee), mark as read by staff
  IF NEW.is_admin_reply = true THEN
    NEW.read_by_staff = true;
    NEW.read_by_customer = false;
  ELSE
    -- If it's a customer reply, mark as read by customer
    NEW.read_by_staff = false;
    NEW.read_by_customer = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_reply_read_status ON inquiry_replies;
CREATE TRIGGER set_reply_read_status
  BEFORE INSERT ON inquiry_replies
  FOR EACH ROW
  EXECUTE FUNCTION mark_own_reply_as_read();

-- Update existing replies to set correct read status
UPDATE inquiry_replies
SET read_by_staff = CASE 
  WHEN is_admin_reply = true THEN true
  ELSE false
END,
read_by_customer = CASE
  WHEN is_admin_reply = false THEN true
  ELSE false
END;

-- Create view for unread counts per inquiry (helpful for queries)
CREATE OR REPLACE VIEW inquiry_unread_counts AS
SELECT 
  ir.inquiry_id,
  COUNT(*) FILTER (WHERE ir.is_admin_reply = false AND ir.read_by_staff = false) as unread_by_staff,
  COUNT(*) FILTER (WHERE ir.is_admin_reply = true AND ir.read_by_customer = false) as unread_by_customer
FROM inquiry_replies ir
GROUP BY ir.inquiry_id;

-- Grant permissions
GRANT SELECT ON inquiry_unread_counts TO authenticated;

COMMENT ON COLUMN inquiry_replies.read_by_staff IS 'Tracks if staff (admin/manager/employee) has read this reply (for customer replies)';
COMMENT ON COLUMN inquiry_replies.read_by_customer IS 'Tracks if customer has read this reply (for staff replies)';
COMMENT ON VIEW inquiry_unread_counts IS 'Shows unread reply counts per inquiry for both staff and customer';
