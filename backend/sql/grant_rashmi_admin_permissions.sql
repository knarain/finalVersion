-- ========================================
-- GRANT FULL ADMIN PERMISSIONS TO "rashmi" USER
-- ========================================

-- Step 1: Check if rashmi user exists and assign Admin role (ID: 1)
UPDATE `admins` 
SET `role_id` = 1, `is_active` = 1 
WHERE `username` = 'rashmi';

-- Step 2: Verify the admin was updated
-- SELECT * FROM `admins` WHERE `username` = 'rashmi';

-- Step 3: Grant all permissions for Admin role on all modules
-- This ensures rashmi has full access to all features

-- Get the role_id for rashmi
SET @admin_id = (SELECT `id` FROM `admins` WHERE `username` = 'rashmi');
SET @role_id = (SELECT `role_id` FROM `admins` WHERE `username` = 'rashmi');

-- If role_id is null or not admin, update it
IF @role_id IS NULL OR @role_id != 1 THEN
    UPDATE `admins` 
    SET `role_id` = 1 
    WHERE `username` = 'rashmi';
    SET @role_id = 1;
END IF;

-- Step 4: Grant ALL permissions for all modules to the Admin role
-- This is an INSERT IGNORE to avoid duplicate key errors

INSERT IGNORE INTO `role_module_permissions` (`role_id`, `module_id`, `permission_id`) VALUES
-- Admin role (1) - all permissions on all modules
(1, 1, 1), (1, 1, 2), (1, 1, 3), (1, 1, 4),  -- Dashboard: Create, Read, Update, Delete
(1, 2, 1), (1, 2, 2), (1, 2, 3), (1, 2, 4),  -- Users: Create, Read, Update, Delete
(1, 3, 1), (1, 3, 2), (1, 3, 3), (1, 3, 4),  -- Roles & Permissions: Create, Read, Update, Delete
(1, 4, 1), (1, 4, 2), (1, 4, 3), (1, 4, 4),  -- Albums: Create, Read, Update, Delete
(1, 5, 1), (1, 5, 2), (1, 5, 3), (1, 5, 4),  -- Categories: Create, Read, Update, Delete
(1, 6, 1), (1, 6, 2), (1, 6, 3), (1, 6, 4),  -- Enquiries: Create, Read, Update, Delete
(1, 7, 1), (1, 7, 2), (1, 7, 3), (1, 7, 4);  -- Settings: Create, Read, Update, Delete

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify rashmi has Admin role assigned
-- SELECT `id`, `username`, `email`, `role_id`, `is_active` FROM `admins` WHERE `username` = 'rashmi';

-- Verify Admin role permissions
-- SELECT 
--     r.`name` as role_name,
--     m.`name` as module_name,
--     p.`name` as permission_name
-- FROM `role_module_permissions` rmp
-- JOIN `roles` r ON r.`id` = rmp.`role_id`
-- JOIN `modules` m ON m.`id` = rmp.`module_id`
-- JOIN `permissions` p ON p.`id` = rmp.`permission_id`
-- WHERE r.`id` = 1
-- ORDER BY m.`name`, p.`name`;

-- ========================================
-- QUICK SUMMARY
-- ========================================
-- This script:
-- 1. Assigns the "Admin" role (ID: 1) to the rashmi user
-- 2. Ensures rashmi is marked as active (is_active = 1)
-- 3. Grants ALL permissions (Create, Read, Update, Delete) on ALL modules (Dashboard, Users, Roles, Albums, Categories, Enquiries, Settings)
-- 4. The INSERT IGNORE prevents duplicate key errors if permissions already exist
-- 
-- After running this, rashmi will have full administrative access to all features.
-- ========================================
