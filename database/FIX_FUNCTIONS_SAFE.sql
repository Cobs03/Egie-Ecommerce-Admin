-- =====================================================
-- FIX FUNCTION SEARCH_PATH - SAFE VERSION
-- =====================================================
-- This version continues on errors and fixes what it can

-- Each ALTER is wrapped to continue even if function doesn't exist
-- If a function doesn't exist, it will show an error but continue

DO $$ 
BEGIN
    -- Function 1: update_updated_at_timestamp
    BEGIN
        ALTER FUNCTION public.update_updated_at_timestamp() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: update_updated_at_timestamp - function not found';
    END;

    -- Function 2: increment_voucher_usage_count
    BEGIN
        ALTER FUNCTION public.increment_voucher_usage_count() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: increment_voucher_usage_count - function not found';
    END;

    -- Function 3: increment_discount_usage_count
    BEGIN
        ALTER FUNCTION public.increment_discount_usage_count() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: increment_discount_usage_count - function not found';
    END;

    -- Function 4: update_inquiry_updated_at
    BEGIN
        ALTER FUNCTION public.update_inquiry_updated_at() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: update_inquiry_updated_at - function not found';
    END;

    -- Function 5: update_inquiry_status_on_reply
    BEGIN
        ALTER FUNCTION public.update_inquiry_status_on_reply() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: update_inquiry_status_on_reply - function not found';
    END;

    -- Function 6: generate_transaction_id
    BEGIN
        ALTER FUNCTION public.generate_transaction_id() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: generate_transaction_id - function not found';
    END;

    -- Function 7: update_order_timestamp
    BEGIN
        ALTER FUNCTION public.update_order_timestamp() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: update_order_timestamp - function not found';
    END;

    -- Function 8: update_payment_timestamp
    BEGIN
        ALTER FUNCTION public.update_payment_timestamp() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: update_payment_timestamp - function not found';
    END;

    -- Function 9: mark_own_reply_as_read
    BEGIN
        ALTER FUNCTION public.mark_own_reply_as_read() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: mark_own_reply_as_read - function not found';
    END;

    -- Function 10: track_ready_for_pickup
    BEGIN
        ALTER FUNCTION public.track_ready_for_pickup() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: track_ready_for_pickup - function not found';
    END;

    -- Function 12: update_cart_timestamp
    BEGIN
        ALTER FUNCTION public.update_cart_timestamp() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: update_cart_timestamp - function not found';
    END;

    -- Function 15: calculate_discount_display
    BEGIN
        ALTER FUNCTION public.calculate_discount_display() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: calculate_discount_display - function not found';
    END;

    -- Function 16: update_discount_display
    BEGIN
        ALTER FUNCTION public.update_discount_display() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: update_discount_display - function not found';
    END;

    -- Function 21: update_review_timestamp
    BEGIN
        ALTER FUNCTION public.update_review_timestamp() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: update_review_timestamp - function not found';
    END;

    -- Function 24: deduct_stock_on_payment_confirmation
    BEGIN
        ALTER FUNCTION public.deduct_stock_on_payment_confirmation() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: deduct_stock_on_payment_confirmation - function not found';
    END;

    -- Function 26: deduct_stock_on_payment_paid
    BEGIN
        ALTER FUNCTION public.deduct_stock_on_payment_paid() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: deduct_stock_on_payment_paid - function not found';
    END;

    -- Function 27: restore_stock_on_cancel
    BEGIN
        ALTER FUNCTION public.restore_stock_on_cancel() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: restore_stock_on_cancel - function not found';
    END;

    -- Function 28: deduct_stock_on_order_confirm
    BEGIN
        ALTER FUNCTION public.deduct_stock_on_order_confirm() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: deduct_stock_on_order_confirm - function not found';
    END;

    -- Function 29: handle_payment_failure
    BEGIN
        ALTER FUNCTION public.handle_payment_failure() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: handle_payment_failure - function not found';
    END;

    -- Function 32: generate_order_number
    BEGIN
        ALTER FUNCTION public.generate_order_number() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: generate_order_number - function not found';
    END;

    -- Function 34: handle_updated_at
    BEGIN
        ALTER FUNCTION public.handle_updated_at() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: handle_updated_at - function not found';
    END;

    -- Function 35: update_product_rating
    BEGIN
        ALTER FUNCTION public.update_product_rating() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: update_product_rating - function not found';
    END;

    -- Function 36: trigger_generate_order_number
    BEGIN
        ALTER FUNCTION public.trigger_generate_order_number() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: trigger_generate_order_number - function not found';
    END;

    -- Function 37: log_payment_status_change
    BEGIN
        ALTER FUNCTION public.log_payment_status_change() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: log_payment_status_change - function not found';
    END;

    -- Function 40: log_shipping_info_update
    BEGIN
        ALTER FUNCTION public.log_shipping_info_update() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: log_shipping_info_update - function not found';
    END;

    -- Function 41: update_email_queue_timestamp
    BEGIN
        ALTER FUNCTION public.update_email_queue_timestamp() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: update_email_queue_timestamp - function not found';
    END;

    -- Function 42: process_email_queue
    BEGIN
        ALTER FUNCTION public.process_email_queue() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: process_email_queue - function not found';
    END;

    -- Function 43: handle_new_user
    BEGIN
        ALTER FUNCTION public.handle_new_user() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: handle_new_user - function not found';
    END;

    -- Function 44: deduct_stock_on_confirmation
    BEGIN
        ALTER FUNCTION public.deduct_stock_on_confirmation() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: deduct_stock_on_confirmation - function not found';
    END;

    -- Function 45: log_order_status_change
    BEGIN
        ALTER FUNCTION public.log_order_status_change() SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: log_order_status_change - function not found';
    END;

    -- Functions WITH parameters - need exact signature match
    -- Function 11: create_order_from_cart - try common signatures
    BEGIN
        EXECUTE 'ALTER FUNCTION public.create_order_from_cart(uuid, text, jsonb) SET search_path = public';
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            EXECUTE 'ALTER FUNCTION public.create_order_from_cart(uuid, text, text, numeric) SET search_path = public';
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'Skipped: create_order_from_cart - function signature not found';
        END;
    END;

    -- Function 13: get_or_create_cart
    BEGIN
        ALTER FUNCTION public.get_or_create_cart(uuid) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: get_or_create_cart - function not found';
    END;

    -- Function 14: get_cart_with_items
    BEGIN
        ALTER FUNCTION public.get_cart_with_items(uuid) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: get_cart_with_items - function not found';
    END;

    -- Function 17: get_product_discounts
    BEGIN
        ALTER FUNCTION public.get_product_discounts(uuid) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: get_product_discounts - function not found';
    END;

    -- Function 18: calculate_discounted_price
    BEGIN
        ALTER FUNCTION public.calculate_discounted_price(uuid, numeric) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            ALTER FUNCTION public.calculate_discounted_price(uuid) SET search_path = public;
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'Skipped: calculate_discounted_price - function not found';
        END;
    END;

    -- Function 19: admin_confirm_order
    BEGIN
        ALTER FUNCTION public.admin_confirm_order(uuid) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: admin_confirm_order - function not found';
    END;

    -- Function 20: add_order_log
    BEGIN
        ALTER FUNCTION public.add_order_log(uuid, text, text, uuid) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            ALTER FUNCTION public.add_order_log(uuid, text, text) SET search_path = public;
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'Skipped: add_order_log - function not found';
        END;
    END;

    -- Function 22: get_product_rating_summary
    BEGIN
        ALTER FUNCTION public.get_product_rating_summary(uuid) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: get_product_rating_summary - function not found';
    END;

    -- Function 23: get_product_reviews
    BEGIN
        ALTER FUNCTION public.get_product_reviews(uuid, integer, text, integer, integer) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            ALTER FUNCTION public.get_product_reviews(uuid, integer, integer) SET search_path = public;
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'Skipped: get_product_reviews - function not found';
        END;
    END;

    -- Function 25: get_top_selling_products
    BEGIN
        ALTER FUNCTION public.get_top_selling_products(integer) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: get_top_selling_products - function not found';
    END;

    -- Function 30: admin_mark_payment_as_paid
    BEGIN
        ALTER FUNCTION public.admin_mark_payment_as_paid(uuid, uuid) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            ALTER FUNCTION public.admin_mark_payment_as_paid(uuid) SET search_path = public;
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'Skipped: admin_mark_payment_as_paid - function not found';
        END;
    END;

    -- Function 31: record_voucher_usage
    BEGIN
        ALTER FUNCTION public.record_voucher_usage(uuid, uuid, uuid, numeric) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            ALTER FUNCTION public.record_voucher_usage(uuid, uuid, uuid) SET search_path = public;
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'Skipped: record_voucher_usage - function not found';
        END;
    END;

    -- Function 33: get_shipping_address_for_admin
    BEGIN
        ALTER FUNCTION public.get_shipping_address_for_admin(uuid) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: get_shipping_address_for_admin - function not found';
    END;

    -- Function 38: validate_voucher_for_user
    BEGIN
        ALTER FUNCTION public.validate_voucher_for_user(text, uuid, numeric) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            ALTER FUNCTION public.validate_voucher_for_user(text, uuid) SET search_path = public;
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'Skipped: validate_voucher_for_user - function not found';
        END;
    END;

    -- Function 39: admin_update_order_status
    BEGIN
        ALTER FUNCTION public.admin_update_order_status(uuid, text, uuid, text) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            ALTER FUNCTION public.admin_update_order_status(uuid, text, uuid) SET search_path = public;
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'Skipped: admin_update_order_status - function not found';
        END;
    END;

    -- Function 46: increment_popup_impression
    BEGIN
        ALTER FUNCTION public.increment_popup_impression(uuid) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: increment_popup_impression - function not found';
    END;

    -- Function 47: increment_popup_click
    BEGIN
        ALTER FUNCTION public.increment_popup_click(uuid) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: increment_popup_click - function not found';
    END;

    -- update_user_last_login (from earlier fix)
    BEGIN
        ALTER FUNCTION public.update_user_last_login(uuid) SET search_path = public;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Skipped: update_user_last_login - function not found';
    END;

    RAISE NOTICE 'Function search_path updates completed!';
END $$;

-- =====================================================
-- FIX: Move pg_trgm extension
-- =====================================================
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- =====================================================
-- DONE
-- =====================================================
-- This script will fix all functions it can find
-- and skip any that don't exist or have different signatures
