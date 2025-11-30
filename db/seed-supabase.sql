-- =========================================
--  SEED DATA untuk DATABASE SUPABASE
-- =========================================

-- Insert facility types
INSERT INTO public.facility_types (name, icon) VALUES
('WiFi', 'wifi'),
('AC', 'snowflake'),
('Kamar Mandi Dalam', 'bath'),
('Parkir Motor', 'car'),
('Laundry', 'shirt'),
('Dapur', 'chef-hat'),
('Kulkas', 'refrigerator'),
('TV', 'tv'),
('Kasur', 'bed'),
('Lemari', 'cabinet')
ON CONFLICT (name) DO NOTHING;

-- Insert sample users (sesuaikan dengan yang akan digunakan Google OAuth)
-- Note: ID harus disesuaikan dengan yang dari Google OAuth nanti
INSERT INTO public.users (id, name, email, role) VALUES
('google-oauth-id-1', 'Budi Santoso', 'budi.santoso@example.com', 'USER'),
('google-oauth-id-2', 'Siti Rahayu', 'siti.rahayu@example.com', 'USER'),
('google-oauth-id-3', 'Ahmad Rahman', 'ahmad.rahman@example.com', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Insert sample kos listings dekat ITS Surabaya
INSERT INTO public.kos_listings (
  owner_id, title, slug, description, address, gender, monthly_price, 
  latitude, longitude, distance_to_its_km, available_rooms, total_rooms
) VALUES
(
  'google-oauth-id-1', 
  'Kos Melati Sukolilo', 
  'kos-melati-sukolilo',
  'Kos strategis dekat kampus ITS dengan fasilitas lengkap. Lingkungan aman dan nyaman untuk mahasiswa. Tersedia WiFi, AC, dan kamar mandi dalam.',
  'Jl. Raya ITS No. 15, Sukolilo, Surabaya, Jawa Timur 60111',
  'PUTRI',
  500000,
  -7.2819,
  112.7950,
  0.5,
  3,
  10
),
(
  'google-oauth-id-2',
  'Kos Mawar Keputih',
  'kos-mawar-keputih', 
  'Kos eksklusif untuk mahasiswa dengan fasilitas premium. Dekat dengan warung makan dan minimarket. Akses mudah ke kampus ITS.',
  'Jl. Keputih Tegal Timur No. 88, Sukolilo, Surabaya, Jawa Timur 60111',
  'PUTRA', 
  650000,
  -7.2905,
  112.7998,
  1.2,
  5,
  12
),
(
  'google-oauth-id-3',
  'Kos Anggrek Gebang',
  'kos-anggrek-gebang',
  'Kos modern dengan design minimalis. Dilengkapi dengan fasilitas gym mini dan ruang belajar bersama. Cocok untuk mahasiswa yang membutuhkan suasana tenang.',
  'Jl. Gebang Putih No. 45, Sukolilo, Surabaya, Jawa Timur 60111', 
  'CAMPUR',
  750000,
  -7.2756,
  112.7889,
  2.1,
  2,
  8
)
ON CONFLICT (slug) DO NOTHING;

-- Insert kos facilities (relasi many-to-many)
-- Facilities untuk Kos Melati Sukolilo (id: 1)
INSERT INTO public.kos_facilities (kos_id, facility_id, is_available, extra_price) 
SELECT 1, ft.id, true, 
  CASE 
    WHEN ft.name = 'AC' THEN 50000 
    WHEN ft.name = 'Laundry' THEN 25000
    ELSE 0 
  END
FROM public.facility_types ft 
WHERE ft.name IN ('WiFi', 'AC', 'Kamar Mandi Dalam', 'Parkir Motor', 'Laundry', 'Kasur', 'Lemari')
ON CONFLICT (kos_id, facility_id) DO NOTHING;

-- Facilities untuk Kos Mawar Keputih (id: 2)
INSERT INTO public.kos_facilities (kos_id, facility_id, is_available, extra_price)
SELECT 2, ft.id, true,
  CASE 
    WHEN ft.name = 'AC' THEN 75000
    WHEN ft.name = 'Laundry' THEN 30000
    WHEN ft.name = 'Kulkas' THEN 25000
    ELSE 0
  END
FROM public.facility_types ft
WHERE ft.name IN ('WiFi', 'AC', 'Kamar Mandi Dalam', 'Parkir Motor', 'Laundry', 'Kulkas', 'TV', 'Kasur', 'Lemari')
ON CONFLICT (kos_id, facility_id) DO NOTHING;

-- Facilities untuk Kos Anggrek Gebang (id: 3)  
INSERT INTO public.kos_facilities (kos_id, facility_id, is_available, extra_price)
SELECT 3, ft.id, true,
  CASE 
    WHEN ft.name = 'AC' THEN 100000
    WHEN ft.name = 'Laundry' THEN 35000
    WHEN ft.name = 'Kulkas' THEN 30000
    WHEN ft.name = 'Dapur' THEN 50000
    ELSE 0
  END  
FROM public.facility_types ft
WHERE ft.name IN ('WiFi', 'AC', 'Kamar Mandi Dalam', 'Parkir Motor', 'Laundry', 'Dapur', 'Kulkas', 'TV', 'Kasur', 'Lemari')
ON CONFLICT (kos_id, facility_id) DO NOTHING;

-- Insert sample reviews
INSERT INTO public.reviews (kos_id, user_id, rating, comment) VALUES
(1, 'google-oauth-id-2', 5, 'Kos yang sangat nyaman dan bersih. Pemilik ramah dan fasilitas lengkap. Highly recommended!'),
(1, 'google-oauth-id-3', 4, 'Lokasi strategis dekat kampus. Kamar cukup luas dan ada AC. Cuma kadang WiFi agak lambat.'),
(2, 'google-oauth-id-1', 5, 'Kos premium dengan fasilitas terbaik. Worth it untuk harga segitu. Lingkungan aman dan tenang.'),
(2, 'google-oauth-id-3', 4, 'Kos bagus tapi agak mahal. Tapi sesuai dengan fasilitasnya yang lengkap dan modern.'),
(3, 'google-oauth-id-1', 4, 'Kos dengan konsep modern. Suka sama design interiornya. Ruang belajar bersama sangat membantu.'),
(3, 'google-oauth-id-2', 5, 'Perfect untuk mahasiswa yang butuh suasana tenang untuk belajar. Gym mini jadi nilai plus!')
ON CONFLICT (kos_id, user_id) DO NOTHING;

-- Update geometry field (untuk query spatial)
UPDATE public.kos_listings 
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE geom IS NULL;

-- Calculate distance from ITS campus (koordinat ITS: -7.2820, 112.7947)
UPDATE public.kos_listings 
SET distance_to_its_km = ROUND(
  CAST(
    ST_DistanceSphere(
      ST_SetSRID(ST_MakePoint(112.7947, -7.2820), 4326),
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    ) / 1000 AS NUMERIC
  ), 2
)
WHERE distance_to_its_km IS NULL;

-- Verify data insertion
SELECT 
  'kos_listings' as table_name, 
  count(*) as total_records 
FROM public.kos_listings
UNION ALL
SELECT 
  'facility_types' as table_name, 
  count(*) as total_records 
FROM public.facility_types  
UNION ALL
SELECT 
  'kos_facilities' as table_name,
  count(*) as total_records
FROM public.kos_facilities
UNION ALL  
SELECT 
  'reviews' as table_name,
  count(*) as total_records  
FROM public.reviews
UNION ALL
SELECT 
  'users' as table_name,
  count(*) as total_records
FROM public.users;