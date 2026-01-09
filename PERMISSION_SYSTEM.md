# Role-Based Permission System - Frontend Implementation

## Overview

This document describes the complete frontend implementation of the Role-Based Access Control (RBAC) system for the gallery admin panel.

## Architecture

### Service Layer (`lib/permission-service.ts`)

The service layer provides a complete TypeScript interface to all backend API endpoints. It includes:

#### Role Management Functions
- `getRoles(page, limit)` - Get paginated list of all roles
- `getActiveRoles()` - Get only active roles
- `getRoleById(id)` - Get specific role details
- `createRole(data)` - Create new role
- `updateRole(id, data)` - Update existing role
- `deleteRole(id)` - Delete role
- `toggleRoleStatus(id)` - Activate/deactivate role

#### User Management Functions
- `getUsers(page, limit)` - Get paginated list of users
- `getActiveUsers()` - Get only active users
- `getUserById(id)` - Get specific user details
- `createUser(data)` - Create new admin user
- `updateUser(id, data)` - Update user details
- `deleteUser(id)` - Delete user
- `toggleUserStatus(id)` - Activate/deactivate user

#### Password Management Functions
- `changeUserPassword(id, data)` - Change user password (requires old password)
- `resetUserPassword(id)` - Generate temporary password

#### Role Assignment Functions
- `assignRoleToUser(userId, roleId)` - Assign role to user

#### Permission Functions
- `getPermissionStructure()` - Get all modules and permissions
- `getRolePermissions(roleId)` - Get permissions assigned to a role
- `assignPermissionsBulk(roleId, assignments)` - Bulk assign permissions to role
- `removePermission(roleId, moduleId, permissionId)` - Remove specific permission
- `checkPermission(userId, moduleId, permissionId)` - Check if user has permission

### Constants (`lib/constants.ts`)

Centralized configuration for:

```typescript
// Module IDs
MODULES = {
  DASHBOARD: 1,
  USERS: 2,
  ROLES_PERMISSIONS: 3,
  ALBUMS: 4,
  CATEGORIES: 5,
  ENQUIRIES: 6,
  SETTINGS: 7,
}

// Permission IDs
PERMISSIONS = {
  CREATE: 1,    // Can create
  READ: 2,      // Can read/view
  UPDATE: 3,    // Can edit
  DELETE: 4,    // Can delete
}
```

### Permission Helper (`lib/permission-helper.ts`)

Utility functions for checking permissions on the frontend:

```typescript
// Check specific permission
hasPermission(permissions, moduleId, permissionId)

// Check specific actions
canCreate(permissions, moduleId)
canRead(permissions, moduleId)
canUpdate(permissions, moduleId)
canDelete(permissions, moduleId)

// Check module access
hasModuleAccess(permissions, moduleId)

// Check multiple permissions
hasAllPermissions(permissions, moduleId, [perms])
hasAnyPermission(permissions, moduleId, [perms])

// Get information
getModulePermissions(permissions, moduleId)
getAccessibleModules(permissions)
getPermissionName(permissionId)
getModuleName(moduleId)
getPermissionsSummary(permissions)
```

## Pages & Components

### Admin Dashboard (`app/admin/`)

#### 1. Roles Management (`app/admin/roles/page.tsx`)

**Features:**
- List all roles in a table
- Create new role with name and description
- Edit existing role
- Delete role (with confirmation)
- Toggle role active/inactive status
- Pagination support

**UI Components:**
- Role listing table with columns: Name, Description, Status, Actions
- Form modal for create/edit operations
- Status badges (Active/Inactive)
- Action buttons: Edit, Delete, Permissions, Toggle Status

**API Usage:**
```typescript
getRoles(page, limit)
createRole({name, description})
updateRole(id, {name, description})
deleteRole(id)
toggleRoleStatus(id)
```

#### 2. Role Permissions (`app/admin/roles/[id]/permissions/page.tsx`)

**Features:**
- View and assign permissions to a specific role
- Display all main modules
- Checkbox matrix for Create/Read/Update/Delete permissions
- Bulk save permission assignments
- Back navigation with confirmation

**UI Components:**
- Module list with expandable details
- Permission checkboxes for each module
- Save and Cancel buttons
- Loading and error states

**API Usage:**
```typescript
getRoleById(id)
getPermissionStructure()
assignPermissionsBulk(roleId, assignments)
```

#### 3. Users Management (`app/admin/users/page.tsx`)

**Features:**
- List all admin users with pagination
- Create new user with username, email, password, and role
- Edit user details (email, role)
- Assign role to user
- Change user password
- Activate/deactivate user
- Delete user (with confirmation)

**UI Components:**
- User listing table with columns: Username, Email, Role, Status, Actions
- Create/Edit form with inline validation
- Status badges
- Pagination with page buttons
- Action buttons: Edit, Role, Password, Activate/Deactivate, Delete

**API Usage:**
```typescript
getUsers(page, limit)
getActiveRoles()
createUser({username, email, password, role_id})
updateUser(id, {email, role_id})
deleteUser(id)
toggleUserStatus(id)
```

#### 4. User Password Management (`app/admin/users/[id]/password/page.tsx`)

**Features:**
- Change password (requires old password)
- Reset password (generates temporary password)
- Toggle between change and reset modes
- Display user information

