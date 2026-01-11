# Dynamic Role-Based Permission System

## Overview
This system provides a complete role-based permission management where the backend controls all menu items, permissions, and UI elements. Nothing is static in the frontend - everything comes from the backend based on user roles.

## Backend Implementation

### 1. Database Structure
- **roles**: User roles (Admin, Manager, etc.)
- **modules**: Main modules and sub-modules with icons and URLs
- **permissions**: CRUD permissions (1=READ, 2=CREATE, 3=UPDATE, 4=DELETE)
- **role_module_permissions**: Junction table linking roles to modules with specific permissions

### 2. API Endpoints

#### Get Menu Structure for Role
```
GET /api/permissions/menu/{role_id}
```
Returns the complete menu structure with icons and URLs for a specific role.

**Response Format:**
```json
[
  {
    "role_id": "17",
    "module_info": {
      "id": 2,
      "name": "Customers",
      "is_sub_module": false,
      "permissions": [1, 2, 3, 4],
      "icon": "users",
      "url": "/customers"
    },
    "sub_module_info": [
      {
        "id": 3,
        "name": "Customer List",
        "is_sub_module": true,
        "permissions": [1, 2, 3, 4],
        "icon": "list",
        "url": "/customers/list"
      }
    ]
  }
]
```

#### Check Permission
```
POST /api/permissions/check
Body: { "role_id": 17, "module_id": 2, "permission_id": 1 }
```

### 3. Database Setup
Run the SQL script to set up your modules:
```sql
-- Run this in your database
SOURCE backend/sql/update_modules_structure.sql;
```

## Frontend Implementation

### 1. Permission Hook
```typescript
import { usePermissions, PERMISSIONS } from '../lib/use-permissions';

const { permissions, loading, hasPermission } = usePermissions(roleId);

// Check if user can create customers
const canCreateCustomer = hasPermission(2, PERMISSIONS.CREATE);
```

### 2. Dynamic Sidebar
```tsx
import DynamicSidebar from '../components/dynamic-sidebar';

<DynamicSidebar roleId="17" currentPath="/customers" />
```

### 3. Permission Guards
```tsx
import PermissionGuard from '../components/permission-guard';

// Show button only if user has CREATE permission for Customers module
<PermissionGuard roleId="17" moduleId={2} permission={PERMISSIONS.CREATE}>
  <button>Add Customer</button>
</PermissionGuard>
```

### 4. Page Protection
```tsx
import { withPermission } from '../components/permission-guard';

const CustomersPage = () => <div>Customers content</div>;

// Protect entire page - user needs READ permission for Customers module
export default withPermission(CustomersPage, 2, PERMISSIONS.READ);
```

### 5. Complete Layout Example
```tsx
import AdminLayout from '../components/admin-layout';

export default function MyPage() {
  const roleId = "17"; // Get from auth context
  
  return (
    <AdminLayout roleId={roleId}>
      <div>Your page content</div>
    </AdminLayout>
  );
}
```

## Module IDs Reference

### Main Modules
- 2: Customers
- 4: Billing  
- 9: Reports
- 13: Supports
- 14: User Management
- 18: Settings

### Sub-Modules
- 3: Customer List (under Customers)
- 5: Billing Information (under Billing)
- 6: Payment Details (under Billing)
- 7: Invoice (under Billing)
- 8: Create Invoice (under Billing)
- 10: Revenue (under Reports)
- 11: User logs (under Reports)
- 25: Customer logs (under Reports)
- 21: Manage Tickets (under Supports)
- 22: Create Tickets (under Supports)
- 23: Tickets Categories (under Supports)
- 24: Create Categories (under Supports)
- 26: Predefined Replies (under Supports)
- 15: User List (under User Management)
- 16: User Role (under User Management)
- 17: Access Privileges (under User Management)
- 19: Plans (under Settings)
- 20: Promocode (under Settings)

## Permission Types
- 1: READ (View/List)
- 2: CREATE (Add new)
- 3: UPDATE (Edit existing)
- 4: DELETE (Remove)

## Usage Examples

### 1. Show different buttons based on permissions
```tsx
<div className="flex space-x-2">
  <PermissionGuard roleId={roleId} moduleId={2} permission={PERMISSIONS.CREATE}>
    <button className="btn-primary">Add Customer</button>
  </PermissionGuard>
  
  <PermissionGuard roleId={roleId} moduleId={2} permission={PERMISSIONS.UPDATE}>
    <button className="btn-secondary">Edit</button>
  </PermissionGuard>
  
  <PermissionGuard roleId={roleId} moduleId={2} permission={PERMISSIONS.DELETE}>
    <button className="btn-danger">Delete</button>
  </PermissionGuard>
</div>
```

### 2. Conditional table columns
```tsx
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <PermissionGuard roleId={roleId} moduleId={2} permission={PERMISSIONS.UPDATE}>
        <th>Actions</th>
      </PermissionGuard>
    </tr>
  </thead>
</table>
```

### 3. Multiple permission checks
```tsx
import { useMultiplePermissions } from '../components/permission-guard';

const { hasAnyPermission, hasAllPermissions } = useMultiplePermissions(roleId, [
  { moduleId: 2, permission: PERMISSIONS.CREATE },
  { moduleId: 2, permission: PERMISSIONS.UPDATE }
]);

if (hasAnyPermission) {
  // Show form
}
```

## Environment Variables
Set in your `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Key Features
1. **Completely Dynamic**: No hardcoded menus or permissions in frontend
2. **Icon Support**: Each module has configurable icons
3. **URL Mapping**: Each module has its route URL
4. **Hierarchical**: Supports parent-child module relationships
5. **Granular Permissions**: CRUD-level permission control
6. **Loading States**: Built-in loading and error handling
7. **Type Safe**: Full TypeScript support

## Testing
1. Create a user with role ID 17
2. Access `/api/permissions/menu/17` to see the menu structure
3. Use the frontend components to see dynamic rendering
4. Modify permissions in database and see real-time changes

This system ensures that all UI elements, menus, and access controls are driven by the backend, providing a secure and maintainable role-based permission system.