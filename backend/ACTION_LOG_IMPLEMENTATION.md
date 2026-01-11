# Action Log System Implementation Guide

## Overview
This guide explains how to implement the action logging system for tracking admin activities in your application.

## Files Created

### 1. Database Migration
**File:** `backend/sql/create_action_logs_table.sql`

Run this SQL to create the action_logs table:
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

### 2. Model
**File:** `backend/app/Models/ActionLogModel.php`

Handles all database operations for action logs.

### 3. Controller
**File:** `backend/app/Controllers/Api/ActionLogController.php`

Provides API endpoints for retrieving action logs:
- `GET /api/action-logs` - Get all logs with pagination
- `GET /api/action-logs/admin/:adminId` - Get logs by admin
- `GET /api/action-logs/action/:actionName` - Get logs by action type
- `GET /api/action-logs/date-range` - Get logs by date range

### 4. Helper
**File:** `backend/app/Helpers/ActionLogHelper.php`

Provides the `logAction()` method for easy logging in controllers.

## How to Use

### Step 1: Add Routes
Add these routes to `backend/app/Config/Routes.php`:

```php
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function ($routes) {
    // Action Logs
    $routes->get('action-logs', 'ActionLogController::getLogs');
    $routes->get('action-logs/admin/(:num)', 'ActionLogController::getLogsByAdmin/$1');
    $routes->get('action-logs/action/(:any)', 'ActionLogController::getLogsByAction/$1');
    $routes->get('action-logs/date-range', 'ActionLogController::getLogsByDateRange');
});
```

### Step 2: Add Logging to Admin APIs

In any admin controller (e.g., `UserController.php`), add logging at the end of successful operations:

```php
<?php
namespace App\Controllers\Api;

use App\Helpers\ActionLogHelper;

class UserController extends BaseController
{
    public function create()
    {
        // ... existing code ...
        
        $userId = $this->adminModel->insert($data);
        $user = $this->adminModel->getAdminWithRole($userId);
        
        // Log the action
        ActionLogHelper::logAction(
            'Created a User',
            "Admin created user: {$user['username']} with email: {$user['email']}",
            'Admin',
            $userId
        );
        
        return Utils::formatApiResponse(
            $user,
            'User created successfully',
            ResponseInterface::HTTP_CREATED
        );
    }
    
    public function update($id)
    {
        // ... existing code ...
        
        $this->adminModel->update($id, $data);
        
        // Log the action
        ActionLogHelper::logAction(
            'Updated a User',
            "Admin updated user ID: {$id}",
            'Admin',
            $id
        );
        
        return Utils::formatApiResponse(
            $this->adminModel->getAdminWithRole($id),
            'User updated successfully'
        );
    }
    
    public function delete($id)
    {
        // ... existing code ...
        
        $this->adminModel->delete($id);
        
        // Log the action
        ActionLogHelper::logAction(
            'Deleted a User',
            "Admin deleted user ID: {$id}",
            'Admin',
            $id
        );
        
        return Utils::formatApiResponse(null, 'User deleted successfully');
    }
}
```

### Step 3: Frontend Integration

Create a new page at `app/admin/action-logs/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'

export default function ActionLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchLogs()
  }, [page])

  const fetchLogs = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/action-logs?page=${page}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      )
      setLogs(res.data.results.data)
      setTotalPages(res.data.results.pagination.pages)
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Action Logs</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3 text-left">Action</th>
              <th className="border p-3 text-left">Admin</th>
              <th className="border p-3 text-left">Date</th>
              <th className="border p-3 text-left">IP Address</th>
              <th className="border p-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="border p-3">{log.action_name}</td>
                <td className="border p-3">{log.admin_username || 'System'}</td>
                <td className="border p-3">
                  {format(new Date(log.action_date), 'MMM dd, yyyy HH:mm:ss')}
                </td>
                <td className="border p-3">{log.ip_address}</td>
                <td className="border p-3 text-sm">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

## API Response Examples

### Get All Logs
```
GET /api/action-logs?page=1&limit=20
```

Response:
```json
{
  "results": {
    "data": [
      {
        "id": 1,
        "action_name": "Created a User",
        "action_date": "2024-01-15 10:30:45",
        "ip_address": "192.168.1.1",
        "action_by_admin": 1,
        "admin_username": "admin",
        "description": "Admin created user: john_doe with email: john@example.com",
        "action_applied_for": "Admin",
        "reference_id": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  },
  "message": "Action logs fetched successfully",
  "error_code": 200
}
```

## Best Practices

1. **Always log at the end of successful operations** - Log after the database operation succeeds
2. **Include meaningful descriptions** - Provide context about what was changed
3. **Use consistent action names** - e.g., "Created a User", "Updated a User", "Deleted a User"
4. **Include reference IDs** - Link logs to the affected records
5. **Handle logging errors gracefully** - Don't let logging failures break the main operation

## Example: Adding Logging to Multiple Controllers

### Albums Controller
```php
ActionLogHelper::logAction(
    'Created an Album',
    "Album created: {$album['title']} for client: {$album['client_names']}",
    'Admin',
    $albumId
);
```

### Packages Controller
```php
ActionLogHelper::logAction(
    'Created a Package',
    "Package created: {$package['name']} with price: {$package['price']}",
    'Admin',
    $packageId
);
```

### Enquiries Controller
```php
ActionLogHelper::logAction(
    'Responded to Enquiry',
    "Enquiry ID {$enquiryId} responded by admin",
    'Admin',
    $enquiryId
);
```

## Querying Logs

### By Date Range
```
GET /api/action-logs/date-range?start=2024-01-01&end=2024-01-31&page=1&limit=20
```

### By Admin
```
GET /api/action-logs/admin/1?page=1&limit=20
```

### By Action Type
```
GET /api/action-logs/action/Created%20a%20User?page=1&limit=20
```

## Database Cleanup (Optional)

To clean up old logs (older than 90 days):
```sql
DELETE FROM action_logs WHERE action_date < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

Or create a CRON job to run this periodically.
