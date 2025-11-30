-- Migration to add is_active column to kos_listings table
-- Run this SQL in your Supabase SQL editor

-- Check if column exists before adding
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'kos_listings' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE kos_listings 
        ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
        
        -- Add comment for documentation
        COMMENT ON COLUMN kos_listings.is_active IS 'Whether the listing is active and visible to users';
    END IF;
END $$;
