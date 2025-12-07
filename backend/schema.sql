-- EcoFest Database Schema for Supabase
-- Run this in Supabase SQL Editor: https://czjczfjaqywyzpawqsdl.supabase.co

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Municipality', 'Shopkeeper')),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FESTIVALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS festivals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    season VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AREAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FESTIVAL WASTE DATA
-- ============================================
CREATE TABLE IF NOT EXISTS festival_waste (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER REFERENCES festivals(id),
    area_id INTEGER REFERENCES areas(id),
    date DATE NOT NULL,
    total_waste_kg DECIMAL(10, 2),
    recyclable_kg DECIMAL(10, 2),
    organic_kg DECIMAL(10, 2),
    hazardous_kg DECIMAL(10, 2),
    priority VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SHOPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    area_id INTEGER REFERENCES areas(id),
    products TEXT[],
    avg_daily_sales DECIMAL(10, 2),
    eco_score DECIMAL(3, 1),
    total_waste_kg DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AI PREDICTIONS CACHE
-- ============================================
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER REFERENCES festivals(id),
    area_id INTEGER REFERENCES areas(id),
    predicted_waste_kg DECIMAL(10, 2),
    confidence DECIMAL(3, 2),
    prediction_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default festivals
INSERT INTO festivals (name, description, season) VALUES
    ('Diwali', 'Festival of Lights - fireworks and decorations', 'autumn'),
    ('Holi', 'Festival of Colors - colored powders and water', 'spring'),
    ('Ganesh Chaturthi', 'Lord Ganesha Festival - idols and decorations', 'autumn'),
    ('Christmas', 'Christmas Celebration - decorations and gifts', 'winter'),
    ('Sankranti', 'Harvest Festival - kites and sweets', 'winter')
ON CONFLICT (name) DO NOTHING;

-- Insert Bangalore areas
INSERT INTO areas (name, latitude, longitude) VALUES
    ('Koramangala', 12.9352, 77.6245),
    ('Indiranagar', 12.9784, 77.6408),
    ('Whitefield', 12.9698, 77.7499),
    ('HSR Layout', 12.9116, 77.6389),
    ('Jayanagar', 12.9308, 77.5838),
    ('BTM Layout', 12.9166, 77.6101),
    ('Electronic City', 12.8399, 77.6770),
    ('Marathahalli', 12.9591, 77.6974),
    ('Banashankari', 12.9255, 77.5468),
    ('Malleshwaram', 13.0035, 77.5647),
    ('Rajajinagar', 12.9876, 77.5536),
    ('JP Nagar', 12.9063, 77.5857),
    ('Hebbal', 13.0358, 77.5970),
    ('Yelahanka', 13.1007, 77.5963),
    ('KR Puram', 13.0068, 77.6968),
    ('Basavanagudi', 12.9425, 77.5749),
    ('Shivaji Nagar', 12.9857, 77.6046),
    ('MG Road', 12.9753, 77.6063),
    ('Brigade Road', 12.9715, 77.6076),
    ('Commercial Street', 12.9833, 77.6084),
    ('Cunningham Road', 12.9892, 77.5904),
    ('Vijayanagar', 12.9693, 77.5343),
    ('Nagarbhavi', 12.9609, 77.5129),
    ('Bannerghatta Road', 12.8887, 77.5974),
    ('Sarjapur Road', 12.9107, 77.6830),
    ('Bellandur', 12.9260, 77.6762),
    ('Madiwala', 12.9222, 77.6184)
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, name, role, email) VALUES
    ('admin', '240be518fabd2724ddb6f04eeb9d5b98b02e65ef0dac56bcf67e5f2882b9e', 'Administrator', 'Admin', 'admin@ecofest.com'),
    ('municipality', '5e884898da28047d9169a74e9cc9e1f07f5d9917b3d2e3a7a14c2b8d1e3f4a5b', 'City Municipality', 'Municipality', 'municipality@ecofest.com'),
    ('shopkeeper', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Local Shopkeeper', 'Shopkeeper', 'shop@ecofest.com')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_festival_waste_festival ON festival_waste(festival_id);
CREATE INDEX IF NOT EXISTS idx_festival_waste_area ON festival_waste(area_id);
CREATE INDEX IF NOT EXISTS idx_festival_waste_date ON festival_waste(date);
CREATE INDEX IF NOT EXISTS idx_shops_area ON shops(area_id);
CREATE INDEX IF NOT EXISTS idx_predictions_festival ON predictions(festival_id);

-- ============================================
-- ROW LEVEL SECURITY (Optional - Enable for production)
-- ============================================
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE festivals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE festival_waste ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
