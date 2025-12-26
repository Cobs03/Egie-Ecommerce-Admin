-- =====================================================
-- FIX ORDER LOGS - Admin Only & User-Friendly Labels
-- =====================================================
-- This fixes the order logging to only track admin actions
-- and uses user-friendly descriptions
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. DROP OLD TRIGGER AND FUNCTION
-- =====================================================
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;
DROP FUNCTION IF EXISTS log_order_status_change();

-- 2. CREATE IMPROVED TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_name VARCHAR(255);
  user_role VARCHAR(50);
  action_desc TEXT;
  status_labels JSONB;
BEGIN
  -- Only log if status actually changed AND it's an admin action (not customer)
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    
    -- Check if this is an admin/staff action (not a customer creating order)
    IF auth.uid() IS NOT NULL THEN
      SELECT full_name, role INTO user_name, user_role
      FROM profiles
      WHERE id = auth.uid();
      
      -- Only log if user is admin, manager, or employee
      IF user_role IN ('admin', 'super_admin', 'manager', 'employee') THEN
        
        -- User-friendly status labels
        status_labels := jsonb_build_object(
          'pending', 'Pending',
          'confirmed', 'Confirmed',
          'processing', 'Processing',
          'shipped', 'Shipped',
          'ready_for_pickup', 'Ready for Pickup',
          'delivered', 'Delivered',
          'completed', 'Completed',
          'cancelled', 'Cancelled'
        );
        
        -- Create user-friendly description
        action_desc := format(
          'Changed order status from %s to %s',
          COALESCE(status_labels->>OLD.status, OLD.status, 'None'),
          COALESCE(status_labels->>NEW.status, NEW.status)
        );
        
        -- Insert log entry into admin_logs
        INSERT INTO admin_logs (
          user_id,
          action_type,
          action_description,
          target_type,
          target_id,
          metadata
        ) VALUES (
          auth.uid(),
          'Order Status Updated',
          action_desc,
          'Orders',
          NEW.id,
          jsonb_build_object(
            'order_number', NEW.order_number,
            'old_status', OLD.status,
            'new_status', NEW.status,
            'performed_by', user_name,
            'user_role', user_role,
            'timestamp', NOW()
          )
        );
        
        RAISE NOTICE 'Order % status change logged by %: % -> %', 
          NEW.order_number, user_name, OLD.status, NEW.status;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREATE NEW TRIGGER
-- =====================================================
CREATE TRIGGER trigger_log_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_order_status_change();

-- 4. DELETE EXISTING CUSTOMER-CREATED LOGS
-- =====================================================
-- Remove logs where customer created the order (not admin actions)
DELETE FROM admin_logs
WHERE target_type IN ('order', 'Orders')
  AND action_type = 'order_created'
  AND metadata->>'is_backfill' = 'true';

-- Also remove any logs from customer order creation (non-admin users)
DELETE FROM admin_logs al
WHERE target_type IN ('order', 'Orders')
  AND action_type = 'order_created'
  AND NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = al.user_id
    AND p.role IN ('admin', 'super_admin', 'manager', 'employee')
  );

-- 5. UPDATE EXISTING LOGS TO USER-FRIENDLY FORMAT
-- =====================================================
-- Update target_type from 'order' to 'Orders' and action_type to friendly format
UPDATE admin_logs
SET target_type = 'Orders',
    action_type = 'Order Status Updated'
WHERE target_type IN ('order', 'Orders')
  AND action_type IN ('order_status_change', 'order_created');

