-- ==========================================
-- 💬 PRODUCT INQUIRIES SYSTEM
-- ==========================================
-- Allows customers to ask questions about products
-- Admins, managers, and employees can reply
-- Run this in your Supabase SQL Editor

-- ==========================================
-- 📊 CREATE INQUIRIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.product_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid NOT NULL,
  subject character varying(255) NOT NULL,
  question text NOT NULL,
  status character varying(50) DEFAULT 'pending',
  priority character varying(20) DEFAULT 'normal',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_inquiries_pkey PRIMARY KEY (id),
  CONSTRAINT product_inquiries_product_id_fkey FOREIGN KEY (product_id) 
    REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT product_inquiries_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- ==========================================
-- 📊 CREATE INQUIRY REPLIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.inquiry_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reply_text text NOT NULL,
  is_admin_reply boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inquiry_replies_pkey PRIMARY KEY (id),
  CONSTRAINT inquiry_replies_inquiry_id_fkey FOREIGN KEY (inquiry_id) 
    REFERENCES public.product_inquiries(id) ON DELETE CASCADE,
  CONSTRAINT inquiry_replies_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- ==========================================
-- 📇 CREATE INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_product_inquiries_product_id 
  ON public.product_inquiries(product_id);

CREATE INDEX IF NOT EXISTS idx_product_inquiries_user_id 
  ON public.product_inquiries(user_id);

CREATE INDEX IF NOT EXISTS idx_product_inquiries_status 
  ON public.product_inquiries(status);

CREATE INDEX IF NOT EXISTS idx_product_inquiries_created_at 
  ON public.product_inquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inquiry_replies_inquiry_id 
  ON public.inquiry_replies(inquiry_id);

CREATE INDEX IF NOT EXISTS idx_inquiry_replies_user_id 
  ON public.inquiry_replies(user_id);

CREATE INDEX IF NOT EXISTS idx_inquiry_replies_created_at 
  ON public.inquiry_replies(created_at);

-- ==========================================
-- 🔐 ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE public.product_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_replies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own inquiries
CREATE POLICY "Users can view their own inquiries" 
  ON public.product_inquiries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admin/Manager/Employee can view all inquiries
CREATE POLICY "Admin can view all inquiries" 
  ON public.product_inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'employee')
    )
  );

-- Policy: Authenticated users can create inquiries
CREATE POLICY "Authenticated users can create inquiries" 
  ON public.product_inquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admin can update inquiry status
CREATE POLICY "Admin can update inquiries" 
  ON public.product_inquiries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'employee')
    )
  );

-- Policy: Users can view replies to their inquiries
CREATE POLICY "Users can view replies to their inquiries" 
  ON public.inquiry_replies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.product_inquiries
      WHERE product_inquiries.id = inquiry_replies.inquiry_id
      AND product_inquiries.user_id = auth.uid()
    )
  );

-- Policy: Admin can view all replies
CREATE POLICY "Admin can view all replies" 
  ON public.inquiry_replies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'employee')
    )
  );

-- Policy: Admin and inquiry owners can create replies
CREATE POLICY "Users can create replies" 
  ON public.inquiry_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND (
      -- User can reply to their own inquiry
      EXISTS (
        SELECT 1 FROM public.product_inquiries
        WHERE product_inquiries.id = inquiry_replies.inquiry_id
        AND product_inquiries.user_id = auth.uid()
      )
      OR
      -- Admin/Manager/Employee can reply to any inquiry
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager', 'employee')
      )
    )
  );

-- ==========================================
-- 🔄 TRIGGER: Update updated_at timestamp
-- ==========================================
CREATE OR REPLACE FUNCTION update_inquiry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_inquiries_updated_at
  BEFORE UPDATE ON public.product_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiry_updated_at();

-- ==========================================
-- 🔄 TRIGGER: Auto-update inquiry status when replied
-- ==========================================
CREATE OR REPLACE FUNCTION update_inquiry_status_on_reply()
RETURNS TRIGGER AS $$
BEGIN
  -- If admin/manager/employee replied, mark as 'answered'
  IF NEW.is_admin_reply = true THEN
    UPDATE public.product_inquiries
    SET status = 'answered', updated_at = NOW()
    WHERE id = NEW.inquiry_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_inquiry_status
  AFTER INSERT ON public.inquiry_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiry_status_on_reply();

-- ==========================================
-- 💬 ADD COMMENTS
-- ==========================================
COMMENT ON TABLE public.product_inquiries IS 'Customer questions about products';
COMMENT ON TABLE public.inquiry_replies IS 'Replies to customer inquiries';

COMMENT ON COLUMN public.product_inquiries.status IS 
  'Status: pending, answered, closed, flagged';
COMMENT ON COLUMN public.product_inquiries.priority IS 
  'Priority: low, normal, high, urgent';
COMMENT ON COLUMN public.inquiry_replies.is_admin_reply IS 
  'True if reply is from admin/manager/employee';

-- ==========================================
-- 📝 EXAMPLE USAGE
-- ==========================================
-- Insert new inquiry:
-- INSERT INTO product_inquiries (product_id, user_id, subject, question)
-- VALUES ('product-uuid', 'user-uuid', 'Compatibility Question', 'Will this work with my motherboard?');

-- Insert admin reply:
-- INSERT INTO inquiry_replies (inquiry_id, user_id, reply_text, is_admin_reply)
-- VALUES ('inquiry-uuid', 'admin-uuid', 'Yes, it is compatible with...', true);

-- ==========================================
-- 🔍 USEFUL QUERIES
-- ==========================================

-- View all pending inquiries with product and customer details:
-- SELECT 
--   i.*,
--   p.name as product_name,
--   p.images as product_images,
--   u.first_name || ' ' || u.last_name as customer_name,
--   u.email as customer_email,
--   u.avatar_url as customer_avatar,
--   (SELECT COUNT(*) FROM inquiry_replies WHERE inquiry_id = i.id) as reply_count
-- FROM product_inquiries i
-- JOIN products p ON p.id = i.product_id
-- JOIN profiles u ON u.id = i.user_id
-- WHERE i.status = 'pending'
-- ORDER BY i.created_at DESC;

-- View inquiry with all replies:
-- SELECT 
--   i.*,
--   p.name as product_name,
--   json_agg(
--     json_build_object(
--       'id', r.id,
--       'reply_text', r.reply_text,
--       'is_admin_reply', r.is_admin_reply,
--       'created_at', r.created_at,
--       'user_name', u.first_name || ' ' || u.last_name,
--       'user_avatar', u.avatar_url,
--       'user_role', u.role
--     ) ORDER BY r.created_at
--   ) as replies
-- FROM product_inquiries i
-- JOIN products p ON p.id = i.product_id
-- LEFT JOIN inquiry_replies r ON r.inquiry_id = i.id
-- LEFT JOIN profiles u ON u.id = r.user_id
-- WHERE i.id = 'inquiry-uuid'
-- GROUP BY i.id, p.name;

-- Get inquiry statistics:
-- SELECT 
--   COUNT(*) FILTER (WHERE status = 'pending') as pending,
--   COUNT(*) FILTER (WHERE status = 'answered') as answered,
--   COUNT(*) FILTER (WHERE status = 'closed') as closed,
--   COUNT(*) as total,
--   AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_response_hours
-- FROM product_inquiries;
