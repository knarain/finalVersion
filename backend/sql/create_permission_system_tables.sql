-- ========================================
-- PERMISSION SYSTEM TABLES
-- ========================================

-- Create roles table
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create modules table
CREATE TABLE IF NOT EXISTS `modules` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `parent_module_id` INT NULL,
    `is_sub_module` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_module_id) REFERENCES modules(id) ON DELETE CASCADE,
    INDEX idx_slug (slug),
    INDEX idx_is_sub_module (is_sub_module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create permissions table
CREATE TABLE IF NOT EXISTS `permissions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create role_module_permissions table
CREATE TABLE IF NOT EXISTS `role_module_permissions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `role_id` INT NOT NULL,
    `module_id` INT NOT NULL,
    `permission_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_module_permission (role_id, module_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_module_id (module_id),
    INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modify admins table if it exists, or create it
CREATE TABLE IF NOT EXISTS `admins` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255),
    `role_id` INT NULL,
    `watch_word` VARCHAR(255),
    `two_factor_enabled` TINYINT(1) DEFAULT 0,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role_id (role_id),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default modules if not exists
INSERT IGNORE INTO `modules` (`id`, `name`, `slug`, `parent_module_id`, `is_sub_module`) VALUES
(1, 'Dashboard', 'dashboard', NULL, 0),
(2, 'Users', 'users', NULL, 0),
(3, 'Roles & Permissions', 'roles_permissions', NULL, 0),
(4, 'Albums', 'albums', NULL, 0),
(5, 'Categories', 'categories', NULL, 0),
(6, 'Enquiries', 'enquiries', NULL, 0),
(7, 'Settings', 'settings', NULL, 0);

-- Insert default permissions if not exists
INSERT IGNORE INTO `permissions` (`id`, `name`, `slug`) VALUES
(1, 'Create', 'create'),
(2, 'Read', 'read'),
(3, 'Update', 'update'),
(4, 'Delete', 'delete');

-- Insert default admin role if not exists
INSERT IGNORE INTO `roles` (`id`, `name`, `description`, `is_active`) VALUES
(1, 'Admin', 'Super administrator with full access', 1),
(2, 'Editor', 'Can edit albums and categories', 1),
(3, 'Viewer', 'Can only view content', 1);

-- Assign all permissions to admin role for all modules
INSERT IGNORE INTO `role_module_permissions` (`role_id`, `module_id`, `permission_id`) VALUES
-- Admin role - all permissions on all modules
(1, 1, 1), (1, 1, 2), (1, 1, 3), (1, 1, 4),
(1, 2, 1), (1, 2, 2), (1, 2, 3), (1, 2, 4),
(1, 3, 1), (1, 3, 2), (1, 3, 3), (1, 3, 4),
(1, 4, 1), (1, 4, 2), (1, 4, 3), (1, 4, 4),
(1, 5, 1), (1, 5, 2), (1, 5, 3), (1, 5, 4),
(1, 6, 1), (1, 6, 2), (1, 6, 3), (1, 6, 4),
(1, 7, 1), (1, 7, 2), (1, 7, 3), (1, 7, 4),
-- Editor role - create, read, update on albums and categories
(2, 4, 1), (2, 4, 2), (2, 4, 3),
(2, 5, 1), (2, 5, 2), (2, 5, 3),
-- Viewer role - read only on albums and categories
(3, 4, 2),
(3, 5, 2);
