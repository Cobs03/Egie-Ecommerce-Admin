-- =====================================================
-- FIX ALL FUNCTION SEARCH_PATH WARNINGS
-- =====================================================
-- Adds "SET search_path = public" to all functions
-- This is a security best practice to prevent search_path manipulation

-- Function 1: update_updated_at_timestamp
ALTER FUNCTION public.update_updated_at_timestamp() SET search_path = public;

-- Function 2: increment_voucher_usage_count
ALTER FUNCTION public.increment_voucher_usage_count() SET search_path = public;

-- Function 3: increment_discount_usage_count
ALTER FUNCTION public.increment_discount_usage_count() SET search_path = public;

-- Function 4: update_inquiry_updated_at
ALTER FUNCTION public.update_inquiry_updated_at() SET search_path = public;

-- Function 5: update_inquiry_status_on_reply
ALTER FUNCTION public.update_inquiry_status_on_reply() SET search_path = public;

-- Function 6: generate_transaction_id
ALTER FUNCTION public.generate_transaction_id() SET search_path = public;

-- Function 7: update_order_timestamp
ALTER FUNCTION public.update_order_timestamp() SET search_path = public;

-- Function 8: update_payment_timestamp
ALTER FUNCTION public.update_payment_timestamp() SET search_path = public;

-- Function 9: mark_own_reply_as_read
ALTER FUNCTION public.mark_own_reply_as_read() SET search_path = public;

-- Function 10: track_ready_for_pickup
ALTER FUNCTION public.track_ready_for_pickup() SET search_path = public;

-- Function 11: create_order_from_cart
ALTER FUNCTION public.create_order_from_cart(p_user_id uuid, p_payment_method text, p_shipping_info jsonb) SET search_path = public;

-- Function 12: update_cart_timestamp
ALTER FUNCTION public.update_cart_timestamp() SET search_path = public;

-- Function 13: get_or_create_cart
ALTER FUNCTION public.get_or_create_cart(p_user_id uuid) SET search_path = public;

-- Function 14: get_cart_with_items
ALTER FUNCTION public.get_cart_with_items(p_user_id uuid) SET search_path = public;

-- Function 15: calculate_discount_display
ALTER FUNCTION public.calculate_discount_display() SET search_path = public;

-- Function 16: update_discount_display
ALTER FUNCTION public.update_discount_display() SET search_path = public;

-- Function 17: get_product_discounts
ALTER FUNCTION public.get_product_discounts(product_uuid uuid) SET search_path = public;

-- Function 18: calculate_discounted_price
ALTER FUNCTION public.calculate_discounted_price(product_uuid uuid) SET search_path = public;

-- Function 19: admin_confirm_order
ALTER FUNCTION public.admin_confirm_order(p_order_id uuid) SET search_path = public;

-- Function 20: add_order_log
ALTER FUNCTION public.add_order_log(p_order_id uuid, p_action text, p_details text) SET search_path = public;

-- Function 21: update_review_timestamp
ALTER FUNCTION public.update_review_timestamp() SET search_path = public;

-- Function 22: get_product_rating_summary
ALTER FUNCTION public.get_product_rating_summary(product_uuid uuid) SET search_path = public;

-- Function 23: get_product_reviews
ALTER FUNCTION public.get_product_reviews(product_uuid uuid, rating_filter integer, sort_order text, review_limit integer, review_offset integer) SET search_path = public;

-- Function 24: deduct_stock_on_payment_confirmation
ALTER FUNCTION public.deduct_stock_on_payment_confirmation() SET search_path = public;

-- Function 25: get_top_selling_products
ALTER FUNCTION public.get_top_selling_products(limit_count integer) SET search_path = public;

-- Function 26: deduct_stock_on_payment_paid
ALTER FUNCTION public.deduct_stock_on_payment_paid() SET search_path = public;

-- Function 27: restore_stock_on_cancel
ALTER FUNCTION public.restore_stock_on_cancel() SET search_path = public;

-- Function 28: deduct_stock_on_order_confirm
ALTER FUNCTION public.deduct_stock_on_order_confirm() SET search_path = public;

-- Function 29: handle_payment_failure
ALTER FUNCTION public.handle_payment_failure() SET search_path = public;

-- Function 30: admin_mark_payment_as_paid
ALTER FUNCTION public.admin_mark_payment_as_paid(p_order_id uuid) SET search_path = public;

-- Function 31: record_voucher_usage
ALTER FUNCTION public.record_voucher_usage(p_voucher_id uuid, p_user_id uuid, p_order_id uuid) SET search_path = public;

-- Function 32: generate_order_number
ALTER FUNCTION public.generate_order_number() SET search_path = public;

-- Function 33: get_shipping_address_for_admin
ALTER FUNCTION public.get_shipping_address_for_admin(p_order_id uuid) SET search_path = public;

-- Function 34: handle_updated_at
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- Function 35: update_product_rating
ALTER FUNCTION public.update_product_rating() SET search_path = public;

-- Function 36: trigger_generate_order_number
ALTER FUNCTION public.trigger_generate_order_number() SET search_path = public;

-- Function 37: log_payment_status_change
ALTER FUNCTION public.log_payment_status_change() SET search_path = public;

-- Function 38: validate_voucher_for_user
ALTER FUNCTION public.validate_voucher_for_user(p_voucher_code text, p_user_id uuid, p_cart_total numeric) SET search_path = public;

-- Function 39: admin_update_order_status
ALTER FUNCTION public.admin_update_order_status(p_order_id uuid, p_new_status text, p_admin_id uuid) SET search_path = public;

-- Function 40: log_shipping_info_update
ALTER FUNCTION public.log_shipping_info_update() SET search_path = public;

-- Function 41: update_email_queue_timestamp
ALTER FUNCTION public.update_email_queue_timestamp() SET search_path = public;

-- Function 42: process_email_queue
ALTER FUNCTION public.process_email_queue() SET search_path = public;

-- Function 43: handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Function 44: deduct_stock_on_confirmation
ALTER FUNCTION public.deduct_stock_on_confirmation() SET search_path = public;

-- Function 45: log_order_status_change
ALTER FUNCTION public.log_order_status_change() SET search_path = public;

-- Function 46: increment_popup_impression
ALTER FUNCTION public.increment_popup_impression(p_popup_id uuid) SET search_path = public;

-- Function 47: increment_popup_click
ALTER FUNCTION public.increment_popup_click(p_popup_id uuid) SET search_path = public;

-- =====================================================
-- FIX: Move pg_trgm extension from public to extensions
-- =====================================================
-- This extension should be in a separate schema for security

-- Create extensions schema if not exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- =====================================================
-- NOTES
-- =====================================================
-- After running this:
-- 1. All 50 function warnings should be resolved
-- 2. pg_trgm extension will be in extensions schema
-- 3. Leaked password protection warning requires dashboard settings change
--    Go to: Authentication → Password Protection → Enable "Check against HaveIBeenPwned"
