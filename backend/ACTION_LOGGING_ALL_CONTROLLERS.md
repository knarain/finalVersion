# Action Logging Implementation - All Controllers

## Quick Implementation Checklist

Add this import to every admin controller:
```php
use App\Helpers\ActionLogHelper;
```

Then add logging after every successful operation.

---

## Albums Controller (`AlbumsAdmin.php`)

```php
// CREATE
$albumId = $this->albumModel->insert($data);
ActionLogHelper::logAction(
    'Created an Album',
    "Album created: {$data['title']} for client: {$data['client_names']}",
    'Admin',
    $albumId,
    $auth['id']
);

// UPDATE
$this->albumModel->update($id, $data);
ActionLogHelper::logAction(
    'Updated an Album',
    "Album ID {$id} updated",
    'Admin',
    $id,
    $auth['id']
);

// DELETE
$this->albumModel->delete($id);
ActionLogHelper::logAction(
    'Deleted an Album',
    "Album ID {$id} deleted",
    'Admin',
    $id,
    $auth['id']
);
```

---

## Packages Controller (`PackageController.php`)

```php
// CREATE
$packageId = $this->packageModel->insert($data);
ActionLogHelper::logAction(
    'Created a Package',
    "Package created: {$data['name']} with price: {$data['price']}",
    'Admin',
    $packageId,
    $auth['id']
);

// UPDATE
$this->packageModel->update($id, $data);
ActionLogHelper::logAction(
    'Updated a Package',
    "Package ID {$id} updated",
    'Admin',
    $id,
    $auth['id']
);

// DELETE
$this->packageModel->delete($id);
ActionLogHelper::logAction(
    'Deleted a Package',
    "Package ID {$id} deleted",
    'Admin',
    $id,
    $auth['id']
);
```

---

## Categories Controller

```php
// CREATE
$categoryId = $this->categoryModel->insert($data);
ActionLogHelper::logAction(
    'Created a Category',
    "Category created: {$data['name']}",
    'Admin',
    $categoryId,
    $auth['id']
);

// UPDATE
$this->categoryModel->update($id, $data);
ActionLogHelper::logAction(
    'Updated a Category',
    "Category ID {$id} updated",
    'Admin',
    $id,
    $auth['id']
);

// DELETE
$this->categoryModel->delete($id);
ActionLogHelper::logAction(
    'Deleted a Category',
    "Category ID {$id} deleted",
    'Admin',
    $id,
    $auth['id']
);
```

---

## Enquiries Controller

```php
// RESPOND TO ENQUIRY
$this->enquiryModel->update($id, ['status' => 'responded']);
ActionLogHelper::logAction(
    'Responded to Enquiry',
    "Enquiry ID {$id} marked as responded",
    'Admin',
    $id,
    $auth['id']
);

// DELETE ENQUIRY
$this->enquiryModel->delete($id);
ActionLogHelper::logAction(
    'Deleted an Enquiry',
    "Enquiry ID {$id} deleted",
    'Admin',
    $id,
    $auth['id']
);
```

---

## Roles Controller

```php
// CREATE ROLE
$roleId = $this->roleModel->insert($data);
ActionLogHelper::logAction(
    'Created a Role',
    "Role created: {$data['name']}",
    'Admin',
    $roleId,
    $auth['id']
);

// UPDATE ROLE
$this->roleModel->update($id, $data);
ActionLogHelper::logAction(
    'Updated a Role',
    "Role ID {$id} updated",
    'Admin',
    $id,
    $auth['id']
);

// DELETE ROLE
$this->roleModel->delete($id);
ActionLogHelper::logAction(
    'Deleted a Role',
    "Role ID {$id} deleted",
    'Admin',
    $id,
    $auth['id']
);
```

---

## Permissions Controller

```php
// ASSIGN PERMISSION
ActionLogHelper::logAction(
    'Assigned Permission',
    "Permission assigned to role ID {$roleId}",
    'Admin',
    $roleId,
    $auth['id']
);

// REVOKE PERMISSION
ActionLogHelper::logAction(
    'Revoked Permission',
    "Permission revoked from role ID {$roleId}",
    'Admin',
    $roleId,
    $auth['id']
);
```

---

## Settings Controller

```php
// UPDATE SETTINGS
$this->settingsModel->update($id, $data);
ActionLogHelper::logAction(
    'Updated Settings',
    "Settings updated: " . json_encode($data),
    'Admin',
    $id,
    $auth['id']
);
```

---

## Admin Controller (Profile Changes)

```php
// PROFILE UPDATE
$this->adminModel->update($auth['id'], $data);
ActionLogHelper::logAction(
    'Updated Profile',
    "Admin updated their profile",
    'Admin',
    $auth['id'],
    $auth['id']
);

// ENABLE 2FA
ActionLogHelper::logAction(
    'Enabled 2FA',
    "Admin enabled two-factor authentication",
    'Admin',
    $auth['id'],
    $auth['id']
);

// DISABLE 2FA
ActionLogHelper::logAction(
    'Disabled 2FA',
    "Admin disabled two-factor authentication",
    'Admin',
    $auth['id'],
    $auth['id']
);
```

---

## Standard Action Names

Use these consistent action names across all controllers:

### User Management
- Created a User
- Updated a User
- Deleted a User
- Changed Password
- Reset User Password
- Assigned Role to User
- Toggled User Status

### Album Management
- Created an Album
- Updated an Album
- Deleted an Album
- Uploaded Album Images
- Deleted Album Image

### Package Management
- Created a Package
- Updated a Package
- Deleted a Package
- Activated Package
- Deactivated Package

### Category Management
- Created a Category
- Updated a Category
- Deleted a Category

### Enquiry Management
- Responded to Enquiry
- Deleted an Enquiry
- Marked Enquiry as Read

### Role & Permission Management
- Created a Role
- Updated a Role
- Deleted a Role
- Assigned Permission
- Revoked Permission

### Settings & Profile
- Updated Settings
- Updated Profile
- Enabled 2FA
- Disabled 2FA
- Changed Password

---

## Testing

After implementing logging in a controller, test it:

```bash
# Create a user (should log action)
curl -X POST http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","email":"test@example.com"}'

# Check logs
curl http://localhost:8080/api/action-logs?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Important Notes

1. **Always log after successful operations** - Don't log if validation fails
2. **Include meaningful descriptions** - Help admins understand what changed
3. **Use consistent action names** - Makes filtering and reporting easier
4. **Include reference IDs** - Links logs to affected records
5. **Pass admin ID** - Use `$auth['id']` to track who made the change
6. **Handle errors gracefully** - Logging failures shouldn't break the main operation

---

## Verification

To verify all actions are being logged:

1. Go to Admin Panel → Action Logs
2. Perform an action (create, update, delete)
3. Refresh the logs page
4. New log entry should appear at the top

If logs aren't appearing:
- Check that the action_logs table exists
- Verify the controller has the import statement
- Check browser console for errors
- Check backend logs for database errors
