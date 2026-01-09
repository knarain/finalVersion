# Role-Based Permission System - Backend Documentation

## Overview

This is a comprehensive role-based permission system that manages:
- **Roles**: Define roles like "Super Admin", "Editor", "Viewer"
- **Modules**: Define modules like "Users", "Albums", "Categories"
- **Permissions**: Standard CRUD operations (Create, Read, Update, Delete)
- **Role-Module-Permission Mapping**: Assign specific permissions to roles for modules
- **Admin Users**: Create admin users and assign roles to them

## Database Schema

### Tables

#### 1. `modules`
- `id` (INT, PK, auto_increment)
- `name` (VARCHAR 100)
- `slug` (VARCHAR 100, unique)
- `parent_id` (INT, FK, nullable) - For hierarchical modules
- `is_sub_module` (TINYINT) - Boolean flag
- `icon` (VARCHAR 100, nullable)
- `order` (INT) - For sorting
- `created_at`, `updated_at` (DATETIME)

#### 2. `permissions`
- `id` (INT, PK, auto_increment)
- `name` (VARCHAR 100) - e.g., "Create", "Read", "Update", "Delete"
- `slug` (VARCHAR 100, unique) - e.g., "create", "read", "update", "delete"
- `description` (TEXT, nullable)
- `created_at`, `updated_at` (DATETIME)

#### 3. `roles`
- `id` (INT, PK, auto_increment)
- `name` (VARCHAR 100, unique)
- `description` (TEXT, nullable)
- `is_active` (TINYINT) - 1 = active, 0 = inactive
- `created_at`, `updated_at` (DATETIME)

#### 4. `role_module_permissions`
- `id` (INT, PK, auto_increment)
- `role_id` (INT, FK)
- `module_id` (INT, FK)
- `permission_id` (INT, FK)
- `created_at` (DATETIME)

#### 5. `admins` (modified)
- `id` (INT, PK, auto_increment)
- `role_id` (INT, FK, nullable) - Links to roles table
- `username` (VARCHAR)
- `email` (VARCHAR, nullable)
- `password_hash` (VARCHAR)
- `watch_word` (VARCHAR, nullable)
- `is_active` (TINYINT) - 1 = active, 0 = inactive
- `two_factor_enabled` (TINYINT)
- `created_at`, `updated_at` (DATETIME)

## API Endpoints

### Role Management

#### 1. Get All Roles
```
GET /api/roles
Response: [ { id, name, description, is_active } ]
```

#### 2. Get Single Role
```
GET /api/roles/{id}
Response: { id, name, description, is_active }
```

#### 3. Create Role
```
POST /api/roles
Body: { 
  "name": "Editor",
  "description": "Can edit content"
}
Response: { id, name, description, is_active }
```

#### 4. Update Role
```
PUT /api/roles/{id}
Body: { 
  "name": "Editor Updated",
  "description": "Updated description",
  "is_active": true/false
}
Response: { id, name, description, is_active }
```

#### 5. Delete Role
```
DELETE /api/roles/{id}
Response: { message: "Role deleted successfully" }
Note: Cannot delete if admins are using this role
```

#### 6. Toggle Role Status
```
PATCH /api/roles/{id}/toggle-status
Response: { is_active: boolean }
```

#### 7. Get Active Roles Only
```
GET /api/roles/status/active
Response: [ { id, name, description, is_active } ]
```

---

### User (Admin) Management

#### 1. List All Users (Paginated)
```
GET /api/users?page=1&per_page=10
Response: { 
  users: [ { id, username, email, role_name, is_active } ],
  pagination: { page, per_page, total, total_pages }
}
```

#### 2. Get Single User
```
GET /api/users/{id}
Response: { id, username, email, role_id, role_name, is_active }
```

#### 3. Create New Admin User
```
POST /api/users
Body: {
  "username": "john_admin",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role_id": 1
}
Response: { id, username, email, role_id, role_name, is_active }
```

#### 4. Update User Details
```
PUT /api/users/{id}
Body: {
  "email": "newemail@example.com",
  "role_id": 2
}
Response: { id, username, email, role_id, role_name, is_active }
```

#### 5. Change User Password (User's own)
```
POST /api/users/{id}/change-password
Body: {
  "old_password": "CurrentPassword123",
  "new_password": "NewPassword123"
}
Response: { message: "Password changed successfully" }
```

#### 6. Reset User Password (Admin action)
```
POST /api/users/{id}/reset-password
Body: {
  "new_password": "NewPassword123"
}
Response: { message: "Password reset successfully" }
```

#### 7. Assign Role to User
```
PATCH /api/users/{id}/assign-role
Body: {
  "role_id": 2
}
Response: { id, username, role_id, role_name, is_active }
```

#### 8. Toggle User Active Status
```
PATCH /api/users/{id}/toggle-status
Response: { id, is_active: boolean }
```

#### 9. Delete User
```
DELETE /api/users/{id}
Response: { message: "User deleted successfully" }
```

#### 10. Get Active Users Only
```
GET /api/users/status/active
Response: [ { id, username, email, role_name, is_active } ]
```

---

### Permission Management

#### 1. Get All Permissions with Structure
```
GET /api/permissions
Response: {
  roles: [ { id, name, description, is_active } ],
  modules: [ { id, name, slug, parent_id, icon, order, sub_modules } ],
  permissions: [ { id, name, slug, description } ],
  assigned: { 
    role_id: { 
      module_id: [permission_ids]
    }
  }
}
```

