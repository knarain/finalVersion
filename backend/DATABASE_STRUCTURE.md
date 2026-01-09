# Database Relationships & Structure

## Entity Relationship Diagram

```
┌─────────────────┐
│     modules     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ slug            │
│ parent_id (FK)  │ ──────┐
│ is_sub_module   │       │
│ icon            │       │
│ order           │       │
│ created_at      │       │
│ updated_at      │       │
└─────────────────┘       │
        ▲                  │
        │                  │
        └──────────────────┘ (Hierarchical: Module can be parent of other modules)


┌──────────────────┐
│  permissions     │
├──────────────────┤
│ id (PK)          │
│ name             │
│ slug             │
│ description      │
│ created_at       │
│ updated_at       │
└──────────────────┘


┌──────────────────┐
│     roles        │
├──────────────────┤
│ id (PK)          │
│ name             │
│ description      │
│ is_active        │
│ created_at       │
│ updated_at       │
└──────────────────┘


┌────────────────────────────────┐
│  role_module_permissions       │  ◄── Junction Table
├────────────────────────────────┤
│ id (PK)                        │
│ role_id (FK) ──────────────┐   │
│ module_id (FK) ──────┐     │   │
│ permission_id (FK)───┼─┐   │   │
│ created_at           │ │   │   │
└────────────────────────────────┘
                       │ │   │
        ┌──────────────┘ │   │
        │                │   │
        │  ┌─────────────┘   │
        │  │                 │
        │  │   ┌─────────────┘
        │  │   │
        ▼  ▼   ▼
    modules permissions roles


┌──────────────────┐
│     admins       │
├──────────────────┤
│ id (PK)          │
│ role_id (FK) ────────┐
│ username         │    │
│ email            │    │
│ password_hash    │    │
│ watch_word       │    │
│ is_active        │    │
│ two_factor_en... │    │
│ created_at       │    │
│ updated_at       │    │
└──────────────────┘    │
                        │
                        ▼
                    roles
```

## Data Flow & Relationships

### 1. Role → Module → Permission

A role has many module-permission combinations:

```
Role "Editor"
├── Module "Albums"
│   ├── Permission "Create"
│   ├── Permission "Read"
│   └── Permission "Update"
├── Module "Categories"
│   ├── Permission "Create"
│   ├── Permission "Read"
│   └── Permission "Update"
└── Module "Dashboard"
    └── Permission "Read"
```

### 2. Admin → Role → Permissions

When admin is assigned a role, they inherit all its permissions:

```
Admin User "john_editor"
└── Role "Editor" (assigned)
    ├── Permission for Albums: Create, Read, Update
    ├── Permission for Categories: Create, Read, Update
    └── Permission for Dashboard: Read

Result: John can CREATE/READ/UPDATE albums, 
        CREATE/READ/UPDATE categories, 
        READ dashboard only
```

## SQL Query Examples

### Get all permissions for a user
```sql
SELECT DISTINCT 
    rmp.permission_id,
    p.name,
    p.slug,
    rmp.module_id,
    m.name as module_name
FROM role_module_permissions rmp
JOIN permissions p ON p.id = rmp.permission_id
JOIN modules m ON m.id = rmp.module_id
WHERE rmp.role_id = (
    SELECT role_id FROM admins WHERE id = 1
)
ORDER BY m.id, p.id;
```

### Check if user has specific permission
```sql
SELECT COUNT(*) as has_permission
FROM role_module_permissions rmp
WHERE rmp.role_id = (
    SELECT role_id FROM admins WHERE id = 1
)
AND rmp.module_id = 4        -- Albums module
AND rmp.permission_id = 1;   -- Create permission
```

### Get all modules accessible by a role
```sql
SELECT DISTINCT m.*
FROM role_module_permissions rmp
JOIN modules m ON m.id = rmp.module_id
WHERE rmp.role_id = 2
ORDER BY m.parent_id, m.order;
```

### Get role hierarchy
```sql
SELECT r.*, COUNT(DISTINCT rmp.module_id) as total_modules,
       COUNT(DISTINCT rmp.permission_id) as total_permissions
FROM roles r
LEFT JOIN role_module_permissions rmp ON r.id = rmp.role_id
GROUP BY r.id;
```

### Get admin with role and permissions
```sql
SELECT 
    a.*,
    r.name as role_name,
    r.description as role_description,
    GROUP_CONCAT(DISTINCT m.name) as accessible_modules
FROM admins a
LEFT JOIN roles r ON a.role_id = r.id
LEFT JOIN role_module_permissions rmp ON r.id = rmp.role_id
LEFT JOIN modules m ON rmp.module_id = m.id
WHERE a.id = 3
GROUP BY a.id;
```

## Table Relationships

### One-to-Many Relationships

1. **modules → modules** (Self-referential)
   - Parent module has many sub-modules
   - Example: "Albums" (parent) has "My Albums" and "Public Albums" (children)

2. **roles → admins**
   - One role can be assigned to many admins
   - One admin has one role

