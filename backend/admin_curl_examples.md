# Admin API - CURL Examples

## 1. Generate Captcha
```bash
curl -X GET "http://localhost:8080/api/admin/captcha" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "results": {
    "captcha_id": "cap_65a1b2c3d4e5f6.12345678",
    "captcha_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAo..."
  },
  "message": "Captcha generated successfully",
  "error_code": 200
}
```

## 2. Admin Login (with Captcha)
```bash
curl -X POST "http://localhost:8080/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123",
    "captcha_id": "cap_65a1b2c3d4e5f6.12345678",
    "captcha_text": "ABC12"
  }'
```

**Response (Success):**
```json
{
  "results": {
    "token": "def502004a8b9c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0"
  },
  "message": "Login successful",
  "error_code": 200
}
```

**Response (2FA Required):**
```json
{
  "results": {
    "requires_2fa": true
  },
  "message": "2FA code sent",
  "error_code": 200
}
```

## 3. Admin Login with 2FA
```bash
curl -X POST "http://localhost:8080/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123",
    "captcha_id": "cap_65a1b2c3d4e5f6.12345678",
    "captcha_text": "ABC12",
    "2fa_code": "123456"
  }'
```

## Usage Flow
1. **Get Captcha**: Call `/api/admin/captcha` to get captcha image and ID
2. **Display Image**: Show the base64 captcha image to user
3. **Login**: Submit username, password, captcha_id, and captcha_text
4. **Use Token**: Include token in Authorization header for protected routes

## Error Responses
- **400**: Missing fields, invalid captcha
- **401**: Invalid credentials
- **429**: Rate limit exceeded