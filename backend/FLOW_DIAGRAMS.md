# System Flow Diagrams

## 1. Role Creation & Permission Assignment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   ROLE MANAGEMENT FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. CREATE ROLE
   ─────────────
   Admin Panel → POST /api/roles → RoleController::create()
                                  ↓
                            RoleModel::insert()
                                  ↓
                            roles table
                                  ↓
                            Return: { id, name, description }


2. ASSIGN MODULES & PERMISSIONS
   ──────────────────────────────
   Admin Panel → POST /api/permissions/assign-bulk
                                  ↓
                    PermissionController::assignBulk()
                                  ↓
                    Clear old assignments (if any)
                                  ↓
                    For each module assignment:
                    ├─ Validate role exists ✓
                    ├─ Validate module exists ✓
                    └─ Insert into role_module_permissions
                                  ↓
                    Return: "Permissions assigned"


3. ROLE STRUCTURE CREATED
   ──────────────────────
   Role "Editor" (id: 2)
   ├── Albums (module_id: 4)
   │   ├── Create (permission_id: 1)
   │   ├── Read (permission_id: 2)
   │   └── Update (permission_id: 3)
   ├── Categories (module_id: 5)
   │   ├── Create (permission_id: 1)
   │   └── Read (permission_id: 2)
   └── Dashboard (module_id: 1)
       └── Read (permission_id: 2)
```

---

## 2. User Creation & Role Assignment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   USER MANAGEMENT FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. CREATE ADMIN USER
   ──────────────────
   Admin Panel → POST /api/users → UserController::create()
                                  ↓
        ┌─────────────────────────┴──────────────────────────┐
        │                                                    │
   Validate                                            Hash Password
   ├─ Username exists? ✗                           password_hash()
   ├─ Email exists? ✗                                     ↓
   ├─ Role exists? ✓                            AdminModel::insert()
        │                                                    │
        └────────────────────┬─────────────────────────────┘
                             ↓
                        admins table
                        ├─ id: 3
                        ├─ username: "editor_user"
                        ├─ email: "editor@example.com"
                        ├─ password_hash: "$2y$10$..."
                        ├─ role_id: 2 (Editor)
                        └─ is_active: 1
                             ↓
                    Return user with role info


2. ASSIGN ROLE TO USER (if not assigned during creation)
   ────────────────────────────────────────────────────
   Admin Panel → PATCH /api/users/{id}/assign-role
                                  ↓
                    UserController::assignRole()
                                  ↓
                    AdminModel::assignRole($id, $roleId)
                                  ↓
                    UPDATE admins SET role_id = 2
                                  ↓
                    User now has Editor's permissions


3. USER INHERITS ROLE PERMISSIONS
   ─────────────────────────────
   Admin User "john_editor" (id: 3)
   └── Role "Editor" (role_id: 2)
       ├── Albums: Create, Read, Update
       ├── Categories: Create, Read
       └── Dashboard: Read


4. USER ACCOUNT MANAGEMENT
   ──────────────────────
   
   Change Password (User initiates)
   └─ POST /api/users/3/change-password
      ├─ Old password valid? ✓
      ├─ New password >= 8 chars? ✓
      └─ Update password_hash
   
   Reset Password (Admin action)
   └─ POST /api/users/3/reset-password
      ├─ New password >= 8 chars? ✓
      └─ Update password_hash
   
   Change Role
   └─ PATCH /api/users/3/assign-role
      └─ Update role_id = 3
   
   Deactivate User
   └─ PATCH /api/users/3/toggle-status
      └─ UPDATE admins SET is_active = 0
         (User cannot login, account preserved)
   
   Reactivate User
   └─ PATCH /api/users/3/toggle-status
      └─ UPDATE admins SET is_active = 1
         (User can login again)
   
   Delete User
   └─ DELETE /api/users/3
      └─ DELETE FROM admins WHERE id = 3
         (Permanent removal)
```

---

## 3. Permission Checking Flow

