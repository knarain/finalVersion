-- Create album_access table for authentication
CREATE TABLE IF NOT EXISTS album_access (
    id INT PRIMARY KEY AUTO_INCREMENT,
    album_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
    UNIQUE KEY unique_album_email (album_id, email),
    INDEX idx_album_id (album_id),
    INDEX idx_email (email)
);

-- Create album_auth_tokens table for token management
CREATE TABLE IF NOT EXISTS album_auth_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    album_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
    INDEX idx_album_id (album_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);