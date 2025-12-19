-- =====================================================
-- ADD STATUS COLUMN TO PROFILES TABLE
-- =====================================================
-- This migration adds a 'status' column to track user account status
-- Possible values: 'active', 'banned', 'suspended', 'pending'
-- Default: 'active'
-- =====================================================

-- Step 1: Add the status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN status TEXT DEFAULT 'active' NOT NULL;
        
        RAISE NOTICE 'Added status column to profiles table';
    ELSE
        RAISE NOTICE 'Status column already exists in profiles table';
    END IF;
END $$;

-- Step 2: Add a check constraint to ensure valid status values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'profiles' 
        AND constraint_name = 'profiles_status_check'
    ) THEN
        ALTER TABLE profiles
        ADD CONSTRAINT profiles_status_check 
        CHECK (status IN ('active', 'banned', 'suspended', 'pending'));
        
        RAISE NOTICE 'Added status check constraint';
    ELSE
        RAISE NOTICE 'Status check constraint already exists';
    END IF;
END $$;

-- Step 3: Set all existing users to 'active' status if they're NULL
UPDATE profiles 
SET status = 'active' 
WHERE status IS NULL;

-- Step 4: Create an index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_status 
ON profiles(status);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if column was added successfully
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name = 'status';

-- Check current status distribution
SELECT 
    status, 
    COUNT(*) as count,
    role
FROM profiles
GROUP BY status, role
ORDER BY status, role;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Ban a user:
-- UPDATE profiles SET status = 'banned' WHERE id = 'user-id-here';

-- Unban a user (restore to active):
-- UPDATE profiles SET status = 'active' WHERE id = 'user-id-here';

-- Get all banned users:
-- SELECT * FROM profiles WHERE status = 'banned';

-- Get all active customers (non-employees):
-- SELECT * FROM profiles WHERE status = 'active' AND role = 'customer';
