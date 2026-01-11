CREATE TABLE IF NOT EXISTS action_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  action_name VARCHAR(255) NOT NULL,
  action_date DATETIME NOT NULL,
  ip_address VARCHAR(45),
  action_by_admin INT,
  description LONGTEXT,
  action_applied_for VARCHAR(100),
  reference_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_action_date (action_date),
  INDEX idx_action_by_admin (action_by_admin),
  INDEX idx_action_applied_for (action_applied_for),
  FOREIGN KEY (action_by_admin) REFERENCES admins(id) ON DELETE SET NULL
);
