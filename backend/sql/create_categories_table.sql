-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
);

-- Insert default categories
INSERT INTO categories (name) VALUES 
('Wedding'),
('Portrait'),
('Event'),
('Corporate'),
('Fashion'),
('Nature');

-- Update albums table to use category_id instead of category string
ALTER TABLE albums CHANGE COLUMN category category_id INT NULL;
ALTER TABLE albums ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;