-- Create database schema for Rashmi Photography
-- MySQL Database Schema

-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_names VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_date DATE,
    category VARCHAR(50) NOT NULL,
    cover_image VARCHAR(500),
    is_locked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_is_locked (is_locked),
    INDEX idx_created_at (created_at)
);

-- Create album_access table for authentication
CREATE TABLE IF NOT EXISTS album_access (
    id INT PRIMARY KEY AUTO_INCREMENT,
    album_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    access_granted_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
    UNIQUE KEY unique_album_email (album_id, email),
    INDEX idx_album_id (album_id),
    INDEX idx_email (email)
);

-- Create album_images table
CREATE TABLE IF NOT EXISTS album_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    album_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_title VARCHAR(255),
    image_description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
    INDEX idx_album_id (album_id),
    INDEX idx_sort_order (sort_order)
);

-- Create access_logs table for tracking album access
CREATE TABLE IF NOT EXISTS access_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    album_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    access_successful BOOLEAN DEFAULT FALSE,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
    INDEX idx_album_id (album_id),
    INDEX idx_email (email),
    INDEX idx_accessed_at (accessed_at)
);
