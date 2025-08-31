
-- Albums table
CREATE TABLE IF NOT EXISTS albums (
	id INT AUTO_INCREMENT PRIMARY KEY,
	client_names VARCHAR(255) NOT NULL,
	event_type VARCHAR(100),
	event_date DATE,
	category VARCHAR(100),
	cover_image VARCHAR(255),
	is_locked BOOLEAN DEFAULT 0
);

-- Album images table
CREATE TABLE IF NOT EXISTS album_images (
	id INT AUTO_INCREMENT PRIMARY KEY,
	album_id INT NOT NULL,
	image_url VARCHAR(255),
	image_title VARCHAR(255),
	sort_order INT DEFAULT 0,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (album_id) REFERENCES albums(id)
);

-- Album access table
CREATE TABLE IF NOT EXISTS album_access (
	id INT AUTO_INCREMENT PRIMARY KEY,
	album_id INT NOT NULL,
	email VARCHAR(255) NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	access_granted_at TIMESTAMP NULL,
	FOREIGN KEY (album_id) REFERENCES albums(id)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL
);
