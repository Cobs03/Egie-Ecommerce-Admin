-- ============================================
-- UPDATE NOTIFICATION TRIGGER TO SHOW ALL PRODUCT IMAGES
-- ============================================
-- This updates the trigger function to capture ALL product images
-- instead of limiting to 4

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

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ NOTIFICATION TRIGGER UPDATED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  • Removed 4-image limit';
  RAISE NOTICE '  • Now captures ALL product images from orders';
  RAISE NOTICE '  • Frontend shows first 4, with +N indicator for more';
  RAISE NOTICE '========================================';
END $$;
