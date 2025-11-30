-- ITS KosFinder Seed Data
-- Insert sample data for development

-- Insert facility types
INSERT INTO facility_types (name, icon) VALUES
    ('WiFi', 'wifi'),
    ('AC (Air Conditioning)', 'snowflake'),
    ('Kamar Mandi Dalam', 'bath'),
    ('Kamar Mandi Luar', 'home'),
    ('Kasur', 'bed'),
    ('Lemari', 'package'),
    ('Meja Belajar', 'desk'),
    ('Kursi', 'chair'),
    ('Parkir Motor', 'bike'),
    ('Parkir Mobil', 'car'),
    ('Dapur Bersama', 'chef-hat'),
    ('Laundry', 'washing-machine'),
    ('Security 24 Jam', 'shield'),
    ('CCTV', 'camera'),
    ('Akses Lift', 'arrow-up'),
    ('Balkon', 'home'),
    ('Kulkas', 'refrigerator'),
    ('TV', 'tv');

-- Insert sample admin user (replace with actual admin email)
INSERT INTO users (id, name, email, image_url, role) VALUES
    ('admin-001', 'Admin ITS KosFinder', 'admin@its.ac.id', '', 'ADMIN');

-- Insert sample kos owners/users
INSERT INTO users (id, name, email, image_url, role) VALUES
    ('user-001', 'Ibu Sari', 'sari.kosonline@gmail.com', '', 'USER'),
    ('user-002', 'Pak Budi', 'budi.kost@gmail.com', '', 'USER'),
    ('user-003', 'Ibu Rina', 'rina.kosputri@gmail.com', '', 'USER'),
    ('user-004', 'Pak Ahmad', 'ahmad.kosits@gmail.com', '', 'USER');

-- Insert sample kos listings around ITS Surabaya
-- Note: Coordinates are approximate locations near ITS Surabaya
INSERT INTO kos_listings (
    owner_id, title, slug, description, address, gender, 
    monthly_price, latitude, longitude, available_rooms, total_rooms
) VALUES
    ('user-001', 'Kos Sari Putra Keputih', 'kos-sari-putra-keputih', 
     'Kos putra nyaman dekat ITS dengan fasilitas lengkap. Kamar bersih, lingkungan aman, dan strategis untuk mahasiswa ITS.', 
     'Jl. Keputih Tegal Timur No. 15, Sukolilo, Surabaya', 'PUTRA', 
     850000, -7.2879, 112.7989, 3, 10),
     
    ('user-002', 'Kos Budi Campur Gebang', 'kos-budi-campur-gebang',
     'Kos campur dengan fasilitas modern, dekat dengan kampus ITS. Cocok untuk mahasiswa yang mencari tempat tinggal nyaman.', 
     'Jl. Gebang Putih No. 8A, Sukolilo, Surabaya', 'CAMPUR', 
     700000, -7.2756, 112.7923, 5, 15),
     
    ('user-003', 'Kos Putri Rina Mulyosari', 'kos-putri-rina-mulyosari',
     'Kos khusus putri dengan keamanan 24 jam. Lingkungan bersih dan nyaman untuk mahasiswi ITS.', 
     'Jl. Mulyosari Prima No. 12, Mulyorejo, Surabaya', 'PUTRI', 
     950000, -7.2698, 112.7854, 2, 8),
     
    ('user-004', 'Kos Ahmad Putra Semolowaru', 'kos-ahmad-putra-semolowaru',
     'Kos putra strategis dekat ITS dan Universitas Airlangga. Akses mudah ke berbagai fasilitas umum.', 
     'Jl. Semolowaru Indah No. 45, Sukolilo, Surabaya', 'PUTRA', 
     800000, -7.2812, 112.7765, 4, 12),
     
    ('user-001', 'Kos Sari Putri Klampis', 'kos-sari-putri-klampis',
     'Kos putri eksklusif dengan fasilitas premium. Dekat dengan pusat perbelanjaan dan kampus ITS.', 
     'Jl. Klampis Jaya No. 23, Sukolilo, Surabaya', 'PUTRI', 
     1200000, -7.2634, 112.7892, 1, 6),
     
    ('user-002', 'Kos Ekonomis Keputih', 'kos-ekonomis-keputih',
     'Kos dengan harga terjangkau untuk mahasiswa. Fasilitas standar namun nyaman dan bersih.', 
     'Jl. Keputih Tegal Barat No. 67, Sukolilo, Surabaya', 'CAMPUR', 
     500000, -7.2845, 112.7967, 8, 20),
     
    ('user-003', 'Kos Rina Premium Manyar', 'kos-rina-premium-manyar',
     'Kos mewah dengan fasilitas lengkap. AC, WiFi kencang, dan keamanan terjamin 24 jam.', 
     'Jl. Manyar Kertoadi No. 88, Sukolilo, Surabaya', 'PUTRI', 
     1500000, -7.2567, 112.7723, 0, 4),
     
    ('user-004', 'Kos Putra ITS Tengah', 'kos-putra-its-tengah',
     'Kos putra paling dekat dengan gerbang utama ITS. Cocok untuk mahasiswa yang sering ada kegiatan kampus.', 
     'Jl. Teknik Kimia No. 3, Keputih, Sukolilo, Surabaya', 'PUTRA', 
     1100000, -7.2823, 112.7956, 2, 8);

