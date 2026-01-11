# Get Permissions by Role ID - cURL Examples

## 1. Get Menu Structure for Role 17
```bash
curl -X GET "http://localhost:8080/api/permissions/menu/17" \
  -H "Content-Type: application/json" \
  -H "X-Role-ID: 17"
```

**Response:**
```json
{
  "status": "success",
  "message": "Menu structure fetched successfully",
  "data": [
    {
      "role_id": "17",
      "module_info": {
        "id": 1,
        "name": "Dashboard",
        "is_sub_module": false,
        "permissions": [1, 2, 3, 4],
        "icon": "LayoutDashboard",
        "url": "/admin"
      },
      "sub_module_info": []
    },
    {
      "role_id": "17",
      "module_info": {
        "id": 3,
        "name": "Albums",
        "is_sub_module": false,
        "permissions": [1, 2, 3, 4],
        "icon": "Image",
        "url": "/admin/albums"
      },
      "sub_module_info": [
        {
          "id": 9,
          "name": "All Albums",
          "is_sub_module": true,
          "permissions": [1, 2, 3, 4],
          "icon": "Image",
          "url": "/admin/albums"
        },
        {
          "id": 10,
          "name": "Create Album",
          "is_sub_module": true,
          "permissions": [1, 2, 3, 4],
          "icon": "Plus",
          "url": "/admin/albums/create"
        }
      ]
    }
  ],
  "code": 200
}
```

---

## 2. Get Role Permissions (All Modules)
```bash
curl -X GET "http://localhost:8080/api/permissions/role/17" \
  -H "Content-Type: application/json" \
  -H "X-Role-ID: 17"
```

**Response:**
```json
{
  "status": "success",
  "message": "Role permissions fetched",
  "data": {
    "role": {
      "id": 17,
      "name": "Manager",
      "description": "Manager role with specific permissions",
      "is_active": 1,
      "created_at": "2025-01-15 10:30:00",
      "updated_at": "2025-01-15 10:30:00"
    },
    "permissions": [
      {
        "role_id": 17,
        "module_id": 1,
        "permission_id": 1,
        "permission_name": "Read",
        "slug": "read"
      },
      {
        "role_id": 17,
        "module_id": 1,
        "permission_id": 2,
        "permission_name": "Create",
        "slug": "create"
      },
      {
        "role_id": 17,
        "module_id": 1,
        "permission_id": 3,
        "permission_name": "Update",
        "slug": "update"
      },
      {
        "role_id": 17,
        "module_id": 1,
        "permission_id": 4,
        "permission_name": "Delete",
        "slug": "delete"
      }
    ],
    "modules": [
      {
        "id": 1,
        "name": "Dashboard",
        "slug": "dashboard",
        "parent_id": null,
        "is_sub_module": 0,
        "icon": "LayoutDashboard",
        "url": "/admin",
        "order": 1,
        "created_at": "2025-01-15 10:30:00",
        "updated_at": "2025-01-15 10:30:00"
      }
    ]
  },
  "code": 200
}
```

---

## 3. Check Specific Permission
```bash
curl -X POST "http://localhost:8080/api/permissions/check" \
  -H "Content-Type: application/json" \
  -H "X-Role-ID: 17" \
  -d '{
    "role_id": 17,
    "module_id": 2,
    "permission_id": 1
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Permission check completed",
  "data": {
    "has_permission": true
  },
  "code": 200
}
```

---

## 4. Get All Permissions Structure
```bash
curl -X GET "http://localhost:8080/api/permissions" \
  -H "Content-Type: application/json" \
  -H "X-Role-ID: 17"
```

**Response:**
```json
{
  "status": "success",
  "message": "Permissions fetched successfully",
  "data": {
    "roles": [
      {
        "id": 1,
        "name": "Admin",
        "description": "Super administrator with full access",
        "is_active": 1
      },
      {
        "id": 17,
        "name": "Manager",
        "description": "Manager role with specific permissions",
        "is_active": 1
      }
    ],
    "modules": [
      {
        "id": 1,
        "name": "Dashboard",
        "slug": "dashboard",
        "parent_id": null,
        "is_sub_module": 0,
        "icon": "LayoutDashboard",
        "url": "/admin",
        "order": 1
      }
    ],
    "permissions": [
      {
        "id": 1,
        "name": "Read",
        "slug": "read"
      },
      {
        "id": 2,
        "name": "Create",
        "slug": "create"
      },
      {
        "id": 3,
        "name": "Update",
        "slug": "update"
      },
      {
        "id": 4,
        "name": "Delete",
        "slug": "delete"
      }
    ],
    "assigned": {
      "17": {
        "1": [1, 2, 3, 4],
        "2": [1, 2, 3, 4],
        "3": [1, 2, 3, 4]
      }
    }
  },
  "code": 200
}
```

---

## 5. Get Menu for Role 1 (Admin)
```bash
curl -X GET "http://localhost:8080/api/permissions/menu/1" \
  -H "Content-Type: application/json" \
  -H "X-Role-ID: 1"
```

---

## 6. Get Menu for Different Role
```bash
curl -X GET "http://localhost:8080/api/permissions/menu/2" \
  -H "Content-Type: application/json" \
  -H "X-Role-ID: 2"
```

---

## Permission IDs Reference
- `1` = Read (GET)
- `2` = Create (POST)
- `3` = Update (PUT/PATCH)
- `4` = Delete (DELETE)

## Module IDs Reference
- `1` = Dashboard
- `2` = Enquiries
- `3` = Albums
- `4` = Categories
- `5` = Roles & Permissions
- `6` = User Management
- `7` = Action Logs
- `8` = Settings
- `9-15` = Sub-modules

## Notes
- Replace `http://localhost:8080` with your actual API base URL
- `X-Role-ID` header is required for permission validation
- All responses follow the standard API response format
- Menu structure includes icons and URLs from database
