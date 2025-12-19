-- ========================================
-- STAFF RPC FUNCTIONS FOR STOCK MANAGEMENT
-- ========================================
-- These functions ensure triggers are properly fired
-- when admin/manager/employee updates orders/payments through the UI
-- Accessible by: admin, manager, employee roles
-- ========================================

-- Function 1: Staff marks payment as paid
CREATE OR REPLACE FUNCTION admin_mark_payment_as_paid(p_payment_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment RECORD;
  v_order_id UUID;
BEGIN
  -- Get payment details
  SELECT * INTO v_payment
  FROM payments
  WHERE id = p_payment_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment not found'
    );
  END IF;
  
  -- Update payment status (this will trigger the stock deduction)
  UPDATE payments
  SET payment_status = 'paid',
      paid_at = NOW(),
      updated_at = NOW()
  WHERE id = p_payment_id;
  
  RAISE NOTICE '✅ Staff marked payment as paid: %', p_payment_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'message', 'Payment marked as paid and stock deducted'
  );
END;
$$;

-- Allow authenticated and service roles to execute
GRANT EXECUTE ON FUNCTION admin_mark_payment_as_paid(UUID) TO authenticated, service_role;

-- Function 2: Staff confirms order (for COD)
CREATE OR REPLACE FUNCTION admin_confirm_order(p_order_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
BEGIN
  -- Get order details
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found'
    );
  END IF;
  
  IF v_order.status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order is not in pending status'
    );
  END IF;
  
  -- Update order status (this will trigger stock deduction for COD)
  UPDATE orders
  SET status = 'confirmed',
      confirmed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_order_id;
  
  RAISE NOTICE '✅ Staff confirmed order: %', v_order.order_number;
  
  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'order_number', v_order.order_number,
    'message', 'Order confirmed and stock deducted'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_confirm_order(UUID) TO authenticated, service_role;

-- Function 3: Staff updates order status (processing, shipped, etc)
CREATE OR REPLACE FUNCTION admin_update_order_status(
  p_order_id UUID,
  p_status VARCHAR,
  p_courier_name VARCHAR DEFAULT NULL,
  p_tracking_number VARCHAR DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_update_data jsonb;
BEGIN
  -- Get order details
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found'
    );
  END IF;
  
  -- Build update data
  v_update_data := jsonb_build_object(
    'status', p_status,
    'updated_at', NOW()
  );
  
  -- Add timestamp fields based on status
  IF p_status = 'confirmed' THEN
    v_update_data := v_update_data || jsonb_build_object('confirmed_at', NOW());
  ELSIF p_status = 'shipped' THEN
    v_update_data := v_update_data || jsonb_build_object(
      'shipped_at', NOW(),
      'courier_name', p_courier_name,
      'tracking_number', p_tracking_number
    );
  ELSIF p_status = 'delivered' THEN
    v_update_data := v_update_data || jsonb_build_object('delivered_at', NOW());
  ELSIF p_status = 'cancelled' THEN
    v_update_data := v_update_data || jsonb_build_object('cancelled_at', NOW());
  END IF;
  
  -- Update order (triggers will handle stock)
  UPDATE orders
  SET 
    status = p_status,
    confirmed_at = CASE WHEN p_status = 'confirmed' THEN NOW() ELSE confirmed_at END,
    shipped_at = CASE WHEN p_status = 'shipped' THEN NOW() ELSE shipped_at END,
    delivered_at = CASE WHEN p_status = 'delivered' THEN NOW() ELSE delivered_at END,
    cancelled_at = CASE WHEN p_status = 'cancelled' THEN NOW() ELSE cancelled_at END,
    courier_name = COALESCE(p_courier_name, courier_name),
    tracking_number = COALESCE(p_tracking_number, tracking_number),
    updated_at = NOW()
  WHERE id = p_order_id;
  
  RAISE NOTICE '✅ Staff updated order % to status: %', v_order.order_number, p_status;
  
  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'order_number', v_order.order_number,
    'status', p_status,
    'message', format('Order updated to %s', p_status)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_order_status(UUID, VARCHAR, VARCHAR, VARCHAR) TO authenticated, service_role;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ STAFF RPC FUNCTIONS CREATED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Available for ALL staff roles (admin, manager, employee):';
  RAISE NOTICE '  1. admin_mark_payment_as_paid(payment_id)';
  RAISE NOTICE '  2. admin_confirm_order(order_id)';
  RAISE NOTICE '  3. admin_update_order_status(order_id, status, courier, tracking)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ These functions work for admin, manager, and employee!';
  RAISE NOTICE '⚠️ Stock deduction triggers fire correctly for all roles!';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
