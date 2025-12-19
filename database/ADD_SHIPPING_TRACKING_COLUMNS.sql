-- Add shipping tracking columns to orders table
-- This allows admin to record courier name and tracking number when marking orders as shipped

-- Add courier_name column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS courier_name TEXT;

-- Add tracking_number column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Add shipped_at timestamp column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;

-- Create index for faster querying by tracking number
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- Comment the columns
COMMENT ON COLUMN orders.courier_name IS 'Name of the courier/shipping company (e.g., J&T Express, LBC, Ninjavan)';
COMMENT ON COLUMN orders.tracking_number IS 'Waybill/tracking number from the courier';
COMMENT ON COLUMN orders.shipped_at IS 'Timestamp when order was marked as shipped';
