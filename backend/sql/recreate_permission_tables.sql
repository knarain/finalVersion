-- Drop existing permission tables
DROP TABLE IF EXISTS `role_module_permissions`;
DROP TABLE IF EXISTS `modules`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;

-- Create roles table
CREATE TABLE `roles` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create modules table with icon and url columns
CREATE TABLE `modules` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `parent_id` INT NULL,
    `is_sub_module` TINYINT(1) DEFAULT 0,
    `icon` VARCHAR(50) DEFAULT NULL,
    `url` VARCHAR(255) DEFAULT NULL,
    `order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES modules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create permissions table
CREATE TABLE `permissions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create role_module_permissions table
CREATE TABLE `role_module_permissions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `role_id` INT NOT NULL,
    `module_id` INT NOT NULL,
    `permission_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_module_permission (role_id, module_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert permissions
INSERT INTO `permissions` (`id`, `name`, `slug`) VALUES
(1, 'Read', 'read'),
(2, 'Create', 'create'),
(3, 'Update', 'update'),
(4, 'Delete', 'delete');

-- Insert roles
INSERT INTO `roles` (`id`, `name`, `description`, `is_active`) VALUES
(1, 'Admin', 'Super administrator with full access', 1),
(17, 'Manager', 'Manager role with specific permissions', 1);

-- Insert modules based on your actual sidebar
INSERT INTO `modules` (`id`, `name`, `slug`, `parent_id`, `is_sub_module`, `icon`, `url`, `order`) VALUES
-- Main Modules
(1, 'Dashboard', 'dashboard', NULL, 0, 'LayoutDashboard', '/admin', 1),
(2, 'Enquiries', 'enquiries', NULL, 0, 'MessageSquare', '/admin/enquiries', 2),
(3, 'Albums', 'albums', NULL, 0, 'Image', '/admin/albums', 3),
(4, 'Categories', 'categories', NULL, 0, 'FolderOpen', '/admin/categories', 4),
(5, 'Roles & Permissions', 'roles', NULL, 0, 'Lock', '/admin/roles', 5),
(6, 'User Management', 'users', NULL, 0, 'Users', '/admin/users', 6),
(7, 'Action Logs', 'logs', NULL, 0, 'ActivitySquare', '/admin/action-logs', 7),
(8, 'Settings', 'settings', NULL, 0, 'Settings', '/admin/settings', 8),

-- Sub-modules for Albums
(9, 'All Albums', 'all-albums', 3, 1, 'Image', '/admin/albums', 1),
(10, 'Create Album', 'create-album', 3, 1, 'Plus', '/admin/albums/create', 2),

-- Sub-modules for Categories
(11, 'View Categories', 'view-categories', 4, 1, 'FolderOpen', '/admin/categories', 1),
(12, 'Create Category', 'create-category', 4, 1, 'Plus', '/admin/categories/create', 2),

-- Sub-modules for User Management
(13, 'User List', 'user-list', 6, 1, 'Users', '/admin/users/list', 1),
(14, 'User Roles', 'user-roles', 6, 1, 'Shield', '/admin/users/roles', 2),
(15, 'Access Privileges', 'access-privileges', 6, 1, 'Key', '/admin/users/access', 3);

-- Assign all permissions to role 17 (Manager)
INSERT INTO `role_module_permissions` (`role_id`, `module_id`, `permission_id`) VALUES
-- Main modules
(17, 1, 1), (17, 1, 2), (17, 1, 3), (17, 1, 4),
(17, 2, 1), (17, 2, 2), (17, 2, 3), (17, 2, 4),
(17, 3, 1), (17, 3, 2), (17, 3, 3), (17, 3, 4),
(17, 4, 1), (17, 4, 2), (17, 4, 3), (17, 4, 4),
(17, 5, 1), (17, 5, 2), (17, 5, 3), (17, 5, 4),
(17, 6, 1), (17, 6, 2), (17, 6, 3), (17, 6, 4),
(17, 7, 1), (17, 7, 2), (17, 7, 3), (17, 7, 4),
(17, 8, 1), (17, 8, 2), (17, 8, 3), (17, 8, 4),

-- Sub-modules
(17, 9, 1), (17, 9, 2), (17, 9, 3), (17, 9, 4),
(17, 10, 1), (17, 10, 2), (17, 10, 3), (17, 10, 4),
(17, 11, 1), (17, 11, 2), (17, 11, 3), (17, 11, 4),
(17, 12, 1), (17, 12, 2), (17, 12, 3), (17, 12, 4),
(17, 13, 1), (17, 13, 2), (17, 13, 3), (17, 13, 4),
(17, 14, 1), (17, 14, 2), (17, 14, 3), (17, 14, 4),
(17, 15, 1), (17, 15, 2), (17, 15, 3), (17, 15, 4);

-- Assign all permissions to role 1 (Admin) for all modules
INSERT INTO `role_module_permissions` (`role_id`, `module_id`, `permission_id`) VALUES
-- Main modules
(1, 1, 1), (1, 1, 2), (1, 1, 3), (1, 1, 4),
(1, 2, 1), (1, 2, 2), (1, 2, 3), (1, 2, 4),
(1, 3, 1), (1, 3, 2), (1, 3, 3), (1, 3, 4),
(1, 4, 1), (1, 4, 2), (1, 4, 3), (1, 4, 4),
(1, 5, 1), (1, 5, 2), (1, 5, 3), (1, 5, 4),
(1, 6, 1), (1, 6, 2), (1, 6, 3), (1, 6, 4),
(1, 7, 1), (1, 7, 2), (1, 7, 3), (1, 7, 4),
(1, 8, 1), (1, 8, 2), (1, 8, 3), (1, 8, 4),

-- Sub-modules
(1, 9, 1), (1, 9, 2), (1, 9, 3), (1, 9, 4),
(1, 10, 1), (1, 10, 2), (1, 10, 3), (1, 10, 4),
(1, 11, 1), (1, 11, 2), (1, 11, 3), (1, 11, 4),
(1, 12, 1), (1, 12, 2), (1, 12, 3), (1, 12, 4),
(1, 13, 1), (1, 13, 2), (1, 13, 3), (1, 13, 4),
(1, 14, 1), (1, 14, 2), (1, 14, 3), (1, 14, 4),
(1, 15, 1), (1, 15, 2), (1, 15, 3), (1, 15, 4);