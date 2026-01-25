CREATE DATABASE IF NOT EXISTS red_art_db;
USE red_art_db;

CREATE TABLE IF NOT EXISTS portfolio_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GEMSTONE CATEGORIES (Ruby, Sapphire, etc.) --
CREATE TABLE IF NOT EXISTS gemstone_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- JEWELRY CATEGORIES (Rings, Necklaces, etc.) --
CREATE TABLE IF NOT EXISTS jewelry_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GEMSTONES (Linked to 1 Gemstone Category) --
CREATE TABLE IF NOT EXISTS gemstones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- Legacy
    gemstone_category_id INT,
    image VARCHAR(255), -- Main image (thumbnail)
    price VARCHAR(50),
    description TEXT,
    detail_client VARCHAR(255),
    detail_author VARCHAR(255),
    detail_category VARCHAR(255),
    detail_link VARCHAR(255),
    detail_date VARCHAR(255),
    detail_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gemstone_category_id) REFERENCES gemstone_categories(id) ON DELETE SET NULL
);

-- JEWELRY ITEMS (Linked to 1 Jewelry Category) --
CREATE TABLE IF NOT EXISTS jewelry_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    jewelry_category_id INT,
    image VARCHAR(255), -- Main image (thumbnail)
    price VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jewelry_category_id) REFERENCES jewelry_categories(id) ON DELETE SET NULL
);

-- COMPOSITION: Jewelry Item <-> Gemstone Categories (Many-to-Many) --
CREATE TABLE IF NOT EXISTS jewelry_gemstone_composition (
    jewelry_id INT,
    gemstone_category_id INT,
    PRIMARY KEY (jewelry_id, gemstone_category_id),
    FOREIGN KEY (jewelry_id) REFERENCES jewelry_items(id) ON DELETE CASCADE,
    FOREIGN KEY (gemstone_category_id) REFERENCES gemstone_categories(id) ON DELETE CASCADE
);

-- NEW: KEY-VALUE SETTINGS (For Cloudinary Config) --
CREATE TABLE IF NOT EXISTS app_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT
);

-- NEW: GEMSTONE IMAGES (Gallery) --
CREATE TABLE IF NOT EXISTS gemstone_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gemstone_id INT,
    image_url VARCHAR(255) NOT NULL,
    public_id VARCHAR(100), -- for cloudinary delete
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gemstone_id) REFERENCES gemstones(id) ON DELETE CASCADE
);

-- NEW: JEWELRY IMAGES (Gallery) --
CREATE TABLE IF NOT EXISTS jewelry_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jewelry_id INT,
    image_url VARCHAR(255) NOT NULL,
    public_id VARCHAR(100),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jewelry_id) REFERENCES jewelry_items(id) ON DELETE CASCADE
);


-- SEED DATA --

-- 1. Gemstone Categories
INSERT IGNORE INTO gemstone_categories (name, description) VALUES
('RUBY', 'Đá Ruby đỏ'),
('SAPPHIRE', 'Đá Sapphire xanh'),
('EMERALD', 'Ngọc lục bảo'),
('DIAMOND', 'Kim cương'),
('JADE', 'Cẩm thạch'),
('OTHER', 'Đá quý khác');

-- 2. Jewelry Categories
INSERT IGNORE INTO jewelry_categories (name, description) VALUES
('NHẪN', 'Nhẫn các loại'),
('DÂY CHUYỀN', 'Dây chuyền vàng, bạc, đá quý'),
('BÔNG TAI', 'Bông tai thời trang'),
('VÒNG TAY', 'Vòng tay phong thủy'),
('LẮC TAY', 'Lắc tay cao cấp');

-- 3. Gemstones
INSERT IGNORE INTO gemstones (id, title, category, gemstone_category_id, image, price, description) VALUES 
(1, 'Hồng Ngọc Lộng Lẫy', 'RUBY', 1, 'https://placehold.co/600x400/222/FFF?text=Ruby+1', '50.000.000 ₫', 'Ruby đỏ huyết bồ câu.'),
(2, 'Lam Ngọc Huyền Bí', 'SAPPHIRE', 2, 'https://placehold.co/600x400/333/FFF?text=Sapphire+1', '75.000.000 ₫', 'Sapphire xanh biển.'),
(3, 'Ngọc Lục Bảo', 'EMERALD', 3, 'https://placehold.co/600x400/444/FFF?text=Emerald+1', '30.000.000 ₫', 'Emerald xanh lục.');

-- 4. Jewelry Items
INSERT IGNORE INTO jewelry_items (id, title, jewelry_category_id, image, price) VALUES
(1, 'Nhẫn Ruby Cao Cấp', 1, 'https://placehold.co/300x200/222/FFF?text=Nhan+Ruby', '15.000.000 ₫'),
(2, 'Dây Chuyền Sapphire', 2, 'https://placehold.co/280x350/333/FFF?text=Day+Chuyen', '25.000.000 ₫'),
(3, 'Bông Tai Kim Cương', 3, 'https://placehold.co/320x220/444/FFF?text=Bong+Tai', '100.000.000 ₫');

-- 5. Composition
INSERT IGNORE INTO jewelry_gemstone_composition (jewelry_id, gemstone_category_id) VALUES
(1, 1),
(1, 4), 
(2, 2), 
(3, 4);

-- 6. Initial Settings (Placeholders)
INSERT IGNORE INTO app_settings (setting_key, setting_value) VALUES
('CLOUD_NAME', ''),
('API_KEY', ''),
('API_SECRET', ''),
('UPLOAD_PRESET', '');

-- NEW: HERO SLIDES (Carousel) --
CREATE TABLE IF NOT EXISTS hero_slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    link VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data for Hero Slides
INSERT IGNORE INTO hero_slides (image_url, title, subtitle, sort_order) VALUES
('https://placehold.co/1920x1080/222/FFF?text=Hero+1', 'Tinh hoa & SANG TRỌNG', 'CHÀO MỪNG BẠN ĐẾN VỚI THẾ GIỚI ĐÁ QUÝ', 0),
('https://placehold.co/1920x1080/333/FFF?text=Hero+2', 'Vẻ đẹp & VĨNH CỬU', 'KHÁM PHÁ BỘ SƯU TẬP MỚI', 1);

-- Update Gemstones with specific fields
ALTER TABLE gemstones
ADD COLUMN weight VARCHAR(50),
ADD COLUMN dimensions VARCHAR(50),
ADD COLUMN color VARCHAR(50),
ADD COLUMN clarity VARCHAR(50),
ADD COLUMN cut VARCHAR(50),
ADD COLUMN origin VARCHAR(100);

-- ADMIN USERS TABLE --
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
