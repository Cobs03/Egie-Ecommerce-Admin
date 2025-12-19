-- ============================================
-- ADD BARANGAY COLUMN TO SHIPPING_ADDRESSES
-- ============================================
-- This migration adds the barangay column to the shipping_addresses table
-- to support complete Philippine address structure
-- 
-- Run this after CREATE_ORDERS_SYSTEM.sql
-- ============================================

-- Add barangay column to shipping_addresses table
ALTER TABLE shipping_addresses 
ADD COLUMN IF NOT EXISTS barangay VARCHAR(100);

-- Add comment for the new column
COMMENT ON COLUMN shipping_addresses.barangay IS 'Barangay/village name';

-- Optional: Update existing records with placeholder value
-- (You may want to handle this differently based on your data)
UPDATE shipping_addresses 
SET barangay = 'N/A' 
WHERE barangay IS NULL;

-- If you want to make it required after adding data:
-- ALTER TABLE shipping_addresses 
-- ALTER COLUMN barangay SET NOT NULL;

SELECT 'Barangay column added successfully to shipping_addresses table' AS status;
