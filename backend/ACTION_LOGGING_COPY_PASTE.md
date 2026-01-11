# Action Logging - Copy-Paste Code for All Controllers

## Step 1: Add Import to Every Controller

Add this line at the top of each controller file (after namespace):

```php
use App\Helpers\ActionLogHelper;
```

---

## AlbumsAdmin Controller

### In create() method - After successful insert:
```php
$albumId = $this->albumModel->insert($data);
$album = $this->albumModel->find($albumId);

ActionLogHelper::logAction(
    'Created an Album',
    "Album created: {$album['title']} for client: {$album['client_names']}",
    'Admin',
    $albumId,
    $auth['id']
);
```

### In update() method - After successful update:
```php
$this->albumModel->update($id, $data);

ActionLogHelper::logAction(
    'Updated an Album',
    "Album ID {$id} updated with data: " . json_encode($data),
    'Admin',
    $id,
    $auth['id']
);
```

### In delete() method - After successful delete:
```php
$album = $this->albumModel->find($id);
$this->albumModel->delete($id);

ActionLogHelper::logAction(
    'Deleted an Album',
    "Album ID {$id} deleted: {$album['title']}",
    'Admin',
    $id,
    $auth['id']
);
```

---

## PackageController

### In create() method - After successful insert:
```php
$packageId = $this->packageModel->insert($data);
$package = $this->packageModel->find($packageId);

ActionLogHelper::logAction(
    'Created a Package',
    "Package created: {$package['name']} with price: {$package['price']}",
    'Admin',
    $packageId,
    $auth['id']
);
```

### In update() method - After successful update:
```php
$this->packageModel->update($id, $data);

ActionLogHelper::logAction(
    'Updated a Package',
    "Package ID {$id} updated",
    'Admin',
    $id,
    $auth['id']
);
```

### In delete() method - After successful delete:
```php
$package = $this->packageModel->find($id);
$this->packageModel->delete($id);

ActionLogHelper::logAction(
    'Deleted a Package',
    "Package ID {$id} deleted: {$package['name']}",
    'Admin',
    $id,
    $auth['id']
);
```

---

## CategoryModel Controller

### In create() method - After successful insert:
```php
$categoryId = $this->categoryModel->insert($data);
$category = $this->categoryModel->find($categoryId);

ActionLogHelper::logAction(
    'Created a Category',
    "Category created: {$category['name']}",
    'Admin',
    $categoryId,
    $auth['id']
);
```

### In update() method - After successful update:
```php
$this->categoryModel->update($id, $data);

ActionLogHelper::logAction(
    'Updated a Category',
    "Category ID {$id} updated",
    'Admin',
    $id,
    $auth['id']
);
```

### In delete() method - After successful delete:
```php
$category = $this->categoryModel->find($id);
$this->categoryModel->delete($id);

ActionLogHelper::logAction(
    'Deleted a Category',
    "Category ID {$id} deleted: {$category['name']}",
    'Admin',
    $id,
    $auth['id']
);
```

---

## Enquiries Controller

### In respond() method - After marking as responded:
```php
$this->enquiryModel->update($id, ['status' => 'responded']);

ActionLogHelper::logAction(
    'Responded to Enquiry',
    "Enquiry ID {$id} marked as responded",
    'Admin',
    $id,
    $auth['id']
);
```

### In delete() method - After successful delete:
```php
$enquiry = $this->enquiryModel->find($id);
$this->enquiryModel->delete($id);

ActionLogHelper::logAction(
    'Deleted an Enquiry',
    "Enquiry ID {$id} deleted from {$enquiry['email']}",
    'Admin',
    $id,
    $auth['id']
);
```

---

## RoleController

### In create() method - After successful insert:
```php
$roleId = $this->roleModel->insert($data);
$role = $this->roleModel->find($roleId);

ActionLogHelper::logAction(
    'Created a Role',
    "Role created: {$role['name']}",
    'Admin',
    $roleId,
    $auth['id']
);
```

### In update() method - After successful update:
```php
$this->roleModel->update($id, $data);

ActionLogHelper::logAction(
    'Updated a Role',
    "Role ID {$id} updated",
    'Admin',
    $id,
    $auth['id']
);
```

### In delete() method - After successful delete:
```php
$role = $this->roleModel->find($id);
$this->roleModel->delete($id);

ActionLogHelper::logAction(
    'Deleted a Role',
    "Role ID {$id} deleted: {$role['name']}",
    'Admin',
    $id,
    $auth['id']
);
```

---

## PermissionController

