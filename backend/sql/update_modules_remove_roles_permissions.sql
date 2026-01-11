-- Update modules table to remove Roles & Permissions and update User Management sub-modules

-- Delete the old Roles & Permissions module and its sub-modules
DELETE FROM `role_module_permissions` WHERE `module_id` IN (5, 14, 15);
DELETE FROM `modules` WHERE `id` IN (5, 14, 15);

-- Update module IDs for User Management sub-modules (renumber them)
-- First, delete old sub-modules
DELETE FROM `role_module_permissions` WHERE `module_id` IN (13);
DELETE FROM `modules` WHERE `id` IN (13);

-- Insert updated User Management sub-modules with correct IDs
INSERT INTO `modules` (`id`, `name`, `slug`, `parent_id`, `is_sub_module`, `icon`, `url`, `order`) VALUES
(13, 'User List', 'user-list', 6, 1, 'Users', '/admin/users/list', 1),
(14, 'User Roles', 'user-roles', 6, 1, 'Shield', '/admin/users/roles', 2),
(15, 'Access Privileges', 'access-privileges', 6, 1, 'Key', '/admin/users/access', 3);

-- Assign permissions for new User Management sub-modules to role 17 (Manager)
INSERT INTO `role_module_permissions` (`role_id`, `module_id`, `permission_id`) VALUES
(17, 13, 1), (17, 13, 2), (17, 13, 3), (17, 13, 4),
(17, 14, 1), (17, 14, 2), (17, 14, 3), (17, 14, 4),
(17, 15, 1), (17, 15, 2), (17, 15, 3), (17, 15, 4);

-- Assign permissions for new User Management sub-modules to role 1 (Admin)
INSERT INTO `role_module_permissions` (`role_id`, `module_id`, `permission_id`) VALUES
(1, 13, 1), (1, 13, 2), (1, 13, 3), (1, 13, 4),
(1, 14, 1), (1, 14, 2), (1, 14, 3), (1, 14, 4),
(1, 15, 1), (1, 15, 2), (1, 15, 3), (1, 15, 4);
