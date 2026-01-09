# Quick Reference Card

## 🚀 Quick Start (5 Minutes)

### 1. Setup Database
```bash
cd backend
php spark migrate
php spark db:seed PermissionSeeder
```

### 2. Test an Endpoint
```bash
# Get all roles
curl http://localhost:8080/api/roles

# Create a role
curl -X POST http://localhost:8080/api/roles \
  -H "Content-Type: application/json" \
  -d '{"name": "Editor", "description": "Editor role"}'
```

---

## 📚 API Endpoints at a Glance

### Roles
```
GET    /api/roles                 List all roles
GET    /api/roles/{id}            Get single role
POST   /api/roles                 Create role
PUT    /api/roles/{id}            Update role
DELETE /api/roles/{id}            Delete role
PATCH  /api/roles/{id}/toggle-status  Activate/Deactivate
```

### Users
```
GET    /api/users                 List users (paginated)
GET    /api/users/{id}            Get single user
POST   /api/users                 Create user
PUT    /api/users/{id}            Update user
DELETE /api/users/{id}            Delete user
POST   /api/users/{id}/change-password   Change password
POST   /api/users/{id}/reset-password    Reset password (admin)
PATCH  /api/users/{id}/assign-role      Assign role
PATCH  /api/users/{id}/toggle-status    Activate/Deactivate
```

### Permissions
```
GET    /api/permissions           Get all permissions structure
POST   /api/permissions/assign    Assign permission to role
POST   /api/permissions/assign-bulk   Bulk assign
DELETE /api/permissions/{r}/{m}/{p}   Remove permission
POST   /api/permissions/check     Check if has permission
```

---

## 💻 Common Commands

### Create Role & Assign Permissions
```bash
# 1. Create role
ROLE_ID=$(curl -s -X POST http://localhost:8080/api/roles \
  -H "Content-Type: application/json" \
  -d '{"name": "Viewer"}' | jq '.data.id')

# 2. Assign permissions
curl -X POST http://localhost:8080/api/permissions/assign-bulk \
  -H "Content-Type: application/json" \
  -d "{
    \"role_id\": $ROLE_ID,
    \"assignments\": [
      {\"module_id\": 1, \"permission_ids\": [2]},
      {\"module_id\": 6, \"permission_ids\": [2]}
    ]
  }"
```

### Create User & Assign Role
```bash
# 1. Create user
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "Pass123456!",
    "role_id": 2
  }'

# 2. Or assign role later
curl -X PATCH http://localhost:8080/api/users/3/assign-role \
  -H "Content-Type: application/json" \
  -d '{"role_id": 2}'
```

### Manage User
```bash
# Change password
curl -X POST http://localhost:8080/api/users/3/change-password \
  -H "Content-Type: application/json" \
  -d '{"old_password": "Pass123456!", "new_password": "NewPass789!"}'

# Reset password (admin)
curl -X POST http://localhost:8080/api/users/3/reset-password \
  -H "Content-Type: application/json" \
  -d '{"new_password": "NewPass789!"}'

# Deactivate/Activate
curl -X PATCH http://localhost:8080/api/users/3/toggle-status

# Delete
curl -X DELETE http://localhost:8080/api/users/3
```

---

## 📋 Database Tables

| Table | Purpose | Key Columns |
|-------|---------|------------|
| modules | System modules | id, name, slug, parent_id |
| permissions | CRUD operations | id, name, slug |
| roles | User roles | id, name, is_active |
| role_module_permissions | Permission mapping | role_id, module_id, permission_id |
| admins (modified) | Admin users | id, role_id, is_active |

---

## 🔑 Key Concepts

### Modules
Represent sections of your app (Albums, Categories, Users, etc.)

### Permissions
Standard CRUD: Create (1), Read (2), Update (3), Delete (4)

### Roles
Bundles of module-permission combinations assigned to users

### Users
Admin accounts that inherit permissions from roles

### Permission Checking
```php
$helper = new PermissionHelper();
$canCreate = $helper->hasPermission($userId, $moduleId, $permissionId);
```

---

## 🎯 Workflow Steps

```
1. Create Role
   └─ POST /api/roles
   
2. Assign Permissions to Role
   └─ POST /api/permissions/assign-bulk
   
3. Create Admin User
   └─ POST /api/users
   
4. Assign Role to User (or done in step 3)
   └─ PATCH /api/users/{id}/assign-role
   
5. User can now login with those permissions
   
6. Manage user as needed
   ├─ Change password
   ├─ Change role
   ├─ Deactivate/Activate
   └─ Delete
```

---

## ✅ Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 500 | Server error |

---

## 🔍 Check Permission Example

```php
use App\Libraries\PermissionHelper;

$helper = new PermissionHelper();

// Single permission
if ($helper->hasPermission($adminId, $moduleId=6, $permissionId=1)) {
    // User can create albums
}

// Any of multiple
if ($helper->hasAnyPermission($adminId, $moduleId=6, [1,2,3])) {
    // User can create, read, or update
}

// All permissions
if ($helper->hasAllPermissions($adminId, $moduleId=6, [1,2,3,4])) {
    // User can do all CRUD
}

// Get accessible modules
$modules = $helper->getAccessibleModules($adminId);
```

---

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| Routes not working | `php spark route:clear` |
| Migration failed | Check `writable/logs/` |
| Permission always false | Check role/user `is_active = 1` |
| Can't create user | Check role exists, email/username unique |
| Can't delete role | User(s) still assigned to role |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/Controllers/Api/RoleController.php` | Role management |
| `app/Controllers/Api/UserController.php` | User management |
| `app/Controllers/Api/PermissionController.php` | Permission assignment |
| `app/Libraries/PermissionHelper.php` | Permission checking |
| `app/Models/RoleModel.php` | Role queries |
| `app/Models/AdminModel.php` | Admin queries |

---

## 🎓 Next: Frontend Implementation

1. **Role Management Page**
   - List roles → Create → Edit → Delete
   - Module-permission checkboxes
   - Save assignments

2. **User Management Page**
   - List users → Create → Edit → Delete
   - Password management
   - Role assignment
   - Activate/Deactivate

3. **Dynamic Navigation**
   - Load accessible modules per user
   - Show/hide menu items
   - Disable unavailable actions

---

## 📚 Documentation Files

- **PERMISSION_SYSTEM_DOCS.md** - Complete API documentation
- **SETUP_GUIDE.md** - Installation & usage
- **DATABASE_STRUCTURE.md** - Schema & relationships
- **FLOW_DIAGRAMS.md** - Visual flow diagrams
- **README_PERMISSIONS.md** - System overview

---

## 🚀 You're All Set!

Your backend permission system is ready to use. Start with the quick start section and refer to the detailed docs as needed.

**Happy coding!** 🎉
