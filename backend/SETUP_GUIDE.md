# Backend Permission System - Setup & Implementation Guide

## Summary of Changes

### New Files Created:

1. **Controllers**
   - `app/Controllers/Api/RoleController.php` - Role management (Create, Read, Update, Delete, Activate/Deactivate)
   - `app/Controllers/Api/UserController.php` - Admin user management
   - `app/Controllers/Api/PermissionController.php` - Updated with comprehensive permission endpoints

2. **Models**
   - `app/Models/RoleModel.php` - Updated with helper methods
   - `app/Models/AdminModel.php` - Updated to support role assignment
   - `app/Models/ModuleModel.php` - Updated with hierarchy support
   - `app/Models/PermissionModel.php` - Updated with permission methods
   - `app/Models/RoleModulePermissionModel.php` - Updated with batch operations

3. **Database**
   - `app/Database/Migrations/2025_01_09_000001_CreatePermissionTables.php` - Complete schema migration
   - `app/Database/Seeds/PermissionSeeder.php` - Initial data seeder

4. **Libraries & Helpers**
   - `app/Libraries/PermissionHelper.php` - Helper class for permission checking in code
   - `app/Filters/PermissionFilter.php` - Middleware for route-level permission checking

5. **Documentation**
   - `PERMISSION_SYSTEM_DOCS.md` - Complete API documentation
   - `app/Config/Routes.php` - Updated routes configuration

---

## Step-by-Step Setup

### 1. Run Database Migration

```bash
cd backend
php spark migrate
```

This will create:
- `modules` table
- `permissions` table
- `roles` table
- `role_module_permissions` table
- Add `role_id` and `is_active` columns to `admins` table

### 2. Run Database Seeder (Optional but Recommended)

```bash
php spark db:seed PermissionSeeder
```

This will create:
- 4 standard permissions: Create, Read, Update, Delete
- 7 default modules: Dashboard, Users, Roles & Permissions, Albums, Categories, Enquiries, Settings
- 1 Super Admin role with full access to all modules/permissions

### 3. Test the API Endpoints

Start your PHP server:
```bash
php spark serve
```

---

## API Usage Examples

### 1. Create a Role

```bash
curl -X POST http://localhost:8080/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Editor",
    "description": "Can manage albums and categories"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Role created successfully",
  "data": {
    "id": 2,
    "name": "Editor",
    "description": "Can manage albums and categories",
    "is_active": 1
  },
  "code": 201
}
```

### 2. Assign Permissions to Role

Assign Create, Read, and Update permissions for Albums module to Editor role:

```bash
curl -X POST http://localhost:8080/api/permissions/assign \
  -H "Content-Type: application/json" \
  -d '{
    "role_id": 2,
    "module_id": 4,
    "permission_ids": [1, 2, 3]
  }'
```

Or bulk assign to multiple modules:

```bash
curl -X POST http://localhost:8080/api/permissions/assign-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "role_id": 2,
    "assignments": [
      {
        "module_id": 1,
        "permission_ids": [2]
      },
      {
        "module_id": 4,
        "permission_ids": [1, 2, 3]
      },
      {
        "module_id": 5,
        "permission_ids": [1, 2, 3, 4]
      }
    ]
  }'
```

### 3. Create Admin User

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "editor_user",
    "email": "editor@example.com",
    "password": "SecurePassword123!",
    "role_id": 2
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": 3,
    "username": "editor_user",
    "email": "editor@example.com",
    "role_id": 2,
    "role_name": "Editor",
    "is_active": 1
  },
  "code": 201
}
```

### 4. Manage User (Examples)

#### Change User Password
```bash
curl -X POST http://localhost:8080/api/users/3/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "SecurePassword123!",
    "new_password": "NewPassword456!"
  }'
```

#### Reset User Password (Admin Action)
```bash
curl -X POST http://localhost:8080/api/users/3/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "new_password": "ResetPassword789!"
  }'
```

#### Assign Different Role
```bash
curl -X PATCH http://localhost:8080/api/users/3/assign-role \
  -H "Content-Type: application/json" \
  -d '{ "role_id": 3 }'
