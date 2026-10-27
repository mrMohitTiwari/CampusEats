-- 1. Create database
CREATE DATABASE IF NOT EXISTS campuseats;
USE campuseats;

-- 2. Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(8, 2) NOT NULL,
  available BOOLEAN DEFAULT TRUE
);

-- 3. Seed data
INSERT INTO dishes (name, price, available) VALUES
  ('Veg Thali', 120.00, TRUE),
  ('Masala Dosa', 60.00, TRUE),
  ('Paneer Butter Masala', 160.00, TRUE),
  ('Cold Coffee', 40.00, FALSE);