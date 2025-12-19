-- ============================================
-- CREATE NOTIFICATION SYSTEM
-- ============================================
-- This creates a comprehensive notification system for customers
-- Tracks order updates and promotional notifications

-- ============================================
-- STEP 1: CREATE NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notification categorization
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
    'order_placed', 
    'order_confirmed', 
    'order_processing',
    'order_shipped', 
    'order_ready_for_pickup',
    'order_delivered', 
    'order_cancelled',
    'promotion',
    'discount',
    'voucher',
    'system'
  )),
  
  -- Notification category for tabs
  category VARCHAR(20) NOT NULL CHECK (category IN ('order_update', 'promotion')),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Related data
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_number VARCHAR(50),
  voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
  discount_id UUID REFERENCES discounts(id) ON DELETE SET NULL,
  
  -- Product images for display (JSONB array)
  product_images JSONB DEFAULT '[]'::jsonb,
  
  -- Action button (optional)
  action_type VARCHAR(50), -- 'view_order', 'view_products', 'copy_code'
  action_data JSONB, -- Additional data for action
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for faster queries
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_category ON user_notifications(category);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_order_id ON user_notifications(order_id);

-- ============================================
-- STEP 2: ENABLE RLS
-- ============================================

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON user_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON user_notifications;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON user_notifications FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON user_notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
ON user_notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Policy: System can insert notifications (for triggers)
CREATE POLICY "System can insert notifications"
ON user_notifications FOR INSERT
WITH CHECK (true);

-- ============================================
-- STEP 3: CREATE TRIGGER FUNCTION FOR ORDER NOTIFICATIONS
-- ============================================

CREATE OR REPLACE FUNCTION create_order_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title TEXT;
  v_message TEXT;
  v_notification_type TEXT;
  v_product_images JSONB;