```

#### Deactivate User (Keeps account, just disables access)
```bash
curl -X PATCH http://localhost:8080/api/users/3/toggle-status
```

#### Update User Email
```bash
curl -X PUT http://localhost:8080/api/users/3 \
  -H "Content-Type: application/json" \
  -d '{ "email": "newemail@example.com" }'
```

#### Delete User (Permanent removal)
```bash
curl -X DELETE http://localhost:8080/api/users/3
```

### 5. Get Lists

#### List All Roles
```bash
curl http://localhost:8080/api/roles
```

#### List All Users (Paginated)
```bash
curl "http://localhost:8080/api/users?page=1&per_page=10"
```

#### Get User Details
```bash
curl http://localhost:8080/api/users/3
```

#### Get All Permissions with Structure
```bash
curl http://localhost:8080/api/permissions
```

---

## Database Schema Overview

### modules table
```sql
CREATE TABLE modules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  slug VARCHAR(100) UNIQUE,
  parent_id INT NULLABLE,
  is_sub_module TINYINT,
  icon VARCHAR(100),
  order INT,
  created_at DATETIME,
  updated_at DATETIME
);
```

### permissions table
```sql
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  slug VARCHAR(100) UNIQUE,
  description TEXT,
  created_at DATETIME,
  updated_at DATETIME
);
```

### roles table
```sql
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE,
  description TEXT,
  is_active TINYINT DEFAULT 1,
  created_at DATETIME,
  updated_at DATETIME
);
```

### role_module_permissions table (Junction/Bridge)
```sql
CREATE TABLE role_module_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT,
  module_id INT,
  permission_id INT,
  created_at DATETIME,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (module_id) REFERENCES modules(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);
```

### admins table (modified)
```sql
ALTER TABLE admins ADD COLUMN role_id INT NULLABLE;
ALTER TABLE admins ADD COLUMN is_active TINYINT DEFAULT 1;
```

---

## Key Features Implemented

### 1. Role Management ✓
- Create roles with name and description
- Update role details
- Activate/Deactivate roles (soft disable)
- Delete roles (with validation - can't delete if users exist)
- View role with all assigned permissions

### 2. Module Organization ✓
- Hierarchical module structure (parent-child)
- Module ordering
- Icon support for UI display
- Get all modules for a role

### 3. Permission Assignment ✓
- Assign specific permissions to roles for modules
- Bulk assign permissions (multiple modules at once)
- Remove specific permission
- Check if user has permission
- Standard CRUD permissions: Create, Read, Update, Delete

### 4. Admin User Management ✓
- Create new admin users
- Edit user email
- Assign/change user roles
- User password management:
  - User can change own password (old password required)
  - Admin can reset user password
- Activate/Deactivate users (maintains history)
- Delete users
- List users with pagination
- Filter active users

### 5. Permission Checking ✓
- PermissionHelper library for checking permissions in code
- Check single permission
- Check any/all of multiple permissions
- Get accessible modules for user
- Get specific module permissions

---

## How It Works

### Permission Flow:

1. **Admin creates a Role** → Role is created and ready for permission assignment

2. **Admin assigns Modules & Permissions to Role** → Role now has access to specific modules with specific actions

3. **Admin creates Admin User** → User is created without role initially

4. **Admin assigns Role to User** → User now inherits all permissions from the role

5. **User logs in** → System can check if user has permission to access specific modules/actions

### Example Scenario:

```
1. Create Role "Album Editor"
   └─ POST /api/roles
   
2. Assign Permissions to "Album Editor"
   └─ POST /api/permissions/assign-bulk
   ├─ Albums Module: [Create, Read, Update] permissions
   ├─ Categories Module: [Read] permissions
   └─ Dashboard Module: [Read] permissions
   
3. Create Admin User "john_editor"
   └─ POST /api/users
   
4. Assign Role to "john_editor"
   └─ PATCH /api/users/{id}/assign-role
   └─ John can now Create, Read, Update albums
   └─ John can only Read categories
   └─ John can only Read dashboard
   
