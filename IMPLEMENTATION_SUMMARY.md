# Dynamic Menu & Permission System Implementation

## Summary of Changes

### 1. Frontend Updates

#### Updated Admin Sidebar (`components/admin-sidebar.tsx`)
- Removed hardcoded menu items
- Fetches menu structure dynamically from backend via `getMenuStructure(roleId)`
- Renders icons from database (stored as icon names like "LayoutDashboard", "MessageSquare", etc.)
- Displays URLs from database
- Shows/hides menu items based on user role permissions

#### Updated Permission Service (`lib/permission-service.ts`)
- Added `getMenuStructure(roleId)` function
- Fetches menu from `/api/permissions/menu/{roleId}` endpoint
- Returns array of modules with sub-modules, icons, and URLs

### 2. Backend Updates

#### Updated Routes (`backend/app/Config/Routes.php`)
- Applied `apipermission` filter to all admin routes
- Separated public routes (no filter) from admin routes (with filter)
- Admin routes now require permission checks

#### Created Permission Middleware (`backend/app/Filters/ApiPermissionFilter.php`)
- Validates every API request against user role permissions
- Extracts role ID from request headers (`X-Role-ID`)
- Maps HTTP methods to permissions:
  - GET → READ (1)
  - POST → CREATE (2)
  - PUT/PATCH → UPDATE (3)
  - DELETE → DELETE (4)
- Returns 403 Forbidden if user lacks permission
- Returns 401 Unauthorized if role not found

#### Updated Permission Controller (`backend/app/Controllers/Api/PermissionController.php`)
- `getMenuStructure($roleId)` returns menu with icons and URLs from database
- Icons and URLs are now fetched from `modules` table instead of hardcoded

### 3. Database Schema

#### Modules Table Columns
- `id` - Module ID
- `name` - Display name
- `slug` - URL slug
- `parent_id` - Parent module ID (for sub-modules)
- `is_sub_module` - Boolean flag
- `icon` - Icon name (e.g., "LayoutDashboard", "MessageSquare")
- `url` - Route URL (e.g., "/admin/albums")
- `order` - Display order

## How It Works

### Frontend Flow
1. User logs in, role ID stored in localStorage
2. Admin sidebar loads and calls `getMenuStructure(roleId)`
3. Backend returns menu structure with icons and URLs
4. Sidebar renders dynamic menu based on response
5. User can only see modules they have permission for

### Backend Flow
1. Admin makes API request to protected endpoint
2. `ApiPermissionFilter` intercepts request
3. Extracts role ID from `X-Role-ID` header
4. Maps route to module ID
5. Checks if role has required permission for that module
6. If permission exists → request proceeds
7. If permission missing → returns 403 Forbidden

## API Endpoints

### Get Menu Structure
```
GET /api/permissions/menu/{roleId}
```
Returns menu with icons and URLs for role

### Check Permission
```
POST /api/permissions/check
Body: { "role_id": 17, "module_id": 2, "permission_id": 1 }
```

## Module IDs Reference
- 1: Dashboard
- 2: Enquiries
- 3: Albums
- 4: Categories
- 5: Roles & Permissions
- 6: User Management
- 7: Action Logs
- 8: Settings
- 9-15: Sub-modules

## Permission IDs
- 1: READ
- 2: CREATE
- 3: UPDATE
- 4: DELETE

## Implementation Checklist

✅ Frontend sidebar fetches menu dynamically
✅ Icons stored in database
✅ URLs stored in database
✅ Permission middleware on all admin APIs
✅ Role-based access control enforced
✅ 403 Forbidden response for unauthorized access
✅ Menu structure includes permissions array

## Testing

1. Create user with role 17
2. Set `X-Role-ID: 17` header in API requests
3. Verify sidebar shows correct menu items
4. Try accessing API without permission → should get 403
5. Verify icons and URLs render correctly

## Notes

- Icons are stored as component names (e.g., "LayoutDashboard")
- Frontend maps these to actual SVG components
- URLs are full paths (e.g., "/admin/albums")
- Permission filter checks role ID from `X-Role-ID` header
- All admin routes now require permission validation