BEGIN
  -- Get ALL product images from order items (removed LIMIT)
  SELECT COALESCE(
    jsonb_agg(
      CASE 
        WHEN product_image IS NOT NULL THEN product_image
        ELSE NULL
      END
    ) FILTER (WHERE product_image IS NOT NULL),
    '[]'::jsonb
  )
  INTO v_product_images
  FROM order_items
  WHERE order_id = NEW.id;

  -- Determine notification type and content based on order status
  CASE NEW.status
    WHEN 'pending' THEN
      v_notification_type := 'order_placed';
      v_title := 'Order Placed';
      v_message := 'Your package (' || NEW.order_number || ') was submitted. Thanks for shopping with EGIE GameShop!';
    
    WHEN 'confirmed' THEN
      v_notification_type := 'order_confirmed';
      v_title := 'Order Confirmed';
      v_message := 'Your order (' || NEW.order_number || ') has been confirmed and is being prepared.';
    
    WHEN 'processing' THEN
      v_notification_type := 'order_processing';
      v_title := 'Order Processing';
      v_message := 'Your order (' || NEW.order_number || ') is being processed.';
    
    WHEN 'shipped' THEN
      v_notification_type := 'order_shipped';
      v_title := 'Order Shipped';
      v_message := 'Your package (' || NEW.order_number || ') was shipped and will be delivered by ' || 
                   COALESCE(NEW.courier_name, 'courier') || '. Thanks for shopping with EGIE GameShop!';
    
    WHEN 'ready_for_pickup' THEN
      v_notification_type := 'order_ready_for_pickup';
      v_title := 'Ready for Pickup';
      v_message := 'Your order (' || NEW.order_number || ') is ready for pickup at our store!';
    
    WHEN 'delivered' THEN
      v_notification_type := 'order_delivered';
      v_title := 'Package Delivered';
      v_message := 'Your package (' || NEW.order_number || ') has been delivered. Thanks for shopping with EGIE GameShop!';
    
    WHEN 'cancelled' THEN
      v_notification_type := 'order_cancelled';
      v_title := 'Order Cancelled';
      v_message := 'Your order (' || NEW.order_number || ') has been cancelled. ' || 
                   COALESCE('Reason: ' || NEW.order_notes, '');
    
    ELSE
      RETURN NEW; -- Don't create notification for other statuses
  END CASE;

  -- Insert notification only if status changed
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR TG_OP = 'INSERT' THEN
    INSERT INTO user_notifications (
      user_id,
      notification_type,
      category,
      title,
      message,
      order_id,
      order_number,
      product_images,
      action_type,
      action_data
    ) VALUES (
      NEW.user_id,
      v_notification_type,
      'order_update',
      v_title,
      v_message,
      NEW.id,
      NEW.order_number,
      v_product_images,
      'view_order',
      jsonb_build_object('order_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================
-- STEP 4: CREATE TRIGGER FOR ORDER NOTIFICATIONS
-- ============================================

DROP TRIGGER IF EXISTS trigger_order_notification ON orders;

CREATE TRIGGER trigger_order_notification
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION create_order_notification();

-- ============================================
-- STEP 5: CREATE FUNCTION TO SEND PROMOTION NOTIFICATIONS
-- ============================================

CREATE OR REPLACE FUNCTION create_promotion_notification(
  p_title TEXT,
  p_message TEXT,
  p_voucher_id UUID DEFAULT NULL,
  p_discount_id UUID DEFAULT NULL,
  p_action_type TEXT DEFAULT NULL,
  p_action_data JSONB DEFAULT NULL,
  p_target_users TEXT DEFAULT 'all' -- 'all', 'new', 'existing', specific user_ids array
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER := 0;
  v_notification_type TEXT;
BEGIN
  -- Determine notification type
  IF p_voucher_id IS NOT NULL THEN
    v_notification_type := 'voucher';
  ELSIF p_discount_id IS NOT NULL THEN
    v_notification_type := 'discount';
  ELSE
    v_notification_type := 'promotion';
  END IF;

  -- Insert notifications for target users
  IF p_target_users = 'all' THEN
    -- Send to all customers
    INSERT INTO user_notifications (
      user_id,
      notification_type,
      category,
      title,
      message,
      voucher_id,
      discount_id,
      action_type,
      action_data
    )
    SELECT 
      id,
      v_notification_type,
      'promotion',
      p_title,
      p_message,
      p_voucher_id,
      p_discount_id,
      p_action_type,
      p_action_data
    FROM profiles
    WHERE role = 'customer';
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
  ELSIF p_target_users = 'new' THEN
    -- Send to new users (registered in last 30 days)
    INSERT INTO user_notifications (
      user_id,
      notification_type,
      category,
      title,
      message,
      voucher_id,
      discount_id,
      action_type,
      action_data
    )
    SELECT 
      id,
      v_notification_type,
      'promotion',
      p_title,
      p_message,
      p_voucher_id,
      p_discount_id,
      p_action_type,
      p_action_data
    FROM profiles
    WHERE role = 'customer'
    AND created_at >= NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
  ELSIF p_target_users = 'existing' THEN
    -- Send to existing users (have placed orders before)
    INSERT INTO user_notifications (
      user_id,
      notification_type,
      category,
      title,
      message,
      voucher_id,
      discount_id,
      action_type,
      action_data
    )
    SELECT DISTINCT
      p.id,
      v_notification_type,
      'promotion',
      p_title,
      p_message,
      p_voucher_id,
      p_discount_id,
      p_action_type,
      p_action_data
    FROM profiles p
    INNER JOIN orders o ON o.user_id = p.id
    WHERE p.role = 'customer';
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;

  RETURN v_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_promotion_notification TO authenticated;

-- ============================================
-- STEP 6: CREATE FUNCTION TO GET USER NOTIFICATIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_category TEXT DEFAULT NULL,
  p_is_read BOOLEAN DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  notification_type VARCHAR,
  category VARCHAR,
  title VARCHAR,
  message TEXT,
  order_id UUID,
  order_number VARCHAR,
  product_images JSONB,
  action_type VARCHAR,
  action_data JSONB,
  is_read BOOLEAN,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.notification_type,
    n.category,
    n.title,
    n.message,
    n.order_id,
    n.order_number,
    n.product_images,
    n.action_type,
    n.action_data,
    n.is_read,
    n.read_at,
    n.created_at
  FROM user_notifications n
  WHERE n.user_id = p_user_id
    AND (p_category IS NULL OR n.category = p_category)
    AND (p_is_read IS NULL OR n.is_read = p_is_read)
  ORDER BY n.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_notifications TO anon;

-- ============================================
-- STEP 7: CREATE FUNCTION TO MARK NOTIFICATIONS AS READ
-- ============================================

CREATE OR REPLACE FUNCTION mark_notification_as_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_notifications
  SET 
    is_read = true,
    read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = p_user_id;
    
  RETURN FOUND;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_notification_as_read TO authenticated;

-- ============================================
-- STEP 8: CREATE FUNCTION TO MARK ALL AS READ
-- ============================================

CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(
  p_user_id UUID,
  p_category TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE user_notifications
  SET 
    is_read = true,
    read_at = NOW()
  WHERE user_id = p_user_id
    AND is_read = false
    AND (p_category IS NULL OR category = p_category);
    
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_all_notifications_as_read TO authenticated;

-- ============================================
-- STEP 9: CREATE FUNCTION TO GET UNREAD COUNT
-- ============================================

CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_user_id UUID,
  p_category TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM user_notifications
  WHERE user_id = p_user_id
    AND is_read = false
    AND (p_category IS NULL OR category = p_category);
    
  RETURN v_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO anon;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ NOTIFICATION SYSTEM CREATED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  • user_notifications';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions Created:';
  RAISE NOTICE '  • create_order_notification() - Auto-creates notifications on order status change';
  RAISE NOTICE '  • create_promotion_notification() - Send promotion/discount notifications';
  RAISE NOTICE '  • get_user_notifications() - Fetch user notifications';
  RAISE NOTICE '  • mark_notification_as_read() - Mark single notification as read';
  RAISE NOTICE '  • mark_all_notifications_as_read() - Mark all as read';
  RAISE NOTICE '  • get_unread_notification_count() - Get unread count';
  RAISE NOTICE '';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '  1. Automatic order status notifications';
  RAISE NOTICE '  2. Manual promotion/discount notifications';
  RAISE NOTICE '  3. Two categories: order_update and promotion';
  RAISE NOTICE '  4. Product images in notifications';
  RAISE NOTICE '  5. Action buttons (view order, copy code, etc.)';
  RAISE NOTICE '  6. RLS enabled for security';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Run this SQL in Supabase SQL Editor';
  RAISE NOTICE '  2. Update frontend NotificationService';
  RAISE NOTICE '  3. Update Notification.jsx to fetch from database';
  RAISE NOTICE '  4. Update Navbar to show real unread count';
  RAISE NOTICE '========================================';
END $$;
