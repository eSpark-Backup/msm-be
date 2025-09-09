# Group APIs Documentation

This document contains all the Group API endpoints with their request payloads and response formats.

## Base URL
```
http://localhost:5000/api/groups
```

---

## 1. Create Group

**Endpoint:** `POST /api/groups`

**Description:** Create a new group

### Request Payload
```json
{
  "name": "Admin Group",
  "description": "Administrator access group",
  "customer_name": "Acme Corp",
  "all_user": true,
  "permissions": "write"
}
```

### Field Descriptions
- `name` (string, required): Name of the group
- `description` (string, optional): Description of the group
- `customer_name` (string, required): Customer name associated with the group
- `all_user` (boolean, optional): Whether all users are included (default: false)
- `permissions` (string, required): Permission level - "read", "write", or "others" (default: "read")

### Success Response (201)
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "_id": "64f7b8c9e1234567890abcde",
    "name": "Admin Group",
    "description": "Administrator access group",
    "customer_name": "Acme Corp",
    "all_user": true,
    "permissions": "write",
    "createdAt": "2023-09-09T10:30:00.000Z",
    "updatedAt": "2023-09-09T10:30:00.000Z",
    "__v": 0
  }
}
```

### Error Responses
**400 - Bad Request**
```json
{
  "success": false,
  "message": "Name and customer_name are required"
}
```

**400 - Duplicate Group**
```json
{
  "success": false,
  "message": "Group with this name already exists for this customer"
}
```

---

## 2. Get All Groups

**Endpoint:** `GET /api/groups`

**Description:** Retrieve all groups with optional filtering and pagination

### Query Parameters
- `customer_name` (string, optional): Filter by customer name
- `permissions` (string, optional): Filter by permissions ("read", "write", "others")
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Items per page (default: 10)

### Example Request
```
GET /api/groups?customer_name=Acme Corp&permissions=read&page=1&limit=5
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Groups retrieved successfully",
  "data": {
    "groups": [
      {
        "_id": "64f7b8c9e1234567890abcde",
        "name": "Admin Group",
        "description": "Administrator access group",
        "customer_name": "Acme Corp",
        "all_user": true,
        "permissions": "write",
        "createdAt": "2023-09-09T10:30:00.000Z",
        "updatedAt": "2023-09-09T10:30:00.000Z",
        "__v": 0
      },
      {
        "_id": "64f7b8c9e1234567890abcdf",
        "name": "User Group",
        "description": "Regular user access group",
        "customer_name": "Acme Corp",
        "all_user": false,
        "permissions": "read",
        "createdAt": "2023-09-09T10:35:00.000Z",
        "updatedAt": "2023-09-09T10:35:00.000Z",
        "__v": 0
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "items_per_page": 10
    }
  }
}
```

---

## 3. Get Group by ID

**Endpoint:** `GET /api/groups/:id`

**Description:** Retrieve a specific group by its ID

### URL Parameters
- `id` (string, required): MongoDB ObjectId of the group

### Example Request
```
GET /api/groups/64f7b8c9e1234567890abcde
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Group retrieved successfully",
  "data": {
    "_id": "64f7b8c9e1234567890abcde",
    "name": "Admin Group",
    "description": "Administrator access group",
    "customer_name": "Acme Corp",
    "all_user": true,
    "permissions": "write",
    "createdAt": "2023-09-09T10:30:00.000Z",
    "updatedAt": "2023-09-09T10:30:00.000Z",
    "__v": 0
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Group not found"
}
```

---

## 4. Update Group

**Endpoint:** `PUT /api/groups/:id`

**Description:** Update an existing group by its ID

### URL Parameters
- `id` (string, required): MongoDB ObjectId of the group

### Request Payload
```json
{
  "name": "Updated Admin Group",
  "description": "Updated administrator access group",
  "customer_name": "Acme Corp",
  "all_user": false,
  "permissions": "read"
}
```

### Field Descriptions
All fields are optional. Only provided fields will be updated.
- `name` (string): Name of the group
- `description` (string): Description of the group
- `customer_name` (string): Customer name associated with the group
- `all_user` (boolean): Whether all users are included
- `permissions` (string): Permission level - "read", "write", or "others"

### Success Response (200)
```json
{
  "success": true,
  "message": "Group updated successfully",
  "data": {
    "_id": "64f7b8c9e1234567890abcde",
    "name": "Updated Admin Group",
    "description": "Updated administrator access group",
    "customer_name": "Acme Corp",
    "all_user": false,
    "permissions": "read",
    "createdAt": "2023-09-09T10:30:00.000Z",
    "updatedAt": "2023-09-09T11:45:00.000Z",
    "__v": 0
  }
}
```

### Error Responses
**404 - Not Found**
```json
{
  "success": false,
  "message": "Group not found"
}
```

**400 - Duplicate Name**
```json
{
  "success": false,
  "message": "Group with this name already exists for this customer"
}
```

---

## 5. Delete Group

**Endpoint:** `DELETE /api/groups/:id`

**Description:** Delete a group by its ID

### URL Parameters
- `id` (string, required): MongoDB ObjectId of the group

### Example Request
```
DELETE /api/groups/64f7b8c9e1234567890abcde
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Group deleted successfully",
  "data": {
    "id": "64f7b8c9e1234567890abcde"
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Group not found"
}
```

---

## 6. Get Groups by Customer

**Endpoint:** `GET /api/groups/customer/:customer_name`

**Description:** Retrieve all groups for a specific customer

### URL Parameters
- `customer_name` (string, required): Name of the customer

### Example Request
```
GET /api/groups/customer/Acme Corp
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Groups retrieved successfully",
  "data": [
    {
      "_id": "64f7b8c9e1234567890abcde",
      "name": "Admin Group",
      "description": "Administrator access group",
      "customer_name": "Acme Corp",
      "all_user": true,
      "permissions": "write",
      "createdAt": "2023-09-09T10:30:00.000Z",
      "updatedAt": "2023-09-09T10:30:00.000Z",
      "__v": 0
    },
    {
      "_id": "64f7b8c9e1234567890abcdf",
      "name": "User Group",
      "description": "Regular user access group",
      "customer_name": "Acme Corp",
      "all_user": false,
      "permissions": "read",
      "createdAt": "2023-09-09T10:35:00.000Z",
      "updatedAt": "2023-09-09T10:35:00.000Z",
      "__v": 0
    }
  ]
}
```

---

## Error Response Format

All error responses follow this general format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, duplicates)
- `404` - Not Found
- `500` - Internal Server Error

---

## Field Validation Rules

### Group Schema Validation
- `name`: Required, string, trimmed
- `description`: Optional, string, trimmed
- `customer_name`: Required, string, trimmed
- `all_user`: Boolean, defaults to false
- `permissions`: Required, must be one of ["read", "write", "others"], defaults to "read"

### Unique Constraints
- Combination of `name` and `customer_name` must be unique (no duplicate group names per customer)

---

## Usage Examples

### Creating a Basic Group
```bash
curl -X POST http://localhost:5000/api/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Basic Users",
    "customer_name": "Tech Corp",
    "permissions": "read"
  }'
```

### Getting Groups with Pagination
```bash
curl "http://localhost:5000/api/groups?page=2&limit=5&customer_name=Tech Corp"
```

### Updating a Group
```bash
curl -X PUT http://localhost:5000/api/groups/64f7b8c9e1234567890abcde \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": "write",
    "all_user": true
  }'
```
