# LeadsFields API Documentation

The LeadsFields API allows you to manage field configurations for leads based on product and category combinations. This is useful for creating dynamic forms for different types of insurance products.

## Base URL
```
/v1/leadsfields
```

## Authentication
All endpoints require authentication and appropriate permissions:
- **Read operations**: `getLeadsFields` permission
- **Write operations**: `manageLeadsFields` permission

## Endpoints

### 1. Create LeadsFields Configuration
**POST** `/v1/leadsfields`

Creates a new field configuration for a product-category combination.

**Request Body:**
```json
{
  "product": "64b123456789abcdef123456",
  "category": "64b123456789abcdef123457",
  "fields": [
    {
      "name": "fullName",
      "type": "text"
    },
    {
      "name": "age",
      "type": "number"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "_id": "64b123456789abcdef123458",
  "product": {
    "_id": "64b123456789abcdef123456",
    "name": "Health Insurance",
    "type": "insurance",
    "description": "Comprehensive health insurance coverage",
    "status": "active"
  },
  "category": {
    "_id": "64b123456789abcdef123457",
    "name": "Individual",
    "description": "Individual insurance plans",
    "type": "insurance",
    "status": "active"
  },
  "fields": [
    {
      "name": "fullName",
      "type": "text"
    },
    {
      "name": "age",
      "type": "number"
    }
  ],
  "fieldCount": 2,
  "createdAt": "2023-10-01T12:00:00.000Z",
  "updatedAt": "2023-10-01T12:00:00.000Z"
}
```

### 2. Get All LeadsFields Configurations
**GET** `/v1/leadsfields`

Retrieves all field configurations with optional filtering and pagination.

**Query Parameters:**
- `product` (optional): Filter by product ID
- `category` (optional): Filter by category ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `sortBy` (optional): Sort field and order (e.g., "createdAt:desc")

**Response:** `200 OK`
```json
{
  "results": [
    {
      "_id": "64b123456789abcdef123458",
      "product": {
        "_id": "64b123456789abcdef123456",
        "name": "Health Insurance",
        "type": "insurance",
        "description": "Comprehensive health insurance coverage",
        "status": "active"
      },
      "category": {
        "_id": "64b123456789abcdef123457",
        "name": "Individual",
        "description": "Individual insurance plans",
        "type": "insurance",
        "status": "active"
      },
      "fields": [...],
      "fieldCount": 2,
      "createdAt": "2023-10-01T12:00:00.000Z",
      "updatedAt": "2023-10-01T12:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "totalResults": 1
}
```

### 3. Get LeadsFields by ID
**GET** `/v1/leadsfields/:leadsFieldsId`

Retrieves a specific field configuration by ID.

**Response:** `200 OK`
```json
{
  "_id": "64b123456789abcdef123458",
  "product": {
    "_id": "64b123456789abcdef123456",
    "name": "Health Insurance",
    "type": "insurance",
    "description": "Comprehensive health insurance coverage",
    "status": "active"
  },
  "category": {
    "_id": "64b123456789abcdef123457",
    "name": "Individual",
    "description": "Individual insurance plans",
    "type": "insurance",
    "status": "active"
  },
  "fields": [...],
  "fieldCount": 2,
  "createdAt": "2023-10-01T12:00:00.000Z",
  "updatedAt": "2023-10-01T12:00:00.000Z"
}
```

### 4. Get LeadsFields by Product and Category
**GET** `/v1/leadsfields/product/:productId/category/:categoryId`

Retrieves field configuration for a specific product-category combination.

**Response:** `200 OK` (same as above)

### 5. Update LeadsFields Configuration
**PATCH** `/v1/leadsfields/:leadsFieldsId`

Updates an existing field configuration.

**Request Body:**
```json
{
  "fields": [
    {
      "name": "fullName",
      "type": "text"
    },
    {
      "name": "age",
      "type": "number"
    },
    {
      "name": "phoneNumber",
      "type": "text"
    }
  ]
}
```

**Response:** `200 OK` (updated configuration)

### 6. Delete LeadsFields Configuration
**DELETE** `/v1/leadsfields/:leadsFieldsId`

Deletes a field configuration.

**Response:** `204 No Content`

## Field Management Operations

### 7. Add Field
**POST** `/v1/leadsfields/:leadsFieldsId/fields`

Adds a new field to an existing configuration.

**Request Body:**
```json
{
  "name": "email",
  "type": "email"
}
```

**Response:** `200 OK` (updated configuration with new field)

### 8. Update Field
**PATCH** `/v1/leadsfields/:leadsFieldsId/fields/:fieldIndex`

Updates a specific field by index.

**Request Body:**
```json
{
  "name": "emailAddress",
  "type": "email"
}
```

**Response:** `200 OK` (updated configuration)

### 9. Remove Field by Index
**DELETE** `/v1/leadsfields/:leadsFieldsId/fields/:fieldIndex`

Removes a field by its index position.

**Response:** `200 OK` (updated configuration)

### 10. Remove Field by Name
**DELETE** `/v1/leadsfields/:leadsFieldsId/fields/name/:fieldName`

Removes a field by its name.

**Response:** `200 OK` (updated configuration)

### 11. Reorder Fields
**PATCH** `/v1/leadsfields/:leadsFieldsId/fields/reorder`

Reorders fields in the configuration.

**Request Body:**
```json
{
  "fieldIndexes": [2, 0, 1]
}
```

This would reorder the fields so that:
- Field at index 2 becomes first
- Field at index 0 becomes second
- Field at index 1 becomes third

**Response:** `200 OK` (updated configuration with reordered fields)

## Field Types
Common field types you can use:
- `text` - Single line text input
- `textarea` - Multi-line text input
- `email` - Email address input
- `phone` - Phone number input
- `number` - Numeric input
- `date` - Date picker
- `dropdown` - Dropdown/select list
- `checkbox` - Checkbox input
- `radio` - Radio button group
- `file` - File upload

## Error Responses

### 400 Bad Request
```json
{
  "code": 400,
  "message": "LeadsFields configuration already exists for this product-category combination"
}
```

### 404 Not Found
```json
{
  "code": 404,
  "message": "LeadsFields not found"
}
```

### 403 Forbidden
```json
{
  "code": 403,
  "message": "Forbidden"
}
```

## Examples

### Create a Health Insurance Individual Plan Configuration
```bash
curl -X POST /v1/leadsfields \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "64b123456789abcdef123456",
    "category": "64b123456789abcdef123457",
    "fields": [
      {"name": "fullName", "type": "text"},
      {"name": "age", "type": "number"},
      {"name": "phone", "type": "phone"},
      {"name": "email", "type": "email"},
      {"name": "medicalHistory", "type": "textarea"}
    ]
  }'
```

### Add a new field to existing configuration
```bash
curl -X POST /v1/leadsfields/64b123456789abcdef123458/fields \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "annualIncome",
    "type": "number"
  }'
```

### Get configuration for specific product-category
```bash
curl -X GET /v1/leadsfields/product/64b123456789abcdef123456/category/64b123456789abcdef123457 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Permissions

### User Role
- `getLeadsFields`: Can view field configurations

### Admin Role
- `getLeadsFields`: Can view field configurations
- `manageLeadsFields`: Can create, update, and delete field configurations

### Super Admin Role
- All LeadsFields permissions 