**UI Components:**
- User info card
- Mode toggle buttons
- Form fields for password change
- Reset confirmation dialog
- Success/error messages
- Auto-redirect after successful action

**API Usage:**
```typescript
getUserById(id)
changeUserPassword(id, {old_password, new_password})
resetUserPassword(id)
```

#### 5. User Role Assignment (`app/admin/users/[id]/roles/page.tsx`)

**Features:**
- View current user role
- Assign new role from dropdown
- Confirmation message about role replacement
- Back navigation

**UI Components:**
- User info card
- Role selection dropdown
- Warning message
- Submit and Cancel buttons

**API Usage:**
```typescript
getUserById(id)
getActiveRoles()
assignRoleToUser(userId, roleId)
```

#### 6. Permissions Dashboard (`app/admin/permissions/page.tsx`)

**Features:**
- View all system modules and their permissions
- Expandable module details with sub-modules
- Quick reference statistics
- Quick access to role management
- Navigate to specific role permission assignments

**UI Components:**
- Module explorer with expandable items
- Permission badges
- Role list panel with quick stats
- Statistics cards

**API Usage:**
```typescript
getPermissionStructure()
getRoles(page, limit)
```

#### 7. Permission Settings (`app/admin/settings/permissions/page.tsx`)

**Features:**
- Overview of system structure
- Detailed module and permission listing
- Role overview with status
- Permission system guide and documentation

**UI Components:**
- Statistics cards
- Detailed structure section
- Role overview cards
- Documentation section

**API Usage:**
```typescript
getPermissionStructure()
getRoles(page, limit)
```

## Data Types

### Main Interfaces

```typescript
// Role
interface Role {
  id: number
  name: string
  description: string | null
  is_active: number
  created_at: string
  updated_at: string
}

// Admin User
interface AdminUser {
  id: number
  username: string
  email: string
  role_id: number | null
  role_name: string | null
  is_active: number
  created_at: string
  updated_at: string
}

// Module
interface Module {
  id: number
  name: string
  slug: string
  parent_module_id: number | null
  is_sub_module: number
}

// Permission
interface Permission {
  id: number
  name: string
  slug: string
}

// Permission Structure
interface PermissionStructure {
  modules: Module[]
  permissions: Permission[]
}

// Pagination
interface Pagination {
  page: number
  total_pages: number
  total: number
  per_page: number
}

// API Response
interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}
```

## Error Handling

All functions include try-catch blocks and proper error propagation:

```typescript
try {
  const data = await getRoles(1, 10)
  // Use data
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  console.error(message)
}
```

## State Management

Components use React hooks for state management:

- `useState` - For component state (forms, lists, modals)
- `useEffect` - For data loading and side effects
- `useParams` - For route parameters
- `useRouter` - For navigation

## Styling

All components use Tailwind CSS for styling with:
- Responsive grid layouts
- Consistent color scheme (blue, green, orange, red for actions)
- Hover states and transitions
- Status badges with color coding
- Form inputs with focus states

## Authentication

All API calls support an optional `token` parameter for authenticated requests:

```typescript
const roles = await getRoles(1, 10, 'your-auth-token')
```

If no token is provided, calls are made without authentication headers.

## Usage Example

### Complete User Management Workflow

```typescript
// 1. Create role
const role = await createRole({
  name: 'Editor',
  description: 'Can edit content'
})

// 2. Assign permissions to role
await assignPermissionsBulk(role.id, [
  { module_id: 1, permission_id: [1, 2, 3] }, // Dashboard: Create, Read, Update
  { module_id: 4, permission_id: [1, 2, 3, 4] } // Albums: All permissions
])

// 3. Create user
const user = await createUser({
  username: 'editor1',
  email: 'editor@example.com',
  password: 'SecurePass123',
  role_id: role.id
})

// 4. Change user password
await changeUserPassword(user.id, {
  old_password: 'SecurePass123',
  new_password: 'NewSecurePass456'
})

// 5. Deactivate user
await toggleUserStatus(user.id)
```

## Integration with Existing Admin Panel

The permission system integrates seamlessly with:

- **Navigation:** Links to role/user/permission pages in admin sidebar
- **Layout:** Uses existing admin layout wrapper
- **Styling:** Consistent with admin panel design
- **Forms:** Standard input components and validation
- **Tables:** Consistent table styling with admin panel

## Security Considerations

1. **Authentication:** All calls support token-based authentication
2. **Error Messages:** Sensitive errors logged to console only
3. **Validation:** Frontend validation with backend confirmation
4. **Confirmation:** Destructive actions require user confirmation
5. **Password:** Password fields never logged or exposed

## Environment Configuration

Set `NEXT_PUBLIC_API_URL` in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Future Enhancements

1. Add bulk user import/export
2. Add role templates
3. Add permission audit logging
4. Add activity timeline
5. Add advanced filtering and search
6. Add permission conflict detection
7. Add user session management
8. Add permission inheritance visualization

## Related Files

- Backend Permission System: `/backend/app/Controllers/PermissionController.php`
- API Documentation: `/backend/README.md`
- Database Schema: `/backend/sql/`
- Type Definitions: `lib/permission-service.ts`
- Helper Functions: `lib/permission-helper.ts`
