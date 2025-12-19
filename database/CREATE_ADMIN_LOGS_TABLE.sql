-- ==========================================
-- 📊 ADMIN ACTIVITY LOGS TABLE
-- ==========================================
-- This table tracks all actions performed by admin users
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type character varying NOT NULL,
  action_description text NOT NULL,
  target_type character varying,
  target_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_logs_pkey PRIMARY KEY (id),
  CONSTRAINT admin_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_user_id ON public.admin_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at DESC);

-- Add comment
COMMENT ON TABLE public.admin_logs IS 'Tracks all administrative actions performed by users';

-- Example action_types:
-- 'product_create', 'product_update', 'product_delete'
-- 'bundle_create', 'bundle_update', 'bundle_delete'
-- 'user_create', 'user_update', 'user_delete', 'user_promote', 'user_demote'
-- 'order_update', 'order_cancel'
-- 'discount_create', 'discount_update'
-- etc.
