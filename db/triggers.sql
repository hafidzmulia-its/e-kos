-- =========================================
--  TRIGGER untuk AUTO-GENERATE SLUG
-- =========================================

-- Function untuk generate slug dari title
CREATE OR REPLACE FUNCTION public.generate_slug_from_title()
RETURNS trigger AS $$
DECLARE
  new_slug text;
  slug_exists boolean;
  counter integer := 1;
  base_slug text;
BEGIN
  -- Generate base slug dari title
  base_slug := lower(trim(NEW.title));
  
  -- Replace spasi dan karakter special dengan dash
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  
  -- Remove leading/trailing dashes
  base_slug := trim(both '-' from base_slug);
  
  -- Set initial slug
  new_slug := base_slug;
  
  -- Check if slug exists dan generate unique slug
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.kos_listings 
      WHERE slug = new_slug 
      AND (NEW.id IS NULL OR id != NEW.id)
    ) INTO slug_exists;
    
    EXIT WHEN NOT slug_exists;
    
    new_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  NEW.slug := new_slug;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_generate_slug ON public.kos_listings;

CREATE TRIGGER trigger_generate_slug
  BEFORE INSERT OR UPDATE ON public.kos_listings
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION public.generate_slug_from_title();

-- =========================================
--  TRIGGER untuk AUTO-UPDATE GEOMETRY
-- =========================================

-- Function untuk update geometry dari lat/lng
CREATE OR REPLACE FUNCTION public.update_kos_geometry()
RETURNS trigger AS $$
BEGIN
  -- Update geometry field dari latitude/longitude
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  
  -- Calculate distance to ITS campus (-7.2820, 112.7947)
  NEW.distance_to_its_km := ROUND(
    CAST(
      ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint(112.7947, -7.2820), 4326),
        NEW.geom
      ) / 1000 AS NUMERIC
    ), 2
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_geometry ON public.kos_listings;

CREATE TRIGGER trigger_update_geometry
  BEFORE INSERT OR UPDATE ON public.kos_listings
  FOR EACH ROW
  WHEN (NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL)
  EXECUTE FUNCTION public.update_kos_geometry();