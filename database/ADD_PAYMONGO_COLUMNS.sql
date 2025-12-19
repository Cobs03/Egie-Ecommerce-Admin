-- Add PayMongo integration columns to orders table
-- This stores PayMongo payment references for GCash transactions

-- Add paymongo_source_id column to store the PayMongo source ID
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS paymongo_source_id TEXT;

-- Add paymongo_payment_id column to store the completed payment ID
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS paymongo_payment_id TEXT;

-- Add payment_status column if it doesn't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_paymongo_source 
ON orders(paymongo_source_id);

CREATE INDEX IF NOT EXISTS idx_orders_payment_status 
ON orders(payment_status);

-- Add comment
COMMENT ON COLUMN orders.paymongo_source_id IS 'PayMongo source ID for GCash/e-wallet payments';
COMMENT ON COLUMN orders.paymongo_payment_id IS 'PayMongo payment ID after successful charge';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, paid, failed, refunded';