-- Insert kos facilities relationships
-- Kos Sari Putra Keputih (id: 1) - facilities
INSERT INTO kos_facilities (kos_id, facility_id, is_available, extra_price) VALUES
    (1, 1, true, 0),   -- WiFi
    (1, 2, true, 50000), -- AC
    (1, 3, true, 0),   -- Kamar Mandi Dalam
    (1, 5, true, 0),   -- Kasur
    (1, 6, true, 0),   -- Lemari
    (1, 7, true, 0),   -- Meja Belajar
    (1, 9, true, 0),   -- Parkir Motor
    (1, 13, true, 0);  -- Security 24 Jam

-- Kos Budi Campur Gebang (id: 2) - facilities  
INSERT INTO kos_facilities (kos_id, facility_id, is_available, extra_price) VALUES
    (2, 1, true, 0),   -- WiFi
    (2, 4, true, 0),   -- Kamar Mandi Luar
    (2, 5, true, 0),   -- Kasur
    (2, 6, true, 0),   -- Lemari
    (2, 7, true, 0),   -- Meja Belajar
    (2, 9, true, 0),   -- Parkir Motor
    (2, 11, true, 0);  -- Dapur Bersama

-- Kos Putri Rina Mulyosari (id: 3) - facilities
INSERT INTO kos_facilities (kos_id, facility_id, is_available, extra_price) VALUES
    (3, 1, true, 0),   -- WiFi
    (3, 2, true, 0),   -- AC
    (3, 3, true, 0),   -- Kamar Mandi Dalam
    (3, 5, true, 0),   -- Kasur
    (3, 6, true, 0),   -- Lemari
    (3, 7, true, 0),   -- Meja Belajar
    (3, 9, true, 0),   -- Parkir Motor
    (3, 13, true, 0),  -- Security 24 Jam
    (3, 14, true, 0),  -- CCTV
    (3, 12, true, 25000); -- Laundry

-- Kos Ahmad Putra Semolowaru (id: 4) - facilities
INSERT INTO kos_facilities (kos_id, facility_id, is_available, extra_price) VALUES
    (4, 1, true, 0),   -- WiFi
    (4, 3, true, 0),   -- Kamar Mandi Dalam
    (4, 5, true, 0),   -- Kasur
    (4, 6, true, 0),   -- Lemari
    (4, 7, true, 0),   -- Meja Belajar
    (4, 9, true, 0),   -- Parkir Motor
    (4, 10, true, 30000), -- Parkir Mobil
    (4, 11, true, 0);  -- Dapur Bersama

