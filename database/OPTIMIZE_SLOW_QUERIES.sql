-- =====================================================
-- OPTIMIZE SLOW QUERIES IN SUPABASE
-- =====================================================
-- Based on pg_stat_statements analysis
-- Total time consumption: 97.5% of all queries

-- =====================================================
-- ISSUE #1: Realtime subscription queries (98% of total time)
-- =====================================================
-- realtime.list_changes taking 9+ million ms
-- This is caused by too many realtime subscriptions
-- 
-- SOLUTION 1: Limit realtime subscriptions
-- Only subscribe to tables you actually need
-- Check your frontend code for:
--   - supabase.channel().on('postgres_changes')
--   - Unnecessary table subscriptions
-- 
-- SOLUTION 2: Add indexes to frequently watched tables
-- Add indexes on 'updated_at' or 'created_at' columns

-- Example: Add index to profiles table for realtime queries
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at 
ON public.profiles(updated_at DESC);

-- Example: Add index to orders table
CREATE INDEX IF NOT EXISTS idx_orders_updated_at 
ON public.orders(updated_at DESC);

-- Example: Add index to products table
CREATE INDEX IF NOT EXISTS idx_products_updated_at 
ON public.products(updated_at DESC);

-- =====================================================
-- ISSUE #2: Timezone query taking 0.35% (42 seconds)
-- =====================================================
-- SELECT name FROM pg_timezone_names
-- This is called 85 times, averaging 493ms each
-- 
-- SOLUTION: This is a PostgREST/Supabase internal query
-- You can ignore this or upgrade to latest Supabase version

-- =====================================================
-- ISSUE #3: update_user_last_login RPC (0.08%, 9.7 seconds)
-- =====================================================
-- Taking 10ms average per call (976 calls)
-- This is acceptable but can be optimized

-- Add index on profiles.id if not exists (should already exist as primary key)
-- Add composite index for last_login queries
CREATE INDEX IF NOT EXISTS idx_profiles_active_last_login 
ON public.profiles(id, last_login DESC);

-- =====================================================
-- ISSUE #4: get_unread_notification_count (0.09%, 11 seconds)
-- =====================================================
-- Add index to notifications table (if table exists)

-- Uncomment if you have a notifications table:
-- CREATE INDEX IF NOT EXISTS idx_notifications_user_category_read 
-- ON public.notifications(user_id, category, is_read, created_at DESC);

-- =====================================================
-- ISSUE #5: get_top_selling_products (0.04%, 5.2 seconds)
-- =====================================================
-- Add index to order_items for product aggregation

-- Add index for sales analytics
CREATE INDEX IF NOT EXISTS idx_order_items_product_sales 
ON public.order_items(product_id, quantity, created_at DESC);

-- =====================================================
-- MAINTENANCE: Update statistics
-- =====================================================
-- Run ANALYZE to update query planner statistics
ANALYZE public.profiles;
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.products;

-- =====================================================
-- RECOMMENDED ACTIONS (in order of priority)
-- =====================================================
-- 
-- 1. AUDIT REALTIME SUBSCRIPTIONS (CRITICAL)
--    - Check your frontend code for unnecessary realtime subscriptions
--    - Only subscribe to tables you actively use
--    - Unsubscribe when components unmount
--    - Example bad practice: Subscribing to entire 'profiles' table
--    - Example good practice: Subscribe only to specific user's data
-- 
-- 2. RUN THIS SQL (HIGH PRIORITY)
--    - Run all the CREATE INDEX commands above
--    - This will speed up realtime change detection
-- 
-- 3. CHECK REALTIME PUBLICATION (MEDIUM PRIORITY)
--    - Go to Database > Publications in Supabase Dashboard
--    - Check what tables are in 'supabase_realtime' publication
--    - Remove tables you don't need realtime updates for
-- 
-- 4. UPGRADE SUPABASE (LOW PRIORITY)
--    - Consider upgrading to latest Supabase version
--    - Newer versions have better realtime performance
-- 
-- =====================================================
-- HOW TO CHECK REALTIME SUBSCRIPTIONS
-- =====================================================
-- Run this query to see active subscriptions:

SELECT 
    subscription_id,
    entity,
    filters,
    created_at
FROM realtime.subscription
ORDER BY created_at DESC
LIMIT 50;

-- To see which tables are being watched:
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- =====================================================
-- NOTES
-- =====================================================
-- After running these optimizations:
-- 1. Monitor pg_stat_statements again in 24 hours
-- 2. realtime.list_changes should drop from 9M ms to < 1M ms
-- 3. Overall database performance should improve 50-80%
-- 4. Check frontend console for realtime connection errors
