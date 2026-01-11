-- ========================================
-- UPDATED PERMISSION SYSTEM FOR YOUR MODULES
-- ========================================

-- Update modules table structure
ALTER TABLE `modules` 
CHANGE COLUMN `parent_module_id` `parent_id` INT NULL,
ADD COLUMN `icon` VARCHAR(50) DEFAULT NULL AFTER `is_sub_module`,
ADD COLUMN `url` VARCHAR(255) DEFAULT NULL AFTER `icon`,
ADD COLUMN `order` INT DEFAULT 0 AFTER `url`;

-- Clear existing modules and insert your structure
DELETE FROM `role_module_permissions`;
DELETE FROM `modules`;

-- Insert main modules and sub-modules according to your structure
INSERT INTO `modules` (`id`, `name`, `slug`, `parent_id`, `is_sub_module`, `icon`, `url`, `order`) VALUES
-- Main Modules
(2, 'Customers', 'customers', NULL, 0, 'users', '/customers', 1),
(4, 'Billing', 'billing', NULL, 0, 'credit-card', '/billing', 2),
(9, 'Reports', 'reports', NULL, 0, 'bar-chart', '/reports', 3),
(13, 'Supports', 'supports', NULL, 0, 'headphones', '/support', 4),
(14, 'User Management', 'user-management', NULL, 0, 'user-cog', '/users', 5),
(18, 'Settings', 'settings', NULL, 0, 'settings', '/settings', 6),

-- Sub-modules for Customers
(3, 'Customer List', 'customer-list', 2, 1, 'list', '/customers/list', 1),

-- Sub-modules for Billing
(5, 'Billing Information', 'billing-information', 4, 1, 'info', '/billing/info', 1),
(6, 'Payment Details', 'payment-details', 4, 1, 'credit-card', '/billing/payments', 2),
(7, 'Invoice', 'invoice', 4, 1, 'file-text', '/billing/invoices', 3),
(8, 'Create Invoice', 'create-invoice', 4, 1, 'plus', '/billing/create-invoice', 4),

-- Sub-modules for Reports
(10, 'Revenue', 'revenue', 9, 1, 'dollar-sign', '/reports/revenue', 1),
(11, 'User logs', 'user-logs', 9, 1, 'activity', '/reports/user-logs', 2),
(25, 'Customer logs', 'customer-logs', 9, 1, 'user-check', '/reports/customer-logs', 3),

-- Sub-modules for Supports
(21, 'Manage Tickets', 'manage-tickets', 13, 1, 'ticket', '/support/tickets', 1),
(22, 'Create Tickets', 'create-tickets', 13, 1, 'plus-circle', '/support/create-ticket', 2),
(23, 'Tickets Categories', 'tickets-categories', 13, 1, 'folder', '/support/categories', 3),
(24, 'Create Categories', 'create-categories', 13, 1, 'folder-plus', '/support/create-category', 4),
(26, 'Predefined Replies', 'predefined-replies', 13, 1, 'message-circle', '/support/replies', 5),

-- Sub-modules for User Management
(15, 'User List', 'user-list', 14, 1, 'users', '/users/list', 1),
(16, 'User Role', 'user-role', 14, 1, 'shield', '/users/roles', 2),
(17, 'Access Privileges', 'access-privileges', 14, 1, 'key', '/users/privileges', 3),

-- Sub-modules for Settings
(19, 'Plans', 'plans', 18, 1, 'package', '/settings/plans', 1),
(20, 'Promocode', 'promocode', 18, 1, 'tag', '/settings/promocodes', 2);

-- Insert role 17 if it doesn't exist
INSERT IGNORE INTO `roles` (`id`, `name`, `description`, `is_active`) VALUES
(17, 'Manager', 'Manager role with specific permissions', 1);

-- Assign all permissions (1,2,3,4) to role 17 for all modules
INSERT IGNORE INTO `role_module_permissions` (`role_id`, `module_id`, `permission_id`) VALUES
-- Main modules
(17, 2, 1), (17, 2, 2), (17, 2, 3), (17, 2, 4),
(17, 4, 1), (17, 4, 2), (17, 4, 3), (17, 4, 4),
(17, 9, 1), (17, 9, 2), (17, 9, 3), (17, 9, 4),
(17, 13, 1), (17, 13, 2), (17, 13, 3), (17, 13, 4),
(17, 14, 1), (17, 14, 2), (17, 14, 3), (17, 14, 4),
(17, 18, 1), (17, 18, 2), (17, 18, 3), (17, 18, 4),

-- Sub-modules
(17, 3, 1), (17, 3, 2), (17, 3, 3), (17, 3, 4),
(17, 5, 1), (17, 5, 2), (17, 5, 3), (17, 5, 4),
(17, 6, 1), (17, 6, 2), (17, 6, 3), (17, 6, 4),
(17, 7, 1), (17, 7, 2), (17, 7, 3), (17, 7, 4),
(17, 8, 1), (17, 8, 2), (17, 8, 3), (17, 8, 4),
(17, 10, 1), (17, 10, 2), (17, 10, 3), (17, 10, 4),
(17, 11, 1), (17, 11, 2), (17, 11, 3), (17, 11, 4),
(17, 25, 1), (17, 25, 2), (17, 25, 3), (17, 25, 4),
(17, 21, 1), (17, 21, 2), (17, 21, 3), (17, 21, 4),
(17, 22, 1), (17, 22, 2), (17, 22, 3), (17, 22, 4),
(17, 23, 1), (17, 23, 2), (17, 23, 3), (17, 23, 4),
(17, 24, 1), (17, 24, 2), (17, 24, 3), (17, 24, 4),
(17, 26, 1), (17, 26, 2), (17, 26, 3), (17, 26, 4),
(17, 15, 1), (17, 15, 2), (17, 15, 3), (17, 15, 4),
(17, 16, 1), (17, 16, 2), (17, 16, 3), (17, 16, 4),
(17, 17, 1), (17, 17, 2), (17, 17, 3), (17, 17, 4),
(17, 19, 1), (17, 19, 2), (17, 19, 3), (17, 19, 4),
(17, 20, 1), (17, 20, 2), (17, 20, 3), (17, 20, 4);