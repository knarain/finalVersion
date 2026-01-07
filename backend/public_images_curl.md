# Public Album Images API - CURL Examples

## 1. Get Album Images (Unlocked Album)
```bash
curl -X GET "http://localhost:8080/api/albums/code/rsp106b45df0200c6/images" \
  -H "Content-Type: application/json"
```

## 2. Get Album Images (Locked Album - Returns 401)
```bash
curl -X GET "http://localhost:8080/api/albums/code/rsp106b45df0200c6/images" \
  -H "Content-Type: application/json"
```
**Response**: 401 - "Album is locked. Token required."

## 3. Authenticate to Get Token
```bash
curl -X POST "http://localhost:8080/api/albums/code/rsp106b45df0200c6/authenticate" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "password123"
  }'
```

## 4. Get Album Images with Token
```bash
curl -X GET "http://localhost:8080/api/albums/code/rsp106b45df0200c6/images" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

## Response Example
```json
{
  "results": [
    {
      "id": 1,
      "fileName": "img_001.webp",
      "fileUrl": "uploads/albums/5/img_001.webp",
      "caption": "Photo caption"
    }
  ],
  "message": "Album images fetched successfully",
  "error_code": 200
}
```