# Fix for Internal Server Errors

## Issues Found

1. **ParseError in Routes.php** - Syntax error (unmatched braces)
2. **Unknown column 'admins.role_id'** - The admins table is missing the role_id column

## Solutions

### 1. Add role_id Column to admins Table

Run this SQL in phpMyAdmin:

```sql
ALTER TABLE `admins` ADD COLUMN `role_id` INT NULL AFTER `password`;
ALTER TABLE `admins` ADD CONSTRAINT `fk_admins_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL;
UPDATE `admins` SET `role_id` = 1 WHERE `role_id` IS NULL;
```

Or use the provided SQL file:
```
backend/sql/add_role_id_to_admins.sql
```

### 2. Verify Database Setup

After adding the column, verify:

```sql
-- Check admins table structure
DESCRIBE admins;

-- Check if role_id is present
SELECT id, username, role_id FROM admins LIMIT 5;

-- Check roles table
SELECT * FROM roles;
```

### 3. Clear Cache (if needed)

If errors persist, clear CodeIgniter cache:
- Delete files in `backend/writable/cache/`
- Delete files in `backend/writable/logs/`

## Testing

After applying the fix, test the API:

```bash
curl -X GET "http://localhost:8080/api/permissions/menu/1"
curl -X GET "http://localhost:8080/api/admin/captcha"
```

Both should return 200 OK responses.

## Summary

The main issue was that the `admins` table didn't have a `role_id` column, which is required for the role-based permission system. After adding this column and setting default values, all APIs should work correctly.