-- Kos Sari Putri Klampis (id: 5) - facilities (premium)
INSERT INTO kos_facilities (kos_id, facility_id, is_available, extra_price) VALUES
    (5, 1, true, 0),   -- WiFi
    (5, 2, true, 0),   -- AC
    (5, 3, true, 0),   -- Kamar Mandi Dalam
    (5, 5, true, 0),   -- Kasur
    (5, 6, true, 0),   -- Lemari
    (5, 7, true, 0),   -- Meja Belajar
    (5, 9, true, 0),   -- Parkir Motor
    (5, 13, true, 0),  -- Security 24 Jam
    (5, 14, true, 0),  -- CCTV
    (5, 12, true, 0),  -- Laundry
    (5, 17, true, 0),  -- Kulkas
    (5, 18, true, 0);  -- TV

-- Kos Ekonomis Keputih (id: 6) - basic facilities
INSERT INTO kos_facilities (kos_id, facility_id, is_available, extra_price) VALUES
    (6, 1, true, 0),   -- WiFi
    (6, 4, true, 0),   -- Kamar Mandi Luar
    (6, 5, true, 0),   -- Kasur
    (6, 6, true, 0),   -- Lemari
    (6, 9, true, 0);   -- Parkir Motor

-- Kos Rina Premium Manyar (id: 7) - premium facilities
INSERT INTO kos_facilities (kos_id, facility_id, is_available, extra_price) VALUES
    (7, 1, true, 0),   -- WiFi
    (7, 2, true, 0),   -- AC
    (7, 3, true, 0),   -- Kamar Mandi Dalam
    (7, 5, true, 0),   -- Kasur
    (7, 6, true, 0),   -- Lemari
    (7, 7, true, 0),   -- Meja Belajar
    (7, 9, true, 0),   -- Parkir Motor
    (7, 10, true, 0),  -- Parkir Mobil
    (7, 13, true, 0),  -- Security 24 Jam
    (7, 14, true, 0),  -- CCTV
    (7, 12, true, 0),  -- Laundry
    (7, 15, true, 0),  -- Akses Lift
    (7, 16, true, 0),  -- Balkon
    (7, 17, true, 0),  -- Kulkas
    (7, 18, true, 0);  -- TV

-- Kos Putra ITS Tengah (id: 8) - facilities
INSERT INTO kos_facilities (kos_id, facility_id, is_available, extra_price) VALUES
    (8, 1, true, 0),   -- WiFi
    (8, 2, true, 75000), -- AC
    (8, 3, true, 0),   -- Kamar Mandi Dalam
    (8, 5, true, 0),   -- Kasur
    (8, 6, true, 0),   -- Lemari
    (8, 7, true, 0),   -- Meja Belajar
    (8, 9, true, 0),   -- Parkir Motor
    (8, 13, true, 0),  -- Security 24 Jam
    (8, 11, true, 0);  -- Dapur Bersama

-- Insert sample reviews
INSERT INTO reviews (kos_id, user_id, rating, comment) VALUES
    (1, 'admin-001', 5, 'Kos yang sangat nyaman dan bersih. Pemilik ramah dan fasilitas lengkap.'),
    (2, 'admin-001', 4, 'Lokasi strategis dan harga terjangkau. Recommended untuk mahasiswa!'),
    (3, 'admin-001', 5, 'Kos putri terbaik di area ITS. Keamanan sangat terjaga.'),
    (4, 'admin-001', 4, 'Akses mudah ke kampus, fasilitas cukup lengkap untuk harga segini.'),
    (5, 'admin-001', 5, 'Mewah dan nyaman, sesuai dengan harga premium yang ditawarkan.');

-- Insert some favorites (sample data)
INSERT INTO favorites (user_id, kos_id) VALUES
    ('admin-001', 1),
    ('admin-001', 3),
    ('admin-001', 5);