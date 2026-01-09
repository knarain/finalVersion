# Permission System Frontend - Quick Integration Guide

## Installation & Setup

### 1. Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 2. Verify Files Created

Check these files exist:

```
lib/
  ├── permission-service.ts (450+ lines, all API functions)
  ├── permission-helper.ts (permission checking utilities)
  └── constants.ts (module & permission IDs)

app/admin/
  ├── roles/
  │   ├── page.tsx (role list, create, edit, delete)
  │   └── [id]/permissions/page.tsx (assign permissions to role)
  ├── users/
  │   ├── page.tsx (user list, create, edit, delete)
  │   └── [id]/
  │       ├── password/page.tsx (change/reset password)
  │       └── roles/page.tsx (assign role to user)
  ├── permissions/
  │   └── page.tsx (view all permissions & modules)
  └── settings/
      └── permissions/
          └── page.tsx (permission system settings)

PERMISSION_SYSTEM.md (full documentation)
```

### 3. Database Setup

Backend should be set up with:

```sql
-- Tables created in backend
- modules (system modules)
- permissions (permission types)
- roles (admin roles)
- role_module_permissions (role-permission assignments)
- admins (admin users - modified with role_id)
```

### 4. Backend API

Ensure backend API endpoints are running at `http://localhost:8000/api`:

- `GET /roles` - List roles
- `POST /roles` - Create role
- `GET /roles/{id}` - Get role details
- `PUT /roles/{id}` - Update role
- `DELETE /roles/{id}` - Delete role
- `POST /roles/{id}/toggle-status` - Toggle role active/inactive

And similar endpoints for users, permissions, etc.

## Usage

### Basic Flow

1. **Navigate to Admin Panel** → `/admin/`

2. **Create Roles** → `/admin/roles`
   - Click "Create Role"
   - Enter name and description
   - Click "Create Role"

3. **Assign Permissions** → `/admin/roles/{id}/permissions`
   - Click "Permissions" next to role
   - Check boxes for desired permissions
   - Click "Save Permissions"

4. **Create Users** → `/admin/users`
   - Click "Create User"
   - Enter username, email, password, select role
   - Click "Create User"

5. **Manage Users** → `/admin/users`
   - Edit: Click "Edit" to change email/role
   - Password: Click "Password" to change or reset
   - Role: Click "Role" to assign different role
   - Status: Click "Activate/Deactivate"
   - Delete: Click "Delete" with confirmation

### Permission Checking in Components

```typescript
import { canCreate, canRead, canUpdate, canDelete } from '@/lib/permission-helper'
import { MODULES } from '@/lib/constants'

// In your component
if (canCreate(userPermissions, MODULES.ALBUMS)) {
  // Show create button
}

if (!canDelete(userPermissions, MODULES.CATEGORIES)) {
  // Hide delete button
}
```

## API Service Usage

### Get All Roles

```typescript
import { getRoles } from '@/lib/permission-service'

const data = await getRoles(1, 10) // page, limit
console.log(data.roles) // Array of roles
console.log(data.pagination) // Pagination info
```

### Create User

```typescript
import { createUser } from '@/lib/permission-service'

const user = await createUser({
  username: 'john.doe',
  email: 'john@example.com',
  password: 'SecurePassword123',
  role_id: 2
})
```

### Change Password

```typescript
import { changeUserPassword } from '@/lib/permission-service'

await changeUserPassword(userId, {
  old_password: 'OldPassword123',
  new_password: 'NewPassword456'
})
```

### Assign Permissions

```typescript
import { assignPermissionsBulk } from '@/lib/permission-service'
import { MODULES, PERMISSIONS } from '@/lib/constants'

await assignPermissionsBulk(roleId, [
  {
    module_id: MODULES.ALBUMS,
    permission_id: [PERMISSIONS.CREATE, PERMISSIONS.READ, PERMISSIONS.UPDATE]
  },
  {
    module_id: MODULES.CATEGORIES,
    permission_id: [PERMISSIONS.READ]
  }
])
```

## Features

### Roles Page
- ✅ List all roles with pagination
- ✅ Create new role
- ✅ Edit role
- ✅ Delete role
- ✅ Activate/Deactivate role
- ✅ Link to permission assignment

### Permission Assignment
- ✅ View all modules
- ✅ Assign permissions with checkboxes
- ✅ Bulk save permissions
- ✅ Visual module organization

### Users Page
- ✅ List all users with pagination
- ✅ Create new user
- ✅ Edit user details
- ✅ View assigned role
- ✅ Activate/Deactivate user
- ✅ Delete user
- ✅ Quick links to password and role management

### User Password Management
- ✅ Change password (with old password verification)
- ✅ Reset password (generate temporary)
- ✅ Toggle between change/reset modes
- ✅ Auto-redirect after success

### User Role Management
- ✅ View current role
- ✅ Assign new role
- ✅ Visual confirmation of role change

### Permissions Dashboard
- ✅ View all modules
- ✅ View all permissions
- ✅ Expandable module details
- ✅ Sub-modules list
- ✅ Quick role access

## Common Tasks

### Add Permission Checking to Existing Page

```typescript
'use client'
import { useEffect, useState } from 'react'
import { canCreate, canDelete } from '@/lib/permission-helper'
import { MODULES } from '@/lib/constants'

export default function MyPage() {
  const [permissions, setPermissions] = useState(null)
  
  useEffect(() => {
    // Load user permissions from API or context
  }, [])

  return (
    <div>
      {canCreate(permissions, MODULES.ALBUMS) && (
        <button>Create Album</button>
      )}
      {canDelete(permissions, MODULES.ALBUMS) && (
        <button>Delete Album</button>
      )}
    </div>
  )
}
```

### Create Protected Component

```typescript
import { ReactNode } from 'react'
import { canRead } from '@/lib/permission-helper'
import { MODULES } from '@/lib/constants'

interface ProtectedProps {
  moduleId: number
  permissions: any
  children: ReactNode
}

export function Protected({ moduleId, permissions, children }: ProtectedProps) {
  if (!canRead(permissions, moduleId)) {
    return <div className="text-red-600">Access denied</div>
  }
  return <>{children}</>
}
```

## Troubleshooting

### API Connection Issues

**Problem:** Getting "Failed to load data"

**Solution:**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running on correct port
- Check browser console for CORS errors
- Verify API endpoints exist in backend

### Permission Checks Not Working

**Problem:** Permissions showing as denied when they shouldn't

**Solution:**
- Verify role has permissions assigned
- Check role is assigned to user
- Verify user is active
- Check correct module/permission IDs in constants

### Form Not Submitting

**Problem:** Form submit button doesn't work

**Solution:**
- Check browser console for JavaScript errors
- Verify all required fields have values
- Check form validation is passing
- Verify API token if using authentication

## Support

For detailed API documentation, see:
- `/backend/README.md` - Backend API documentation
- `/PERMISSION_SYSTEM.md` - Complete system documentation
- `lib/permission-service.ts` - Service function documentation
- `lib/permission-helper.ts` - Helper function documentation

For backend setup and configuration:
- See `/backend/CRON_SETUP.md` for cron jobs
- See `/backend/README.md` for API endpoints
- Check `/backend/app/Controllers/PermissionController.php` for implementation

## Next Steps

1. Test role creation and permission assignment
2. Test user creation with roles
3. Test password change and reset
4. Test permission checking in existing pages
5. Integrate permission checks into album/category pages
6. Set up authentication context if needed
7. Configure dashboard based on user permissions
