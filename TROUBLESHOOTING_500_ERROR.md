# Internal Server Error - Troubleshooting Guide

## Issue
Getting 500 Internal Server Error when calling `/api/permissions/menu/{roleId}`

## Possible Causes

### 1. Database Tables Not Created
The permission tables may not exist in the database.

**Solution:** Run the SQL script to create tables:
```bash
# In phpMyAdmin or MySQL client, run:
SOURCE backend/sql/recreate_permission_tables.sql;
```

### 2. No Data in Tables
Tables exist but have no data.

**Solution:** Verify data exists:
```sql
-- Check if role 1 exists
SELECT * FROM roles WHERE id = 1;

-- Check if modules exist
SELECT COUNT(*) FROM modules;

-- Check if permissions exist
SELECT COUNT(*) FROM permissions;

-- Check if role_module_permissions exist for role 1
SELECT COUNT(*) FROM role_module_permissions WHERE role_id = 1;
```

### 3. Database Connection Issue
Database connection might be failing.

**Solution:** Check `.env` file has correct database credentials:
```
database.default.hostname = localhost
database.default.database = your_db_name
database.default.username = your_user
database.default.password = your_password
```

## Quick Fix Steps

1. **Verify Database Tables Exist:**
```sql
SHOW TABLES LIKE 'roles';
SHOW TABLES LIKE 'modules';
SHOW TABLES LIKE 'permissions';
SHOW TABLES LIKE 'role_module_permissions';
```

2. **Run SQL Script:**
```sql
SOURCE backend/sql/recreate_permission_tables.sql;
```

3. **Verify Data:**
```sql
SELECT * FROM roles;
SELECT * FROM modules LIMIT 5;
SELECT * FROM permissions;
SELECT COUNT(*) FROM role_module_permissions;
```

4. **Test API:**
```bash
curl -X GET "http://localhost:8080/api/permissions/menu/1"
```

## Expected Response

```json
{
  "status": "success",
  "message": "Menu structure fetched successfully",
  "data": [
    {
      "role_id": "1",
      "module_info": {
        "id": 1,
        "name": "Dashboard",
        "is_sub_module": false,
        "permissions": [1, 2, 3, 4],
        "icon": "LayoutDashboard",
        "url": "/admin"
      },
      "sub_module_info": []
    }
  ],
  "code": 200
}
```

## If Still Getting Error

1. Check server error logs: `backend/writable/logs/`
2. Enable debug mode in `.env`: `CI_ENVIRONMENT = development`
3. Check database user has proper permissions
4. Verify all foreign keys are properly set up

## Database Setup Command

```sql
-- Drop and recreate all permission tables
DROP TABLE IF EXISTS `role_module_permissions`;
DROP TABLE IF EXISTS `modules`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;

-- Then run the full SQL script from:
-- backend/sql/recreate_permission_tables.sql
```