### In assignPermission() method - After successful assignment:
```php
// After assigning permission
ActionLogHelper::logAction(
    'Assigned Permission',
    "Permission {$permissionId} assigned to role ID {$roleId}",
    'Admin',
    $roleId,
    $auth['id']
);
```

### In revokePermission() method - After successful revocation:
```php
// After revoking permission
ActionLogHelper::logAction(
    'Revoked Permission',
    "Permission {$permissionId} revoked from role ID {$roleId}",
    'Admin',
    $roleId,
    $auth['id']
);
```

---

## Admin Controller (Profile Changes)

### In profileUpdate() method - After successful update:
```php
$this->adminModel->update($auth['id'], $updateData);

ActionLogHelper::logAction(
    'Updated Profile',
    "Admin updated their profile",
    'Admin',
    $auth['id'],
    $auth['id']
);
```

### In enable2FA() method - After successful enable:
```php
$this->adminModel->update($auth['id'], ['two_factor_enabled' => true]);

ActionLogHelper::logAction(
    'Enabled 2FA',
    "Admin enabled two-factor authentication",
    'Admin',
    $auth['id'],
    $auth['id']
);
```

### In disable2FA() method - After successful disable:
```php
$this->adminModel->update($auth['id'], ['two_factor_enabled' => false]);

ActionLogHelper::logAction(
    'Disabled 2FA',
    "Admin disabled two-factor authentication",
    'Admin',
    $auth['id'],
    $auth['id']
);
```

---

## TaskController (If Exists)

### In create() method - After successful insert:
```php
$taskId = $this->taskModel->insert($data);

ActionLogHelper::logAction(
    'Created a Task',
    "Task created: {$data['title']}",
    'Admin',
    $taskId,
    $auth['id']
);
```

### In update() method - After successful update:
```php
$this->taskModel->update($id, $data);

ActionLogHelper::logAction(
    'Updated a Task',
    "Task ID {$id} updated",
    'Admin',
    $id,
    $auth['id']
);
```

### In delete() method - After successful delete:
```php
$this->taskModel->delete($id);

ActionLogHelper::logAction(
    'Deleted a Task',
    "Task ID {$id} deleted",
    'Admin',
    $id,
    $auth['id']
);
```

---

## DashboardController (If Exists)

### In any update method:
```php
ActionLogHelper::logAction(
    'Updated Dashboard Settings',
    "Dashboard settings updated",
    'Admin',
    0,
    $auth['id']
);
```

---

## Implementation Checklist

- [ ] Add `use App\Helpers\ActionLogHelper;` to each controller
- [ ] Add logging to create() methods
- [ ] Add logging to update() methods
- [ ] Add logging to delete() methods
- [ ] Add logging to other important methods (enable/disable, assign, etc.)
- [ ] Test each action to verify logging works
- [ ] Check frontend at `/admin/action-logs` to see logs
- [ ] Verify logs appear in real-time

---

## Testing Each Controller

After adding logging to a controller, test it:

```bash
# Example: Create an album
curl -X POST http://localhost:8080/api/albums \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Album",
    "client_names": "John Doe",
    "event_type": "Wedding"
  }'

# Check logs
curl http://localhost:8080/api/action-logs?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Patterns

### Pattern 1: Simple CRUD
```php
// CREATE
$id = $this->model->insert($data);
ActionLogHelper::logAction('Created a X', "X created: {$data['name']}", 'Admin', $id, $auth['id']);

// UPDATE
$this->model->update($id, $data);
ActionLogHelper::logAction('Updated a X', "X ID {$id} updated", 'Admin', $id, $auth['id']);

// DELETE
$this->model->delete($id);
ActionLogHelper::logAction('Deleted a X', "X ID {$id} deleted", 'Admin', $id, $auth['id']);
```

### Pattern 2: Status Changes
```php
$this->model->update($id, ['status' => $newStatus]);
ActionLogHelper::logAction(
    'Changed X Status',
    "X ID {$id} status changed to {$newStatus}",
    'Admin',
    $id,
    $auth['id']
);
```

### Pattern 3: Assignments
```php
$this->model->update($id, ['assigned_to' => $userId]);
ActionLogHelper::logAction(
    'Assigned X',
    "X ID {$id} assigned to user ID {$userId}",
    'Admin',
    $id,
    $auth['id']
);
```

---

## Notes

- Always log AFTER the operation succeeds
- Use descriptive action names
- Include relevant details in description
- Pass the correct reference ID
- Use `$auth['id']` for the admin ID
- Don't log if validation fails
- Logging failures won't break the main operation
