-- Create database if not exists
CREATE DATABASE IF NOT EXISTS logis_db;
USE logis_db;

-- Users table for authentication
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_tier ENUM('free', 'premium') DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Shipments table
CREATE TABLE shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    folder_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_folder_id (folder_id)
);

-- Containers table
CREATE TABLE containers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shipment_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    height DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    length DECIMAL(10,2) NOT NULL,
    weight_limit DECIMAL(10,2) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Package',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    INDEX idx_shipment_id (shipment_id)
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shipment_id INT NOT NULL,
    container_id INT DEFAULT NULL,
    name VARCHAR(255) NOT NULL,
    height DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    length DECIMAL(10,2) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    resale_price DECIMAL(10,2) NOT NULL,
    days_to_sell INT NOT NULL DEFAULT 7,
    quantity INT NOT NULL DEFAULT 1,
    is_boxed BOOLEAN DEFAULT FALSE,
    icon VARCHAR(50) DEFAULT 'Package',
    tag VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    FOREIGN KEY (container_id) REFERENCES containers(id) ON DELETE SET NULL,
    INDEX idx_shipment_id (shipment_id),
    INDEX idx_container_id (container_id)
);

-- Saved products (presets) table
CREATE TABLE saved_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    height DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    length DECIMAL(10,2) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    resale_price DECIMAL(10,2) NOT NULL,
    days_to_sell INT NOT NULL DEFAULT 7,
    icon VARCHAR(50) DEFAULT 'Package',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Saved containers (presets) table
CREATE TABLE saved_containers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    height DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) NOT NULL,
    length DECIMAL(10,2) NOT NULL,
    weight_limit DECIMAL(10,2) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Package',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Folders table for shipment organization
CREATE TABLE folders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Add foreign key for folder_id in shipments
ALTER TABLE shipments ADD FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL;

-- Insert sample data
INSERT INTO users (email, password_hash, subscription_tier) VALUES 
('dev@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'premium'),
('free@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'free');

INSERT INTO folders (user_id, name) VALUES 
(1, 'Electronics'),
(1, 'Fashion'),
(1, 'Home & Garden');

INSERT INTO shipments (user_id, name, folder_id) VALUES 
(1, 'Tech Products Q1', 1),
(1, 'Fashion Items Spring', 2);

INSERT INTO containers (shipment_id, name, height, width, length, weight_limit, icon) VALUES 
(1, 'Standard Box', 30.0, 40.0, 60.0, 25.0, 'Package'),
(1, 'Large Container', 50.0, 60.0, 80.0, 50.0, 'Package');

INSERT INTO products (shipment_id, container_id, name, height, width, length, weight, purchase_price, resale_price, days_to_sell, quantity, icon) VALUES 
(1, 1, 'iPhone 15 Pro', 15.0, 7.5, 0.8, 0.187, 900.00, 1200.00, 7, 10, 'Smartphone'),
(1, 1, 'MacBook Pro 14"', 31.3, 22.1, 1.55, 1.6, 1800.00, 2400.00, 14, 5, 'Laptop'),
(1, 2, 'AirPods Pro', 6.1, 4.5, 2.1, 0.05, 180.00, 250.00, 5, 20, 'Headphones');