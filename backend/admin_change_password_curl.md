# Admin Change Password API - cURL Examples

## Change Admin Password

```bash
curl -X PUT "http://localhost:8080/api/admin/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword456"
  }'
```

### Request Body:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### Success Response (200):
```json
{
  "results": null,
  "message": "Password changed successfully",
  "error_code": 200
}
```

### Error Responses:

**Missing Token (401):**
```json
{
  "results": null,
  "message": "Missing token",
  "error_code": 401
}
```

**Invalid Current Password (401):**
```json
{
  "results": null,
  "message": "Current password is incorrect",
  "error_code": 401
}
```

**Validation Error (400):**
```json
{
  "results": null,
  "message": "Current password and new password are required",
  "error_code": 400
}
```

**Password Too Short (400):**
```json
{
  "results": null,
  "message": "New password must be at least 6 characters",
  "error_code": 400
}
```

## Database Changes:
- **password**: Stores hashed password (using password_hash())
- **watch_word**: Stores plain text password for reference

## Security Notes:
- Requires valid admin authentication token
- Validates current password before allowing change
- Minimum 6 character password requirement
- Stores both hashed and plain text versions as requested

## SQL to Add Column:
```sql
ALTER TABLE admins ADD COLUMN watch_word VARCHAR(255) NULL AFTER password;
```