# Album Code-Based API Endpoints - CURL Examples

## 1. Get Album Images by Code (Unlocked Album)
```bash
curl -X GET "http://localhost:8080/api/albums/code/ALB123ABC456/images" \
  -H "Content-Type: application/json"
```

## 2. Get Album Images by Code (Locked Album - No Token)
```bash
curl -X GET "http://localhost:8080/api/albums/code/ALB123ABC456/images" \
  -H "Content-Type: application/json"
```
**Response**: 401 Unauthorized - "Album is locked. Token required."

## 3. Authenticate with Album Code (Get Token)
```bash
curl -X POST "http://localhost:8080/api/albums/code/ALB123ABC456/authenticate" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "clientpassword"
  }'
```
**Response**:
```json
{
  "results": {
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "expiresAt": "2024-01-15 18:30:00"
  },
  "message": "Authentication successful",
  "error_code": 200
}
```

## 4. Get Album Images by Code (Locked Album - With Token)
```bash
curl -X GET "http://localhost:8080/api/albums/code/ALB123ABC456/images" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

## 5. Get Albums by Category with Pagination
```bash
curl -X GET "http://localhost:8080/api/albums/category/1?page=1&page_size=5" \
  -H "Content-Type: application/json"
```

## Response Examples

### Successful Image Fetch (Unlocked Album)
```json
{
  "results": [
    {
      "id": 1,
      "fileName": "img_001.webp",
      "fileUrl": "uploads/albums/5/img_001.webp",
      "caption": "Beautiful sunset"
    },
    {
      "id": 2,
      "fileName": "img_002.webp", 
      "fileUrl": "uploads/albums/5/img_002.webp",
      "caption": "Mountain view"
    }
  ],
  "message": "Album images fetched successfully",
  "error_code": 200
}
```

### Albums by Category with Pagination
```json
{
  "results": {
    "category": {
      "id": 1,
      "name": "Wedding"
    },
    "albums": [
      {
        "id": 5,
        "clientNames": "John & Jane",
        "eventDate": "2024-01-15",
        "coverImage": "uploads/album/5/cover.webp",
        "isLocked": true
      }
    ],
    "pagination": {
      "page_number": 1,
      "page_size": 5,
      "total_pages": 3,
      "total_items": 15
    }
  },
  "message": "Albums fetched successfully",
  "error_code": 200
}
```

## Key Features

1. **Album Code**: Each album gets a unique code like `ALB123ABC456` for public access
2. **Security**: Locked albums require authentication to get token
3. **Token-Based Access**: Use Bearer token in Authorization header for locked albums
4. **Pagination**: Both album listing and image fetching support pagination
5. **Clean URLs**: Use album codes instead of database IDs for better security

## Database Setup

Run this SQL to add the album_code column:
```sql
ALTER TABLE albums ADD COLUMN album_code VARCHAR(20) UNIQUE NOT NULL;
UPDATE albums SET album_code = CONCAT('ALB', LPAD(id, 6, '0'), SUBSTRING(MD5(RAND()), 1, 6)) WHERE album_code IS NULL OR album_code = '';
CREATE INDEX idx_albums_code ON albums(album_code);
```