5. Admin can later:
   ├─ Change John's password
   ├─ Change John's role to different role
   ├─ Deactivate John (account exists but can't login)
   ├─ Reactivate John
   └─ Delete John completely
```

---

## Using PermissionHelper in Code

```php
<?php
namespace App\Controllers\Api;

use App\Libraries\PermissionHelper;

class SomeController extends BaseController {
    
    protected PermissionHelper $permHelper;
    
    public function __construct() {
        $this->permHelper = new PermissionHelper();
    }
    
    public function protectedAction($userId) {
        // Check if user has permission
        if (!$this->permHelper->hasPermission($userId, $moduleId, $permissionId)) {
            return response()
                ->setStatusCode(403)
                ->setJSON(['error' => 'Access denied']);
        }
        
        // User has permission, continue with logic
        // ...
    }
    
    public function getMenuForUser($userId) {
        // Get only accessible modules for user
        $modules = $this->permHelper->getAccessibleModules($userId);
        return $modules;
    }
}
```

---

## Frontend Integration Notes

The frontend will need to:

1. **Permissions Management Page**
   - Display all roles
   - Create/Edit/Delete roles
   - For each role, show modules and permission checkboxes
   - Save permission assignments

2. **User Management Page**
   - List all users
   - Create new user (with role selection)
   - Edit user (email, role)
   - Manage password (change/reset)
   - Activate/Deactivate user
   - Delete user

3. **Dynamic Navigation**
   - After login, fetch accessible modules for logged-in user
   - Show only permitted menu items
   - Disable/hide actions user doesn't have permission for

---

## Security Considerations

- Passwords are hashed using bcrypt (PASSWORD_BCRYPT)
- Permissions are checked at controller level
- Roles and users can be soft-disabled without deletion
- All API responses include proper HTTP status codes
- Input validation on all endpoints
- Foreign key constraints ensure data integrity

---

## Next Steps for Frontend

1. Create Permission Management page component
2. Create User Management page component
3. Implement login flow to fetch user roles/permissions
4. Dynamically generate navigation based on permissions
5. Guard routes based on user permissions

---

## Troubleshooting

### Migration Failed?
Make sure `admins` table exists. If not, check your existing migration files.

### Routes Not Working?
Clear the route cache: `php spark route:clear`

### Database Tables Not Created?
Check `writable/logs` folder for migration errors.

### Permission Check Returns False?
1. Verify role is active (`is_active = 1`)
2. Verify user is active (`is_active = 1`)
3. Verify permission exists in `role_module_permissions` table

---

## File Locations

```
backend/
├── app/
│   ├── Controllers/Api/
│   │   ├── RoleController.php           ← NEW
│   │   ├── UserController.php           ← NEW
│   │   ├── PermissionController.php     ← UPDATED
│   ├── Models/
│   │   ├── RoleModel.php                ← UPDATED
│   │   ├── AdminModel.php               ← UPDATED
│   │   ├── ModuleModel.php              ← UPDATED
│   │   ├── PermissionModel.php          ← UPDATED
│   │   ├── RoleModulePermissionModel.php ← UPDATED
│   ├── Database/
│   │   ├── Migrations/
│   │   │   └── 2025_01_09_000001_CreatePermissionTables.php ← NEW
│   │   └── Seeds/
│   │       └── PermissionSeeder.php     ← NEW
│   ├── Libraries/
│   │   └── PermissionHelper.php         ← NEW
│   ├── Filters/
│   │   └── PermissionFilter.php         ← NEW
│   ├── Config/
│   │   └── Routes.php                   ← UPDATED
├── PERMISSION_SYSTEM_DOCS.md            ← NEW (Detailed API Docs)
```

---

## Testing with cURL

All endpoints are ready to use. Refer to the examples above or check `PERMISSION_SYSTEM_DOCS.md` for complete endpoint documentation.

**Start simple:**
```bash
# 1. Get all roles
curl http://localhost:8080/api/roles

# 2. Get all permissions structure
curl http://localhost:8080/api/permissions

# 3. Try creating a role
curl -X POST http://localhost:8080/api/roles \
  -H "Content-Type: application/json" \
  -d '{"name": "Viewer", "description": "Read-only access"}'
```

---

## Complete! ✓

Your backend role-based permission system is now ready. You can:
- ✓ Create and manage roles
- ✓ Assign modules and permissions to roles
- ✓ Create admin users
- ✓ Assign roles to users
- ✓ Change user passwords
- ✓ Activate/deactivate users
- ✓ Check user permissions programmatically
