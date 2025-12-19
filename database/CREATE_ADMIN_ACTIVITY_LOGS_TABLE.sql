-- ==========================================
-- 📊 ADMIN ACTIVITY LOGS TABLE (Detailed Version)
-- ==========================================
-- This table tracks specific admin actions with detailed metadata
-- Specifically designed for review deletions and other detailed logging
-- Run this in your Supabase SQL Editor

-- Create the admin_activity_logs table
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action character varying(50) NOT NULL,
  entity_type character varying(50) NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT admin_activity_logs_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_user_id 
  ON public.admin_activity_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at 
  ON public.admin_activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action 
  ON public.admin_activity_logs(action);

CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_entity_type 
  ON public.admin_activity_logs(entity_type);

-- Enable Row Level Security
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can insert their own logs
CREATE POLICY "Admin users can insert activity logs" 
  ON public.admin_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admin users can view all logs
CREATE POLICY "Admin users can view all activity logs" 
  ON public.admin_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'employee')
    )
  );

-- Add helpful comment
COMMENT ON TABLE public.admin_activity_logs IS 'Detailed activity logging for admin actions with full context';

-- ==========================================
-- 📝 EXAMPLE USAGE
-- ==========================================
-- Sample log entry for review deletion:
-- {
--   "user_id": "user-uuid",
--   "action": "DELETE",
--   "entity_type": "review",
--   "entity_id": "review-uuid",
--   "details": {
--     "review_title": "Great product!",
--     "review_comment": "I love this product...",
--     "review_rating": 5,
--     "product_name": "Intel Core i7",
--     "customer_name": "MJ Tuplano",
--     "deleted_by": "Admin Name",
--     "deleted_by_role": "admin"
--   }
-- }

-- ==========================================
-- 🔍 USEFUL QUERIES
-- ==========================================

-- View all review deletions
-- SELECT 
--   al.*,
--   p.first_name || ' ' || p.last_name as actor_name,
--   p.role as actor_role
-- FROM admin_activity_logs al
-- JOIN profiles p ON p.id = al.user_id
-- WHERE al.entity_type = 'review'
--   AND al.action = 'DELETE'
-- ORDER BY al.created_at DESC;

-- View activity by specific user
-- SELECT * FROM admin_activity_logs
-- WHERE user_id = 'user-uuid-here'
-- ORDER BY created_at DESC;

-- View activity in last 7 days
-- SELECT * FROM admin_activity_logs
-- WHERE created_at > NOW() - INTERVAL '7 days'
-- ORDER BY created_at DESC;
