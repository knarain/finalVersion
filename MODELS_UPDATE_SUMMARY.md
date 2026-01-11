# Permission Models Update Summary

## Models Updated

### 1. ModuleModel (`app/Models/ModuleModel.php`)
**Changes:**
- Added `url` to `allowedFields` array
- Removed `created_at` and `updated_at` from `allowedFields` (handled by timestamps)
- Kept all existing methods intact

**Key Methods:**
- `getMainModules()` - Get parent modules only
- `getSubModules($moduleId)` - Get sub-modules for a module
- `getMenuTree()` - Get full hierarchical menu structure
- `getBySlug($slug)` - Get module by slug
- `getAccessibleModules($roleId)` - Get modules accessible to a role

**Database Columns Used:**
- id, name, slug, parent_id, is_sub_module, icon, url, order, created_at, updated_at

---

### 2. RoleModel (`app/Models/RoleModel.php`)
**Changes:**
- No structural changes, all methods already aligned with database schema

**Key Methods:**
- `getActiveRoles()` - Get all active roles
- `getRoleWithPermissions($roleId)` - Get role with module IDs
- `getRolePermissions($roleId)` - Get all permissions for a role
- `hasModulePermission($roleId, $moduleId, $permissionId)` - Check if role has permission

**Database Columns Used:**
- id, name, description, is_active, created_at, updated_at

---

### 3. PermissionModel (`app/Models/PermissionModel.php`)
**Changes:**
- No structural changes, all methods already aligned with database schema

**Key Methods:**
- `getStandardPermissions()` - Get CRUD permissions
- `getBySlug($slug)` - Get permission by slug

**Database Columns Used:**
- id, name, slug, description, created_at, updated_at

---

### 4. RoleModulePermissionModel (`app/Models/RoleModulePermissionModel.php`)
**Changes:**
- No structural changes, all methods already aligned with database schema

**Key Methods:**
- `getModulePermissions($roleId, $moduleId)` - Get permissions for role/module
- `hasPermission($roleId, $moduleId, $permissionId)` - Check specific permission
- `removeModulePermissions($roleId, $moduleId)` - Remove all permissions for module
- `addPermissions($roleId, $moduleId, $permissionIds)` - Add multiple permissions

**Database Columns Used:**
- id, role_id, module_id, permission_id, created_at

---

## Database Schema Alignment

### Roles Table
```
id (INT) - Primary Key
name (VARCHAR) - Unique role name
description (TEXT) - Role description
is_active (TINYINT) - Active status
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Modules Table
```
id (INT) - Primary Key
name (VARCHAR) - Module name
slug (VARCHAR) - Unique slug
parent_id (INT) - Parent module ID (NULL for main modules)
is_sub_module (TINYINT) - Sub-module flag
icon (VARCHAR) - Icon name (e.g., "LayoutDashboard")
url (VARCHAR) - Route URL (e.g., "/admin/albums")
order (INT) - Display order
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Permissions Table
```
id (INT) - Primary Key
name (VARCHAR) - Permission name
slug (VARCHAR) - Unique slug (read, create, update, delete)
description (TEXT) - Permission description
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Role_Module_Permissions Table
```
id (INT) - Primary Key
role_id (INT) - Foreign Key to roles
module_id (INT) - Foreign Key to modules
permission_id (INT) - Foreign Key to permissions
created_at (TIMESTAMP)
UNIQUE (role_id, module_id, permission_id)
```

---

## Usage Examples

### Get Menu for Role
```php
$moduleModel = new ModuleModel();
$modules = $moduleModel->getAccessibleModules(17);
```

### Check Permission
```php
$rmpModel = new RoleModulePermissionModel();
$hasPermission = $rmpModel->hasPermission(17, 2, 1); // role 17, module 2, permission 1 (READ)
```

### Get Role Permissions
```php
$roleModel = new RoleModel();
$permissions = $roleModel->getRolePermissions(17);
```

### Assign Permissions
```php
$rmpModel = new RoleModulePermissionModel();
$rmpModel->addPermissions(17, 2, [1, 2, 3, 4]); // All CRUD permissions
```

---

## Notes
- All models use timestamps (created_at, updated_at)
- All models return arrays by default
- Foreign keys are properly configured with CASCADE delete
- Unique constraint on (role_id, module_id, permission_id) prevents duplicates
