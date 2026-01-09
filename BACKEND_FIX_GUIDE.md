# Backend Setup & Fix Guide

## 🐛 Issues Found & Fixed

### 1. ✅ Database Tables Missing
**Issue:** `Unknown column 'updated_at' in 'field list'`

**Cause:** The `admins` and `roles` tables didn't exist or were missing timestamp columns.

**Fix:** Created `backend/sql/create_permission_system_tables.sql` with:
- `roles` table with timestamps
- `modules` table with parent hierarchy support
- `permissions` table
- `role_module_permissions` junction table
- `admins` table modified with `updated_at` column

### 2. ✅ Route Ordering Issue
**Issue:** Routes with parameters like `roles/(:num)` were matching `roles/status/active`

**Cause:** CodeIgniter processes routes in order. The numeric pattern was matching before specific routes.

**Fix:** Reordered routes in `backend/app/Config/Routes.php`:
- Specific routes (`roles/status/active`) come FIRST
- GET single routes (`roles/(:num)`) come LAST
- POST/PUT/DELETE routes in between

---

## 🚀 Setup Instructions

### Step 1: Run Database Setup Script

```bash
# Navigate to backend directory
cd backend

# Option A: Using PHP CLI (Recommended)
php setup_database.php

# Option B: Manual MySQL import
mysql -u root -p gallery < sql/create_permission_system_tables.sql
```

**Expected Output:**
```
✓ Connected to database: gallery
✓ Executed: CREATE TABLE IF NOT EXISTS `roles`...
✓ Executed: CREATE TABLE IF NOT EXISTS `modules`...
... (more tables)
✓ Database setup complete! Executed 8 queries.
```

### Step 2: Verify Database Setup

```sql
-- Connect to your MySQL database
mysql -u root -p gallery

-- Check tables
SHOW TABLES;

-- Verify roles table
DESC roles;

-- Verify admins table
DESC admins;

-- Check default data
SELECT * FROM roles;
SELECT * FROM modules;
SELECT * FROM permissions;
```

### Step 3: Clear Cache (If Using Cache)

```bash
# Clear CodeIgniter cache
rm -rf backend/writable/cache/*

# Or if Windows PowerShell
Remove-Item "backend/writable/cache/*" -Recurse -Force
```

### Step 4: Test API Endpoints

```bash
# Get all roles
curl http://localhost:8000/api/roles

# Get active roles
curl http://localhost:8000/api/roles/status/active

# Get single role
curl http://localhost:8000/api/roles/1

# Get all permissions structure
curl http://localhost:8000/api/permissions

# Get users
curl http://localhost:8000/api/users
```

---

## 📋 What Was Created

### SQL File
**Location:** `backend/sql/create_permission_system_tables.sql`

**Tables Created:**
1. `roles` - Admin roles with timestamps
2. `modules` - System modules with hierarchy
3. `permissions` - Permission types (Create, Read, Update, Delete)
4. `role_module_permissions` - Role-permission assignments
5. `admins` - Admin users (modified with proper timestamps)

**Default Data:**
- 3 roles: Admin, Editor, Viewer
- 7 modules: Dashboard, Users, Roles & Permissions, Albums, Categories, Enquiries, Settings
- 4 permissions: Create, Read, Update, Delete
- Role-permission assignments for each role

### Setup Script
**Location:** `backend/setup_database.php`

**Purpose:** Automated database setup without manual SQL commands

**Usage:**
```bash
php backend/setup_database.php
```

### Route Fixes
**Location:** `backend/app/Config/Routes.php`

**Changes:**
- Reordered ROLE routes (specific routes first)
- Reordered USER routes (specific routes first)
- Reordered PERMISSION routes (specific routes first)

---

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. Check database connection
curl http://localhost:8000/api/roles

# 2. Check role creation
curl -X POST http://localhost:8000/api/roles \
  -H "Content-Type: application/json" \
  -d '{"name":"TestRole","description":"Test"}'

# 3. Check permissions endpoint
curl http://localhost:8000/api/permissions

# 4. Check users endpoint
curl http://localhost:8000/api/users

# 5. Check environment setup
php -i | grep -i "mysql\|pdo"
```

---

## 🔧 Troubleshooting

### Issue: "Unknown column" errors still appearing

**Solution:**
```bash
# 1. Clear all logs
rm backend/writable/logs/*

# 2. Re-run setup script
php backend/setup_database.php

# 3. Check database
mysql -u root -p gallery
DESCRIBE roles;  # Should show: id, name, description, is_active, created_at, updated_at
```

### Issue: "Table already exists" warnings

**Solution:** These are safe - the SQL uses `CREATE TABLE IF NOT EXISTS`. You can ignore them.

### Issue: Connection refused to MySQL

**Solution:**
1. Check MySQL is running: `mysql -u root -p`
2. Verify credentials in `.env` file
3. Update `.env` with correct credentials
4. Re-run setup script

### Issue: Routes still not working

**Solution:**
```bash
# 1. Clear CodeIgniter cache
rm -rf backend/writable/cache/*

# 2. Check Routes.php syntax
php -l backend/app/Config/Routes.php

# 3. Restart web server
# If using PHP built-in server:
php -S localhost:8000
```

---

## 📝 Database Schema Summary

### roles table
```
id (INT) - Primary Key
name (VARCHAR 100) - Unique
description (TEXT)
is_active (TINYINT) - Default 1
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### admins table
```
id (INT) - Primary Key
username (VARCHAR 100) - Unique
email (VARCHAR 255) - Unique
password_hash (VARCHAR 255)
role_id (INT) - Foreign Key to roles
is_active (TINYINT) - Default 1
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### modules table
```
id (INT) - Primary Key
name (VARCHAR 100)
slug (VARCHAR 100) - Unique
parent_module_id (INT) - Self-referencing for hierarchy
is_sub_module (TINYINT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### permissions table
```
id (INT) - Primary Key
name (VARCHAR 100)
slug (VARCHAR 100) - Unique
description (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### role_module_permissions table
```
id (INT) - Primary Key
role_id (INT) - Foreign Key
module_id (INT) - Foreign Key
permission_id (INT) - Foreign Key
created_at (TIMESTAMP)
Unique: (role_id, module_id, permission_id)
```

---

## 🎯 Next Steps

1. ✅ Run the setup script
2. ✅ Verify database tables created
3. ✅ Test API endpoints
4. ✅ Check logs for any errors
5. ✅ Start frontend and test integration
6. ✅ Create test users and roles

---

## 📞 Support

If you encounter issues:

1. Check `backend/writable/logs/` for error details
2. Verify MySQL is running and accessible
3. Confirm `.env` database credentials are correct
4. Re-run `php setup_database.php`
5. Clear cache: `rm -rf backend/writable/cache/*`
6. Test with `curl` commands above

---

**Status:** ✅ Setup Ready  
**Last Updated:** January 9, 2026  
**Issues Fixed:** 2 (Database & Routes)