```
┌─────────────────────────────────────────────────────────────┐
│              PERMISSION CHECKING FLOW                       │
└─────────────────────────────────────────────────────────────┘

USER ACTION
    ↓
┌───────────────────────────────────┐
│ Check: Can user access Albums?   │
└───────────────────────────────────┘
    ↓
PermissionHelper::hasPermission($adminId, $moduleId, $permissionId)
    ↓
├─ Get Admin from DB
│  ├─ Admin exists? ✓
│  ├─ is_active = 1? ✓
│  └─ Has role_id? ✓
│      ↓
├─ Get Role
│  ├─ Role exists? ✓
│  └─ is_active = 1? ✓
│      ↓
├─ Check role_module_permissions
│  ├─ SELECT COUNT(*) FROM role_module_permissions
│  │  WHERE role_id = 2
│  │    AND module_id = 4
│  │    AND permission_id = 1
│  │
│  ├─ Count > 0? → YES ✓
│  └─ Permission exists
│      ↓
└─► RETURN TRUE
    User can perform action
    
---

Alternative - Permission NOT Found
    ↓
├─ Check role_module_permissions
│  └─ Count = 0
│      ↓
└─► RETURN FALSE
    User CANNOT perform action
    Access Denied (403 Forbidden)
```

---

## 4. Login & Permission Initialization

```
┌─────────────────────────────────────────────────────────────┐
│               LOGIN & AUTHORIZATION FLOW                    │
└─────────────────────────────────────────────────────────────┘

USER LOGIN
    ↓
POST /api/admin/login
├─ Username: "editor_user"
└─ Password: "SecurePass123"
    ↓
AdminModel::getByUsernameWithRole()
    ↓
SELECT admins.*, roles.* 
FROM admins
LEFT JOIN roles ON roles.id = admins.role_id
WHERE username = "editor_user"
    ↓
Returns:
{
  id: 3,
  username: "editor_user",
  email: "editor@example.com",
  role_id: 2,
  role_name: "Editor",
  is_active: 1,
  ...
}
    ↓
Verify password hash ✓
    ↓
Generate JWT/Fernet token
├─ Payload: { id: 3, username: "editor_user", role_id: 2 }
└─ Encrypted with secret key
    ↓
Response: 
{
  token: "encrypted_token",
  admin: { id: 3, username: "editor_user", role_id: 2 }
}
    ↓
FRONTEND STORES TOKEN
    ↓
USER ACCESSES PAGE/API
    ↓
├─ Include token in header
│  Authorization: Bearer <token>
│      ↓
└─ Backend verifies token
   ├─ Token valid? ✓
   ├─ Admin active? ✓
   ├─ Role active? ✓
   └─ Has permission? ✓
       ↓
   ALLOW ACCESS
```

---

## 5. Module Hierarchy Structure

```
┌─────────────────────────────────────────────────────────────┐
│            MODULE HIERARCHY EXAMPLE                         │
└─────────────────────────────────────────────────────────────┘

modules table:
┌────┬─────────────────┬────────────────────┬─────────┐
│ id │      name       │     parent_id      │ is_sub  │
├────┼─────────────────┼────────────────────┼─────────┤
│ 1  │ Dashboard       │ NULL               │ 0       │
│ 2  │ My Dashboard    │ 1                  │ 1       │
│ 3  │ Analytics       │ 1                  │ 1       │
│ 4  │ Users           │ NULL               │ 0       │
│ 5  │ Admin Users     │ 4                  │ 1       │
│ 6  │ Albums          │ NULL               │ 0       │
│ 7  │ My Albums       │ 6                  │ 1       │
│ 8  │ Categories      │ NULL               │ 0       │
└────┴─────────────────┴────────────────────┴─────────┘

Visual Tree:
┌─ Dashboard (1)
│  ├─ My Dashboard (2) [parent_id: 1]
│  └─ Analytics (3) [parent_id: 1]
│
├─ Users (4)
│  └─ Admin Users (5) [parent_id: 4]
│
├─ Albums (6)
│  └─ My Albums (7) [parent_id: 6]
│
└─ Categories (8)
```

---

## 6. Permission Assignment Matrix

