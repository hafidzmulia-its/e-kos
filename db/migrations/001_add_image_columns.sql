-- Migration to add image columns to kos_listings table
-- Run this SQL in your Supabase SQL editor

ALTER TABLE kos_listings 
ADD COLUMN cover_image TEXT,
ADD COLUMN cover_image_url TEXT,
ADD COLUMN images TEXT[],
ADD COLUMN image_urls TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN kos_listings.cover_image IS 'Cloudinary public_id for main cover image';
COMMENT ON COLUMN kos_listings.cover_image_url IS 'Cloudinary secure_url for main cover image';
COMMENT ON COLUMN kos_listings.images IS 'Array of Cloudinary public_ids for image gallery';
COMMENT ON COLUMN kos_listings.image_urls IS 'Array of Cloudinary secure_urls for image gallery';