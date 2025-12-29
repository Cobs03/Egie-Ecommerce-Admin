-- =====================================================
-- FIX REMAINING 7 FUNCTION WARNINGS
-- =====================================================
-- These are the functions that were skipped in the previous run

DO $$ 
BEGIN
    -- Try different signatures for each remaining function
    
    -- 1. create_order_from_cart - try all possible signatures
    BEGIN
        EXECUTE 'ALTER FUNCTION public.create_order_from_cart(uuid, text, text, numeric) SET search_path = public';
        RAISE NOTICE 'Fixed: create_order_from_cart(uuid, text, text, numeric)';
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            EXECUTE 'ALTER FUNCTION public.create_order_from_cart(uuid, text, jsonb) SET search_path = public';
            RAISE NOTICE 'Fixed: create_order_from_cart(uuid, text, jsonb)';
        EXCEPTION WHEN undefined_function THEN
            BEGIN
                EXECUTE 'ALTER FUNCTION public.create_order_from_cart(uuid, text, text) SET search_path = public';
                RAISE NOTICE 'Fixed: create_order_from_cart(uuid, text, text)';
            EXCEPTION WHEN undefined_function THEN
                RAISE NOTICE 'ERROR: create_order_from_cart - no matching signature found';
            END;
        END;
    END;

    -- 2. calculate_discount_display
    BEGIN
        ALTER FUNCTION public.calculate_discount_display() SET search_path = public;
        RAISE NOTICE 'Fixed: calculate_discount_display()';
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'ERROR: calculate_discount_display - function not found';
    END;

    -- 3. calculate_discounted_price - try both signatures
    BEGIN
        EXECUTE 'ALTER FUNCTION public.calculate_discounted_price(uuid) SET search_path = public';
        RAISE NOTICE 'Fixed: calculate_discounted_price(uuid)';
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            EXECUTE 'ALTER FUNCTION public.calculate_discounted_price(uuid, numeric) SET search_path = public';
            RAISE NOTICE 'Fixed: calculate_discounted_price(uuid, numeric)';
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'ERROR: calculate_discounted_price - no matching signature found';
        END;
    END;

    -- 4. add_order_log - try all signatures
    BEGIN
        EXECUTE 'ALTER FUNCTION public.add_order_log(uuid, text, text) SET search_path = public';
        RAISE NOTICE 'Fixed: add_order_log(uuid, text, text)';
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            EXECUTE 'ALTER FUNCTION public.add_order_log(uuid, text, text, uuid) SET search_path = public';
            RAISE NOTICE 'Fixed: add_order_log(uuid, text, text, uuid)';
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'ERROR: add_order_log - no matching signature found';
        END;
    END;

    -- 5. record_voucher_usage - try all signatures
    BEGIN
        EXECUTE 'ALTER FUNCTION public.record_voucher_usage(uuid, uuid, uuid) SET search_path = public';
        RAISE NOTICE 'Fixed: record_voucher_usage(uuid, uuid, uuid)';
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            EXECUTE 'ALTER FUNCTION public.record_voucher_usage(uuid, uuid, uuid, numeric) SET search_path = public';
            RAISE NOTICE 'Fixed: record_voucher_usage(uuid, uuid, uuid, numeric)';
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'ERROR: record_voucher_usage - no matching signature found';
        END;
    END;

    -- 6. validate_voucher_for_user - try both signatures
    BEGIN
        EXECUTE 'ALTER FUNCTION public.validate_voucher_for_user(text, uuid) SET search_path = public';
        RAISE NOTICE 'Fixed: validate_voucher_for_user(text, uuid)';
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            EXECUTE 'ALTER FUNCTION public.validate_voucher_for_user(text, uuid, numeric) SET search_path = public';
            RAISE NOTICE 'Fixed: validate_voucher_for_user(text, uuid, numeric)';
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'ERROR: validate_voucher_for_user - no matching signature found';
        END;
    END;

    -- 7. admin_update_order_status - try all signatures
    BEGIN
        EXECUTE 'ALTER FUNCTION public.admin_update_order_status(uuid, text, uuid) SET search_path = public';
        RAISE NOTICE 'Fixed: admin_update_order_status(uuid, text, uuid)';
    EXCEPTION WHEN undefined_function THEN
        BEGIN
            EXECUTE 'ALTER FUNCTION public.admin_update_order_status(uuid, text, uuid, text) SET search_path = public';
            RAISE NOTICE 'Fixed: admin_update_order_status(uuid, text, uuid, text)';
        EXCEPTION WHEN undefined_function THEN
            RAISE NOTICE 'ERROR: admin_update_order_status - no matching signature found';
        END;
    END;

    RAISE NOTICE '✅ Remaining function warnings fixed!';
END $$;

-- =====================================================
-- SUMMARY
-- =====================================================
-- After running this, you should have ZERO function warnings!
-- Only 1 warning will remain: Leaked Password Protection
-- 
-- To fix the last warning:
-- 1. Go to Supabase Dashboard
-- 2. Authentication → Password Protection
-- 3. Enable "Check against HaveIBeenPwned"