```
┌─────────────────────────────────────────────────────────────┐
│           PERMISSION ASSIGNMENT MATRIX                      │
└─────────────────────────────────────────────────────────────┘

role_module_permissions table:
┌────┬─────────┬───────────┬─────────────┐
│ id │ role_id │ module_id │ permission  │
├────┼─────────┼───────────┼─────────────┤
│ 1  │ 1       │ 1         │ 1 (Create)  │
│ 2  │ 1       │ 1         │ 2 (Read)    │
│ 3  │ 1       │ 1         │ 3 (Update)  │
│ 4  │ 1       │ 1         │ 4 (Delete)  │
│ 5  │ 1       │ 4         │ 1 (Create)  │
│ 6  │ 1       │ 4         │ 2 (Read)    │
│ 7  │ 1       │ 4         │ 3 (Update)  │
│ 8  │ 1       │ 4         │ 4 (Delete)  │
│ 9  │ 2       │ 1         │ 2 (Read)    │
│ 10 │ 2       │ 6         │ 1 (Create)  │
│ 11 │ 2       │ 6         │ 2 (Read)    │
│ 12 │ 2       │ 6         │ 3 (Update)  │
│ 13 │ 2       │ 8         │ 2 (Read)    │
└────┴─────────┴───────────┴─────────────┘

Visual Matrix for Frontend:
┌─────────────────┬────────┬──────┬────────┬────────┐
│ Role\Module     │ Albums │ Cats │ Users  │ Dash   │
├─────────────────┼────────┼──────┼────────┼────────┤
│ Super Admin     │ ✓✓✓✓   │ ✓✓✓✓ │ ✓✓✓✓   │ ✓✓✓✓   │
│ Editor          │ ✓✓✓□   │ ✓✓□□ │ □□□□   │ ✓□□□   │
│ Viewer          │ ✓□□□   │ ✓□□□ │ □□□□   │ ✓□□□   │
├─────────────────┴────────┴──────┴────────┴────────┤
│ ✓ = Allowed, □ = Not Allowed                      │
│ Create, Read, Update, Delete (left to right)      │
└─────────────────────────────────────────────────────┘
```

---

## 7. Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│              COMPLETE USER JOURNEY                          │
└─────────────────────────────────────────────────────────────┘

STEP 1: Admin Creates Role "Album Editor"
└─→ POST /api/roles
    ├─ Role table: +1 row (id: 2, name: "Album Editor")
    └─ Empty permissions (to be assigned)


STEP 2: Admin Assigns Permissions to Role
└─→ POST /api/permissions/assign-bulk
    ├─ Albums module → [Create, Read, Update]
    ├─ Categories module → [Read]
    └─ role_module_permissions table: +5 rows
       ├─ (role_id: 2, module_id: 6, permission_id: 1)
       ├─ (role_id: 2, module_id: 6, permission_id: 2)
       ├─ (role_id: 2, module_id: 6, permission_id: 3)
       ├─ (role_id: 2, module_id: 8, permission_id: 2)
       └─ role complete


STEP 3: Admin Creates Admin User
└─→ POST /api/users
    ├─ Username: "john_albums"
    ├─ Email: "john@example.com"
    ├─ Password: hashed with bcrypt
    ├─ role_id: 2 (Album Editor)
    ├─ is_active: 1
    └─ admins table: +1 row (id: 5)


STEP 4: John Logs In
└─→ POST /api/admin/login
    ├─ Verify username + password
    ├─ Check if active
    ├─ Load role with permissions
    ├─ Generate token with role info
    └─ Response: token + user info


STEP 5: John Accesses Album Editor Page
└─→ GET /api/admin/albums
    ├─ Verify token
    ├─ Get admin id from token (5)
    ├─ Load permissions
    ├─ Return albums he can edit
    └─ Show "Create Album" button (has permission)


STEP 6: John Creates New Album
└─→ POST /api/admin/albums
    ├─ Verify token
    ├─ Check permission: Albums module + Create (permission_id: 1)
    │  ├─ Get admin id: 5
    │  ├─ Get role_id: 2 (from admin)
    │  ├─ Query: SELECT * FROM role_module_permissions
    │  │           WHERE role_id=2 AND module_id=6 AND permission_id=1
    │  ├─ Result: 1 row found
    │  └─ Permission: ✓ GRANTED
    │
    ├─ Create album
    └─ Response: new album


