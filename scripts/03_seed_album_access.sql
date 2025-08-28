-- Seed album access credentials
-- Note: In production, passwords should be properly hashed using bcrypt or similar

-- Insert access credentials for locked albums
-- Using simple hashing for demo (in production, use proper bcrypt hashing)
INSERT INTO album_access (album_id, email, password_hash) VALUES
-- SUSHANTH & JOSHNIKA Wedding
(1, 'sushanth@example.com', '$2b$10$rQZ8kqVvJ7K8mF2nF3nF3eF3nF3nF3nF3nF3nF3nF3nF3nF3nF3nF'),
(1, 'joshnika@example.com', '$2b$10$rQZ8kqVvJ7K8mF2nF3nF3eF3nF3nF3nF3nF3nF3nF3nF3nF3nF3nF'),

-- MANI & HARSHITHA Wedding  
(2, 'mani@example.com', '$2b$10$sR9ZlrWwK8L9nG3oG4oG4fG4oG4oG4oG4oG4oG4oG4oG4oG4oG4oG'),
(2, 'harshitha@example.com', '$2b$10$sR9ZlrWwK8L9nG3oG4oG4fG4oG4oG4oG4oG4oG4oG4oG4oG4oG4oG'),

-- AADARSH'S HOUSE WARMING
(3, 'aadarsh@example.com', '$2b$10$tS0AmrXxL9M0oH4pH5pH5gH5pH5pH5pH5pH5pH5pH5pH5pH5pH5pH'),
(3, 'family@example.com', '$2b$10$tS0AmrXxL9M0oH4pH5pH5gH5pH5pH5pH5pH5pH5pH5pH5pH5pH5pH'),

-- KAVYA'S BIRTHDAY
(5, 'kavya@example.com', '$2b$10$uT1BnsYyM0N1pI5qI6qI6hI6qI6qI6qI6qI6qI6qI6qI6qI6qI6qI'),
(5, 'kavyaparents@example.com', '$2b$10$uT1BnsYyM0N1pI5qI6qI6hI6qI6qI6qI6qI6qI6qI6qI6qI6qI6qI'),

-- LAKSHMI'S CRADLE CEREMONY
(8, 'lakshmi@example.com', '$2b$10$vU2CotZzN1O2qJ6rJ7rJ7iJ7rJ7rJ7rJ7rJ7rJ7rJ7rJ7rJ7rJ7rJ'),

-- VIKRAM'S DOTHI CEREMONY
(9, 'vikram@example.com', '$2b$10$wV3Dpu00O2P3rK7sK8sK8jK8sK8sK8sK8sK8sK8sK8sK8sK8sK8sK');