3. **roles → role_module_permissions**
   - One role can have many permission mappings

4. **modules → role_module_permissions**
   - One module can have many permission mappings (across different roles)

5. **permissions → role_module_permissions**
   - One permission can be assigned to many role-module combinations

### Many-to-Many Relationships

- **roles ←→ modules ←→ permissions** (through role_module_permissions)
  - Roles are linked to modules with specific permissions
  - A module can have different permission sets for different roles

## Key Constraints

### Foreign Keys
```sql
-- modules table
ALTER TABLE modules ADD CONSTRAINT fk_modules_parent_id 
FOREIGN KEY (parent_id) REFERENCES modules(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- role_module_permissions table
ALTER TABLE role_module_permissions ADD CONSTRAINT fk_rmp_role_id 
FOREIGN KEY (role_id) REFERENCES roles(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE role_module_permissions ADD CONSTRAINT fk_rmp_module_id 
FOREIGN KEY (module_id) REFERENCES modules(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE role_module_permissions ADD CONSTRAINT fk_rmp_permission_id 
FOREIGN KEY (permission_id) REFERENCES permissions(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- admins table
ALTER TABLE admins ADD CONSTRAINT fk_admins_role_id 
FOREIGN KEY (role_id) REFERENCES roles(id) 
ON DELETE SET NULL ON UPDATE CASCADE;
```

### Cascading Deletes
- When a role is deleted, all its role_module_permissions are deleted
- When a module is deleted, all its role_module_permissions are deleted
- When a permission is deleted, all its role_module_permissions are deleted
- When a role is deleted, admin's role_id is set to NULL (not deleted)

### Unique Constraints
- `roles.name` - Role names must be unique
- `modules.slug` - Module slugs must be unique
- `permissions.slug` - Permission slugs must be unique

## Indexing

### Recommended Indexes
```sql
-- For faster lookups
CREATE INDEX idx_modules_parent_id ON modules(parent_id);
CREATE INDEX idx_modules_slug ON modules(slug);
CREATE INDEX idx_permissions_slug ON permissions(slug);
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_admins_role_id ON admins(role_id);
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_rmp_role_id ON role_module_permissions(role_id);
CREATE INDEX idx_rmp_module_id ON role_module_permissions(module_id);
CREATE INDEX idx_rmp_permission_id ON role_module_permissions(permission_id);

-- For composite lookups
CREATE INDEX idx_rmp_composite ON role_module_permissions(role_id, module_id, permission_id);
```

## Data Integrity

### Validation Rules

1. **Roles**
   - Name is required and unique
   - Name must be 1-100 characters

2. **Modules**
   - Name is required and unique per parent
   - Slug is required and globally unique
   - parent_id must reference existing module if provided
   - order is used for sorting (default 0)

3. **Permissions**
   - Name is required and unique
   - Slug is required and unique
   - Standard CRUD operations: create, read, update, delete

4. **Admin Users**
   - Username is required and unique
   - Password hash is required
   - Email is optional but must be unique if provided
   - role_id must reference existing role if provided
   - is_active must be 0 or 1

5. **Role-Module-Permissions**
   - All three foreign keys are required
   - Composite of (role_id, module_id, permission_id) should be unique

## Example Data

### Initial Modules
```
1. Dashboard (parent_id: NULL)
   ├─ 2. User Dashboard (parent_id: 1) [sub-module]
   └─ 3. Analytics (parent_id: 1) [sub-module]

2. Users (parent_id: NULL)
   ├─ 4. Admin Users (parent_id: 2) [sub-module]
   └─ 5. User Roles (parent_id: 2) [sub-module]

3. Albums (parent_id: NULL)
   └─ 6. Album Categories (parent_id: 3) [sub-module]

4. Settings (parent_id: NULL)
```

### Initial Permissions
```
1. Create
2. Read
3. Update
4. Delete
```

### Initial Roles
```
1. Super Admin (is_active: 1) - Has ALL permissions on ALL modules
2. Editor (is_active: 1) - Can manage Albums and Categories
3. Viewer (is_active: 1) - Read-only access
```

### Relationships
```
Role "Super Admin" (id: 1)
├─ Dashboard → [Create, Read, Update, Delete]
├─ Users → [Create, Read, Update, Delete]
├─ Albums → [Create, Read, Update, Delete]
└─ Settings → [Create, Read, Update, Delete]

Role "Editor" (id: 2)
├─ Dashboard → [Read]
├─ Albums → [Create, Read, Update]
└─ Album Categories → [Create, Read, Update]

Role "Viewer" (id: 3)
├─ Dashboard → [Read]
└─ Albums → [Read]
```

## Migration & Rollback

### Migrate Up
```bash
php spark migrate
```
- Creates all tables with proper relationships

### Migrate Down
```bash
php spark migrate:rollback
```
- Removes all new tables and columns from admins table

### Fresh Migration (for development only!)
```bash
php spark migrate:refresh
php spark db:seed PermissionSeeder
```
- Drops and recreates all tables with fresh data