STEP 7: John Tries to Delete Album
└─→ DELETE /api/admin/albums/123
    ├─ Check permission: Albums + Delete (permission_id: 4)
    │  ├─ Query: SELECT * FROM role_module_permissions
    │  │           WHERE role_id=2 AND module_id=6 AND permission_id=4
    │  ├─ Result: 0 rows found (no Delete permission)
    │  └─ Permission: ✗ DENIED
    │
    └─ Response: 403 Forbidden "No permission"


STEP 8: Admin Manages John's Account

    a) Change John's Password
    └─→ POST /api/users/5/change-password
        ├─ Old password valid? ✓
        ├─ New password >= 8 chars? ✓
        └─ Update password hash

    b) Give John More Permissions (New Role)
    └─→ PATCH /api/users/5/assign-role
        ├─ New role_id: 3 (Full Albums Role)
        └─ John now has [Create, Read, Update, Delete] for Albums

    c) Deactivate John (Suspend Account)
    └─→ PATCH /api/users/5/toggle-status
        ├─ UPDATE admins SET is_active = 0
        └─ John cannot login anymore

    d) Reactivate John (Restore Access)
    └─→ PATCH /api/users/5/toggle-status
        ├─ UPDATE admins SET is_active = 1
        └─ John can login again

    e) Delete John (Permanent Removal)
    └─→ DELETE /api/users/5
        ├─ DELETE FROM admins WHERE id = 5
        └─ John's account is gone forever


STEP 9: Admin Deactivates Role
└─→ PATCH /api/roles/2/toggle-status
    ├─ UPDATE roles SET is_active = 0
    ├─ All users with this role lose access
    └─ John (if has this role) cannot access anything anymore
```

---

## 8. API Response Structure

```
┌─────────────────────────────────────────────────────────────┐
│            API RESPONSE FORMAT                              │
└─────────────────────────────────────────────────────────────┘

SUCCESS (200, 201, etc.)
─────────────────────
{
  "status": "success",
  "message": "Role created successfully",
  "data": {
    "id": 2,
    "name": "Editor",
    "description": "Can manage content",
    "is_active": 1
  },
  "code": 201
}


ERROR (400, 401, 403, 404, 500, etc.)
────────────────────────────────────
{
  "status": "error",
  "message": "Role with this name already exists",
  "data": null,
  "code": 409
}


LIST (200)
──────────
{
  "status": "success",
  "message": "Users fetched successfully",
  "data": {
    "users": [
      { id: 1, username: "admin", role_id: 1, is_active: 1 },
      { id: 3, username: "editor", role_id: 2, is_active: 1 }
    ],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 2,
      "total_pages": 1
    }
  },
  "code": 200
}


COMPLEX DATA (200)
──────────────────
{
  "status": "success",
  "message": "Permissions fetched successfully",
  "data": {
    "roles": [ { id, name, is_active, ... } ],
    "modules": [ { id, name, slug, parent_id, ... } ],
    "permissions": [ { id, name, slug, ... } ],
    "assigned": {
      "2": {
        "6": [1, 2, 3],  // role 2, module 6, permissions [1,2,3]
        "8": [2]         // role 2, module 8, permission 2
      }
    }
  },
  "code": 200
}
```

---

## 9. HTTP Status Codes

```
┌──────┬─────────────────────────────────────────────────┐
│ Code │ Meaning & Usage                                │
├──────┼─────────────────────────────────────────────────┤
│ 200  │ OK - Request successful (GET, PUT, PATCH)     │
│ 201  │ Created - Resource created (POST)             │
│ 400  │ Bad Request - Invalid data sent               │
│ 401  │ Unauthorized - Not logged in                  │
│ 403  │ Forbidden - No permission for action          │
│ 404  │ Not Found - Resource doesn't exist            │
│ 409  │ Conflict - Resource already exists            │
│ 500  │ Internal Server Error - Server error          │
└──────┴─────────────────────────────────────────────────┘
```

This comprehensive permission system is now ready for your gallery admin panel!
