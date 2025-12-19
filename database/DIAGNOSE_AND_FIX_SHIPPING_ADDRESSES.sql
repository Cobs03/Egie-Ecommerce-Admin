-- ============================================
-- DIAGNOSE AND FIX SHIPPING ADDRESSES
-- ============================================
-- This script will:
-- 1. Check if barangay column exists
-- 2. Check if shipping addresses exist for the order
-- 3. Check if orders have shipping_address_id set
-- 4. Display what's missing
-- ============================================

-- STEP 1: Check the shipping_addresses table structure
-- ============================================
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'shipping_addresses'
ORDER BY ordinal_position;

-- STEP 2: Check if barangay column exists
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'shipping_addresses' 
    AND column_name = 'barangay'
  ) THEN
    RAISE NOTICE '❌ BARANGAY COLUMN MISSING - Run ADD_BARANGAY_COLUMN.sql first!';
    
    -- Add it now
    ALTER TABLE shipping_addresses 
    ADD COLUMN IF NOT EXISTS barangay VARCHAR(100);
    
    RAISE NOTICE '✅ Barangay column added';
  ELSE
    RAISE NOTICE '✅ Barangay column exists';
  END IF;
END $$;

-- STEP 3: Check orders and their shipping addresses
-- ============================================
SELECT 
  o.order_number,
  o.shipping_address_id,
  o.delivery_type,
  CASE 
    WHEN o.shipping_address_id IS NULL THEN '❌ NO SHIPPING ADDRESS ID'
    WHEN sa.id IS NULL THEN '❌ SHIPPING ADDRESS NOT FOUND'
    ELSE '✅ HAS SHIPPING ADDRESS'
  END AS address_status,
  sa.full_name,
  sa.street_address,
  sa.barangay,
  sa.city,
  sa.province,
  sa.postal_code
FROM orders o
LEFT JOIN shipping_addresses sa ON sa.id = o.shipping_address_id
ORDER BY o.created_at DESC
LIMIT 10;

-- STEP 4: Check if any shipping addresses exist at all
-- ============================================
SELECT 
  COUNT(*) AS total_shipping_addresses,
  COUNT(CASE WHEN barangay IS NOT NULL THEN 1 END) AS addresses_with_barangay
FROM shipping_addresses;

-- STEP 5: Show sample shipping addresses
-- ============================================
SELECT 
  id,
  user_id,
  full_name,
  street_address,
  barangay,
  city,
  province,
  postal_code,
  is_default,
  created_at
FROM shipping_addresses
ORDER BY created_at DESC
LIMIT 5;

-- STEP 6: Check recent orders without shipping addresses
-- ============================================
SELECT 
  o.order_number,
  o.user_id,
  o.delivery_type,
  o.shipping_address_id,
  o.created_at,
  CASE 
    WHEN o.delivery_type = 'store_pickup' THEN '✅ Store pickup (no address needed)'
    WHEN o.shipping_address_id IS NULL THEN '❌ Missing shipping_address_id'
    ELSE '✅ Has shipping_address_id'
  END AS diagnosis
FROM orders o
WHERE o.created_at > NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 SHIPPING ADDRESS DIAGNOSIS COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Check the query results above to see:';
  RAISE NOTICE '  1. If barangay column exists';
  RAISE NOTICE '  2. If orders have shipping_address_id';
  RAISE NOTICE '  3. If shipping addresses exist in database';
  RAISE NOTICE '';
  RAISE NOTICE 'Common Issues:';
  RAISE NOTICE '  ❌ Barangay column missing -> Run ADD_BARANGAY_COLUMN.sql';
  RAISE NOTICE '  ❌ No shipping addresses in database -> Users need to add addresses';
  RAISE NOTICE '  ❌ Orders missing shipping_address_id -> Checkout not saving address';
  RAISE NOTICE '========================================';
END $$;