#### 2. Get Role Permissions
```
GET /api/permissions/role/{role_id}
Response: {
  role: { id, name, description, is_active },
  permissions: [ { role_id, module_id, permission_id, permission_name } ],
  modules: [ { id, name, slug, parent_id } ]
}
```

#### 3. Assign Permissions to Role for a Module
```
POST /api/permissions/assign
Body: {
  "role_id": 2,
  "module_id": 1,
  "permission_ids": [1, 2, 3]  // IDs of Create, Read, Update
}
Response: { message: "Permissions assigned successfully to role" }
```

#### 4. Bulk Assign Permissions to Role
```
POST /api/permissions/assign-bulk
Body: {
  "role_id": 2,
  "assignments": [
    {
      "module_id": 1,
      "permission_ids": [1, 2, 3]  // Create, Read, Update for Dashboard
    },
    {
      "module_id": 2,
      "permission_ids": [1, 2, 3, 4]  // All CRUD for Users
    }
  ]
}
Response: { message: "Bulk permissions assigned successfully" }
```

#### 5. Remove Specific Permission from Role
```
DELETE /api/permissions/{role_id}/{module_id}/{permission_id}
Response: { message: "Permission removed successfully" }
```

#### 6. Check if User Has Permission
```
POST /api/permissions/check
Body: {
  "role_id": 2,
  "module_id": 1,
  "permission_id": 1
}
Response: { has_permission: true/false }
```

---

## Implementation Flow

### Step 1: Create a Role
```bash
curl -X POST http://localhost:8080/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Editor",
    "description": "Can edit albums and categories"
  }'
```

### Step 2: Assign Modules & Permissions to Role
```bash
curl -X POST http://localhost:8080/api/permissions/assign-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "role_id": 2,
    "assignments": [
      {
        "module_id": 1,
        "permission_ids": [2]  // Read dashboard only
      },
      {
        "module_id": 4,
        "permission_ids": [1, 2, 3]  // Create, Read, Update albums
      },
      {
        "module_id": 5,
        "permission_ids": [1, 2, 3, 4]  // Full access to categories
      }
    ]
  }'
```

### Step 3: Create Admin User
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "editor1",
    "email": "editor@example.com",
    "password": "SecurePassword123",
    "role_id": 2
  }'
```

### Step 4: Manage User
```bash
# Change user password
curl -X POST http://localhost:8080/api/users/3/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "SecurePassword123",
    "new_password": "NewPassword456"
  }'

# Assign different role
curl -X PATCH http://localhost:8080/api/users/3/assign-role \
  -H "Content-Type: application/json" \
  -d '{ "role_id": 3 }'

# Deactivate user
curl -X PATCH http://localhost:8080/api/users/3/toggle-status

# Edit user email
curl -X PUT http://localhost:8080/api/users/3 \
  -H "Content-Type: application/json" \
  -d '{ "email": "newemail@example.com" }'
```

---

## Key Features

### 1. Hierarchical Modules
Modules can have parent-child relationships for organizing menus:
- Parent: "Albums"
  - Sub: "My Albums"
  - Sub: "Public Albums"

### 2. Permission Granularity
Each module can have specific permissions:
- Create (id: 1)
- Read (id: 2)
- Update (id: 3)
- Delete (id: 4)

### 3. Role-Based Access Control
Users inherit permissions from their assigned role. Changing a user's role immediately updates their access.

### 4. Status Management
Both roles and users can be activated/deactivated without deletion, maintaining history.

### 5. User Account Features
- Change own password
- Admin can reset passwords
- Account activation/deactivation
- Role assignment/change
- Email management

---

## Helper Methods (For Frontend/Backend Logic)

### PermissionHelper Class

```php
$helper = new \App\Libraries\PermissionHelper();

// Check single permission
$canCreate = $helper->hasPermission($adminId, $moduleId, $permissionId);

// Check any of multiple permissions
$canEdit = $helper->hasAnyPermission($adminId, $moduleId, [2, 3]); // Read or Update

// Check all permissions
$hasFull = $helper->hasAllPermissions($adminId, $moduleId, [1, 2, 3, 4]); // All CRUD

// Get accessible modules for user
$modules = $helper->getAccessibleModules($adminId);

// Get specific module permissions
$perms = $helper->getModulePermissions($adminId, $moduleId);

// Get role with all permissions
$role = $helper->getRoleWithPermissions($roleId);
```

---

## Frontend Integration

The frontend will:

1. **Display Role Management Page**
   - List all roles with status
   - Create/Edit/Delete roles
   - Assign modules and permissions to roles

2. **Display User Management Page**
   - List all users with pagination
   - Create new admin users
   - Edit user details (email, role)
   - Change password functionality
   - Activate/Deactivate users
   - Assign roles to users
   - Delete users

3. **Dynamic Menu Generation**
   - Load accessible modules based on user's role
   - Show only permitted actions

---

## Installation & Setup

1. **Run Migration**
   ```bash
   php spark migrate
   ```

2. **Run Seeder (Optional - for initial data)**
   ```bash
   php spark db:seed PermissionSeeder
   ```

3. **Use the API endpoints** as documented above

---

## Error Responses

All endpoints return JSON responses in this format:

```json
{
  "status": "success|error",
  "message": "Description of result",
  "data": null,
  "code": 200
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error
