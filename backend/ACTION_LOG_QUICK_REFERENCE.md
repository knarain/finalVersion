# Action Log System - Quick Reference

## Files Created

1. **SQL Migration**
   - `backend/sql/create_action_logs_table.sql` - Database table creation

2. **Backend Model**
   - `backend/app/Models/ActionLogModel.php` - Database operations

3. **Backend Controller**
   - `backend/app/Controllers/Api/ActionLogController.php` - API endpoints

4. **Backend Helper**
   - `backend/app/Helpers/ActionLogHelper.php` - Logging utility

5. **Documentation**
   - `backend/ACTION_LOG_IMPLEMENTATION.md` - Full implementation guide

## Quick Setup

### 1. Create Database Table
Run the SQL file in phpMyAdmin:
```sql
CREATE TABLE IF NOT EXISTS action_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  action_name VARCHAR(255) NOT NULL,
  action_date DATETIME NOT NULL,
  ip_address VARCHAR(45),
  action_by_admin INT,
  description LONGTEXT,
  action_applied_for VARCHAR(100),
  reference_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_action_date (action_date),
  INDEX idx_action_by_admin (action_by_admin),
  INDEX idx_action_applied_for (action_applied_for),
  FOREIGN KEY (action_by_admin) REFERENCES admins(id) ON DELETE SET NULL
);
```

### 2. Add Routes
In `backend/app/Config/Routes.php`:
```php
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function ($routes) {
    $routes->get('action-logs', 'ActionLogController::getLogs');
    $routes->get('action-logs/admin/(:num)', 'ActionLogController::getLogsByAdmin/$1');
    $routes->get('action-logs/action/(:any)', 'ActionLogController::getLogsByAction/$1');
    $routes->get('action-logs/date-range', 'ActionLogController::getLogsByDateRange');
});
```

### 3. Add Logging to Controllers
In any admin controller (e.g., UserController):
```php
use App\Helpers\ActionLogHelper;

// After successful operation
ActionLogHelper::logAction(
    'Created a User',
    "Admin created user: {$user['username']} with email: {$user['email']}",
    'Admin',
    $userId
);
```

### 4. Create Frontend Page
Create `app/admin/action-logs/page.tsx` (see full guide for complete code)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/action-logs?page=1&limit=20` | Get all logs |
| GET | `/api/action-logs/admin/:adminId` | Get logs by admin |
| GET | `/api/action-logs/action/:actionName` | Get logs by action |
| GET | `/api/action-logs/date-range?start=DATE&end=DATE` | Get logs by date |

## Usage Example

```php
// In UserController.php create() method
$userId = $this->adminModel->insert($data);

ActionLogHelper::logAction(
    'Created a User',
    "Admin created user: {$data['username']}",
    'Admin',
    $userId
);
```

## Database Fields

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| action_name | VARCHAR(255) | Action type (e.g., "Created a User") |
| action_date | DATETIME | When action occurred |
| ip_address | VARCHAR(45) | Admin's IP address |
| action_by_admin | INT | Admin ID (FK to admins table) |
| description | LONGTEXT | Detailed description |
| action_applied_for | VARCHAR(100) | Category (e.g., "Admin") |
| reference_id | INT | ID of affected record |

## Common Action Names

- Created a User
- Updated a User
- Deleted a User
- Created an Album
- Updated an Album
- Deleted an Album
- Created a Package
- Updated a Package
- Deleted a Package
- Responded to Enquiry
- Updated Settings

## Testing

### Test Create Log
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","email":"test@example.com"}'
```

### Test Get Logs
```bash
curl http://localhost:8080/api/action-logs?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

- Logs are automatically created with current timestamp and IP address
- Admin ID is extracted from the authentication token
- All API endpoints require admin authentication
- Logs are indexed by date, admin, and action type for fast queries
- Old logs can be deleted using a CRON job (see full guide)
