-- ============================================
-- ADD READY FOR PICKUP STATUS TO ORDERS
-- ============================================
-- This migration adds a new 'ready_for_pickup' status to the orders table
-- for handling store pickup orders separately from delivery orders
--
-- Order Flow:
-- - Delivery: pending → confirmed → processing → shipped → delivered
-- - Pickup: pending → confirmed → processing → ready_for_pickup → completed
--
-- Run this script in your Supabase SQL editor
-- ============================================

-- Step 1: Check current status constraint
DO $$ 
BEGIN
    -- Drop existing check constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'orders_status_check'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_status_check;
        RAISE NOTICE 'Dropped existing orders_status_check constraint';
    END IF;
END $$;

-- Step 2: Add new check constraint with ready_for_pickup and completed statuses
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN (
    'pending', 
    'confirmed', 
    'processing', 
    'shipped', 
    'ready_for_pickup',
    'delivered', 
    'completed',
    'cancelled'
));

-- Step 3: Add comment explaining the new statuses
COMMENT ON COLUMN orders.status IS 
'Order status: 
- pending: Order placed, awaiting confirmation
- confirmed: Order confirmed by admin
- processing: Order being prepared
- shipped: Order dispatched with courier (delivery orders)
- ready_for_pickup: Order ready for customer pickup (pickup orders)
- delivered: Order delivered to customer (delivery orders)
- completed: Order picked up by customer (pickup orders)
- cancelled: Order cancelled';

-- Step 4: Create index for quick filtering of pickup-ready orders
CREATE INDEX IF NOT EXISTS idx_orders_ready_for_pickup 
ON orders(status) 
WHERE status = 'ready_for_pickup';

-- Step 5: Add trigger to track when order becomes ready for pickup
CREATE OR REPLACE FUNCTION track_ready_for_pickup()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ready_for_pickup' AND OLD.status != 'ready_for_pickup' THEN
        NEW.updated_at = NOW();
        
        -- You can add notification logic here later
        -- For example, send email/SMS to customer
        RAISE NOTICE 'Order % is now ready for pickup', NEW.order_number;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ready_for_pickup ON orders;
CREATE TRIGGER trigger_ready_for_pickup
    BEFORE UPDATE ON orders
    FOR EACH ROW
    WHEN (NEW.status = 'ready_for_pickup')
    EXECUTE FUNCTION track_ready_for_pickup();

-- ============================================
-- Verification Queries
-- ============================================

-- Verify the constraint was added
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname = 'orders_status_check';

-- Check for any orders that might need status update
SELECT 
    order_number,
    status,
    delivery_type,
    created_at
FROM orders
WHERE delivery_type = 'pickup' 
  AND status IN ('shipped', 'delivered')
ORDER BY created_at DESC
LIMIT 10;

-- Summary of orders by status
SELECT 
    status,
    delivery_type,
    COUNT(*) as count
FROM orders
GROUP BY status, delivery_type
ORDER BY status, delivery_type;

-- Success messages
DO $$
BEGIN
    RAISE NOTICE '✅ Ready for Pickup status has been successfully added!';
    RAISE NOTICE 'ℹ️  Pickup orders flow: pending → confirmed → processing → ready_for_pickup → completed';
    RAISE NOTICE 'ℹ️  Delivery orders flow: pending → confirmed → processing → shipped → delivered';
END $$;
