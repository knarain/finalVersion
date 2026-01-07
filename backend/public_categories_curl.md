# Public Categories API - cURL Examples

## Get All Categories (Public)

```bash
curl -X GET "http://your-domain.com/api/categories" \
  -H "Content-Type: application/json"
```

### Response Example:
```json
{
  "results": [
    {
      "id": 1,
      "name": "Wedding"
    },
    {
      "id": 2,
      "name": "Engagement"
    },
    {
      "id": 3,
      "name": "Portrait"
    }
  ],
  "message": "Categories fetched successfully",
  "error_code": 200
}
```

## Usage Notes:
- This endpoint is **public** and does not require authentication
- Returns all available categories
- Can be used to populate category dropdowns in frontend
- Categories are used to filter albums by category

## Related Endpoints:
- `GET /api/albums/category/{categoryId}` - Get albums by category
- `GET /api/admin/albums` - Admin albums list (requires authentication)