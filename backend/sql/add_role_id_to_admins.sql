-- Add role_id column to admins table if it doesn't exist
ALTER TABLE `admins` ADD COLUMN `role_id` INT NULL AFTER `password`;

-- Add foreign key constraint
ALTER TABLE `admins` ADD CONSTRAINT `fk_admins_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL;

-- Set default role for existing admins (role 1 = Admin)
UPDATE `admins` SET `role_id` = 1 WHERE `role_id` IS NULL;