-- 6. CREATE HELPER FUNCTION WITH FRIENDLY LABELS
-- =====================================================
CREATE OR REPLACE FUNCTION add_order_log(
  p_order_id UUID,
  p_action_type VARCHAR,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_order_number VARCHAR(50);
  v_user_name VARCHAR(255);
  v_user_role VARCHAR(50);
BEGIN
  -- Get current user info
  SELECT full_name, role INTO v_user_name, v_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Only allow admin/staff to create logs
  IF v_user_role NOT IN ('admin', 'super_admin', 'manager', 'employee') THEN
    RAISE EXCEPTION 'Only admin/staff can create order logs';
  END IF;
  
  -- Get order number
  SELECT order_number INTO v_order_number
  FROM orders
  WHERE id = p_order_id;
  
  -- Insert log into admin_logs
  INSERT INTO admin_logs (
    user_id,
    action_type,
    action_description,
    target_type,
    target_id,
    metadata
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_description,
    'Orders',
    p_order_id,
    jsonb_build_object(
      'order_number', v_order_number,
      'performed_by', v_user_name,
      'user_role', v_user_role
    ) || p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION add_order_log(UUID, VARCHAR, TEXT, JSONB) TO authenticated;

-- =====================================================
-- 7. CREATE PAYMENT STATUS CHANGE TRIGGER
-- =====================================================
DROP TRIGGER IF EXISTS trigger_log_payment_status_change ON payments;
DROP FUNCTION IF EXISTS log_payment_status_change();

CREATE OR REPLACE FUNCTION log_payment_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_name VARCHAR(255);
  user_role VARCHAR(50);
  action_desc TEXT;
  order_number_val VARCHAR(50);
BEGIN
  -- Only log if payment_status actually changed
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    
    -- Check if this is an admin/staff action
    IF auth.uid() IS NOT NULL THEN
      SELECT full_name, role INTO user_name, user_role
      FROM profiles
      WHERE id = auth.uid();
      
      -- Only log if user is admin, manager, or employee
      IF user_role IN ('admin', 'super_admin', 'manager', 'employee') THEN
        
        -- Get order number
        SELECT order_number INTO order_number_val
        FROM orders
        WHERE id = NEW.order_id;
        
        -- Create user-friendly description
        action_desc := format(
          'Updated payment status from %s to %s',
          COALESCE(OLD.payment_status, 'None'),
          NEW.payment_status
        );
        
        -- Insert log entry
        INSERT INTO admin_logs (
          user_id,
          action_type,
          action_description,
          target_type,
          target_id,
          metadata
        ) VALUES (
          auth.uid(),
          'Payment Status Updated',
          action_desc,
          'Orders',
          NEW.order_id,
          jsonb_build_object(
            'order_number', order_number_val,
            'payment_id', NEW.id,
            'old_status', OLD.payment_status,
            'new_status', NEW.payment_status,
            'payment_method', NEW.payment_method,
            'performed_by', user_name,
            'user_role', user_role,
            'timestamp', NOW()
          )
        );
        
        RAISE NOTICE 'Payment status change logged by %: % -> %', 
          user_name, OLD.payment_status, NEW.payment_status;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_payment_status_change
  AFTER UPDATE ON payments
  FOR EACH ROW
  WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status)
  EXECUTE FUNCTION log_payment_status_change();

-- =====================================================
-- 8. CREATE SHIPPING INFO UPDATE TRIGGER
-- =====================================================
DROP TRIGGER IF EXISTS trigger_log_shipping_info_update ON orders;
DROP FUNCTION IF EXISTS log_shipping_info_update();

CREATE OR REPLACE FUNCTION log_shipping_info_update()
RETURNS TRIGGER AS $$
DECLARE
  user_name VARCHAR(255);
  user_role VARCHAR(50);
  action_desc TEXT;
BEGIN
  -- Only log if shipping info changed (courier or tracking number)
  IF (NEW.courier_name IS DISTINCT FROM OLD.courier_name) OR 
     (NEW.tracking_number IS DISTINCT FROM OLD.tracking_number) THEN
    
    -- Check if this is an admin/staff action
    IF auth.uid() IS NOT NULL THEN
      SELECT full_name, role INTO user_name, user_role
      FROM profiles
      WHERE id = auth.uid();
      
      -- Only log if user is admin, manager, or employee
      IF user_role IN ('admin', 'super_admin', 'manager', 'employee') THEN
        
        -- Create user-friendly description
        IF NEW.courier_name IS DISTINCT FROM OLD.courier_name AND 
           NEW.tracking_number IS DISTINCT FROM OLD.tracking_number THEN
          action_desc := format(
            'Updated shipping info - Courier: %s, Tracking: %s',
            NEW.courier_name,
            NEW.tracking_number
          );
        ELSIF NEW.courier_name IS DISTINCT FROM OLD.courier_name THEN
          action_desc := format('Updated courier to %s', NEW.courier_name);
        ELSE
          action_desc := format('Updated tracking number to %s', NEW.tracking_number);
        END IF;
        
        -- Insert log entry
        INSERT INTO admin_logs (
          user_id,
          action_type,
          action_description,
          target_type,
          target_id,
          metadata
        ) VALUES (
          auth.uid(),
          'Shipping Info Updated',
          action_desc,
          'Orders',
          NEW.id,
          jsonb_build_object(
            'order_number', NEW.order_number,
            'old_courier', OLD.courier_name,
            'new_courier', NEW.courier_name,
            'old_tracking', OLD.tracking_number,
            'new_tracking', NEW.tracking_number,
            'performed_by', user_name,
            'user_role', user_role,
            'timestamp', NOW()
          )
        );
        
        RAISE NOTICE 'Shipping info update logged by %', user_name;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_shipping_info_update
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN ((OLD.courier_name IS DISTINCT FROM NEW.courier_name) OR 
        (OLD.tracking_number IS DISTINCT FROM NEW.tracking_number))
  EXECUTE FUNCTION log_shipping_info_update();

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
DECLARE
  log_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO log_count
  FROM admin_logs
  WHERE target_type = 'Orders';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ORDER LOGS FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes Applied:';
  RAISE NOTICE '  ✅ Only logs admin/manager/employee actions';
  RAISE NOTICE '  ✅ Customer order creation no longer logged';
  RAISE NOTICE '  ✅ User-friendly action types';
  RAISE NOTICE '  ✅ Cleaned up existing logs';
  RAISE NOTICE '  ✅ Payment status change tracking';
  RAISE NOTICE '  ✅ Shipping info update tracking';
  RAISE NOTICE '';
  RAISE NOTICE 'Current order logs: %', log_count;
  RAISE NOTICE '';
  RAISE NOTICE 'User-Friendly Action Types:';
  RAISE NOTICE '  - Order Status Updated';
  RAISE NOTICE '  - Payment Status Updated';
  RAISE NOTICE '  - Shipping Info Updated';
  RAISE NOTICE '  - Order Notes Added';
  RAISE NOTICE '';
  RAISE NOTICE 'Only these roles can create logs:';
  RAISE NOTICE '  - admin';
  RAISE NOTICE '  - super_admin';
  RAISE NOTICE '  - manager';
  RAISE NOTICE '  - employee';
  RAISE NOTICE '========================================';
END $$;
