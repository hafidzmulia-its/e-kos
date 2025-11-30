-- ITS KosFinder Database Schema
-- Enable required extensions

-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE gender_type AS ENUM ('PUTRA', 'PUTRI', 'CAMPUR');

-- Users table (linked to Google OAuth)
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Google OAuth ID
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    image_url TEXT,
    role user_role DEFAULT 'USER' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Facility types master data
CREATE TABLE facility_types (
    id SMALLSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    icon TEXT, -- Icon identifier for frontend
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Main kos listings table
CREATE TABLE kos_listings (
    id BIGSERIAL PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    gender gender_type NOT NULL,
    monthly_price INTEGER NOT NULL, -- in IDR
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    geom GEOMETRY(Point, 4326), -- PostGIS point geometry
    distance_to_its_km NUMERIC(5,2), -- calculated distance to ITS campus
    available_rooms INTEGER DEFAULT 0,
    total_rooms INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Many-to-many relationship between kos and facilities
CREATE TABLE kos_facilities (
    kos_id BIGINT NOT NULL REFERENCES kos_listings(id) ON DELETE CASCADE,
    facility_id SMALLINT NOT NULL REFERENCES facility_types(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT true NOT NULL,
    extra_price INTEGER DEFAULT 0, -- additional cost for this facility
    PRIMARY KEY (kos_id, facility_id)
);

-- Reviews table (optional for MVP)
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    kos_id BIGINT NOT NULL REFERENCES kos_listings(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (kos_id, user_id) -- One review per user per kos
);

-- Favorites table (optional for MVP)
CREATE TABLE favorites (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kos_id BIGINT NOT NULL REFERENCES kos_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, kos_id)
);

-- Create indexes for better performance
CREATE INDEX idx_kos_listings_owner_id ON kos_listings(owner_id);
CREATE INDEX idx_kos_listings_gender ON kos_listings(gender);
CREATE INDEX idx_kos_listings_price ON kos_listings(monthly_price);
CREATE INDEX idx_kos_listings_active ON kos_listings(is_active);
CREATE INDEX idx_kos_listings_geom ON kos_listings USING GIST(geom);
CREATE INDEX idx_reviews_kos_id ON reviews(kos_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                TRIM(title),
                '[^a-zA-Z0-9\s]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate distance to ITS campus
CREATE OR REPLACE FUNCTION calculate_distance_to_its(lat NUMERIC, lon NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
    its_lat CONSTANT NUMERIC := -7.2819; -- ITS Surabaya latitude
    its_lon CONSTANT NUMERIC := 112.7954; -- ITS Surabaya longitude
    distance_km NUMERIC;
BEGIN
    -- Calculate distance using PostGIS
    distance_km := ST_Distance(
        ST_GeogFromText('POINT(' || lon || ' ' || lat || ')'),
        ST_GeogFromText('POINT(' || its_lon || ' ' || its_lat || ')')
    ) / 1000; -- Convert from meters to kilometers
    
    RETURN ROUND(distance_km, 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate geom and calculate distance
CREATE OR REPLACE FUNCTION trigger_update_kos_location()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate geometry from lat/lon
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    
    -- Calculate distance to ITS
    NEW.distance_to_its_km := calculate_distance_to_its(NEW.latitude, NEW.longitude);
    
    -- Auto-generate slug if not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title) || '-' || NEW.id;
    END IF;
    
    -- Update timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_kos_listings_location
    BEFORE INSERT OR UPDATE ON kos_listings
    FOR EACH ROW EXECUTE FUNCTION trigger_update_kos_location();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp trigger to all relevant tables
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();