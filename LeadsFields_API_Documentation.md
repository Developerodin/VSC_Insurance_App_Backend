# LeadsFields API Documentation

## Overview
The LeadsFields API manages field configurations for different product-category combinations. Each field can be marked as either `optional` or `mandatory` using the `fieldOption` property.

## Base URL
```
http://localhost:3000/v1/leadsFields
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Create LeadsFields Configuration

**POST** `/v1/leadsFields`

Creates a new LeadsFields configuration for a product-category combination.

### Request Body
```json
{
  "product": "507f1f77bcf86cd799439011",
  "category": "507f1f77bcf86cd799439012",
  "fields": [
    {
      "name": "customer_name",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "phone_number",
      "type": "phone",
      "fieldOption": "mandatory"
    },
    {
      "name": "email",
      "type": "email",
      "fieldOption": "optional"
    },
    {
      "name": "address",
      "type": "textarea",
      "fieldOption": "optional"
    }
  ]
}
```

### Response (201 Created)
```json
{
  "id": "507f1f77bcf86cd799439013",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Life Insurance"
  },
  "category": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Individual"
  },
  "fields": [
    {
      "name": "customer_name",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "phone_number",
      "type": "phone",
      "fieldOption": "mandatory"
    },
    {
      "name": "email",
      "type": "email",
      "fieldOption": "optional"
    },
    {
      "name": "address",
      "type": "textarea",
      "fieldOption": "optional"
    }
  ],
  "fieldCount": 4,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 2. Get All LeadsFields Configurations

**GET** `/v1/leadsFields`

Retrieves all LeadsFields configurations with optional filtering and pagination.

### Query Parameters
- `product` (optional): Filter by product ID
- `category` (optional): Filter by category ID
- `sortBy` (optional): Sort field (e.g., "createdAt:desc")
- `limit` (optional): Number of results per page (default: 10)
- `page` (optional): Page number (default: 1)

### Example Request
```
GET /v1/leadsFields?product=507f1f77bcf86cd799439011&limit=5&page=1
```

### Response (200 OK)
```json
{
  "results": [
    {
      "id": "507f1f77bcf86cd799439013",
      "product": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Life Insurance"
      },
      "category": {
        "id": "507f1f77bcf86cd799439012",
        "name": "Individual"
      },
      "fields": [
        {
          "name": "customer_name",
          "type": "text",
          "fieldOption": "mandatory"
        }
      ],
      "fieldCount": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "page": 1,
  "limit": 5,
  "totalPages": 1,
  "totalResults": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

---

## 3. Get LeadsFields by ID

**GET** `/v1/leadsFields/{leadsFieldsId}`

Retrieves a specific LeadsFields configuration by ID.

### Example Request
```
GET /v1/leadsFields/507f1f77bcf86cd799439013
```

### Response (200 OK)
```json
{
  "id": "507f1f77bcf86cd799439013",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Life Insurance"
  },
  "category": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Individual"
  },
  "fields": [
    {
      "name": "customer_name",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "phone_number",
      "type": "phone",
      "fieldOption": "mandatory"
    },
    {
      "name": "email",
      "type": "email",
      "fieldOption": "optional"
    }
  ],
  "fieldCount": 3,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 4. Get LeadsFields by Product and Category

**GET** `/v1/leadsFields/product/{productId}/category/{categoryId}`

Retrieves LeadsFields configuration for a specific product-category combination.

### Example Request
```
GET /v1/leadsFields/product/507f1f77bcf86cd799439011/category/507f1f77bcf86cd799439012
```

### Response (200 OK)
```json
{
  "id": "507f1f77bcf86cd799439013",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Life Insurance"
  },
  "category": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Individual"
  },
  "fields": [
    {
      "name": "customer_name",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "phone_number",
      "type": "phone",
      "fieldOption": "mandatory"
    },
    {
      "name": "email",
      "type": "email",
      "fieldOption": "optional"
    }
  ],
  "fieldCount": 3,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 5. Update LeadsFields Configuration

**PATCH** `/v1/leadsFields/{leadsFieldsId}`

Updates an existing LeadsFields configuration.

### Request Body
```json
{
  "fields": [
    {
      "name": "customer_name",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "phone_number",
      "type": "phone",
      "fieldOption": "mandatory"
    },
    {
      "name": "email",
      "type": "email",
      "fieldOption": "optional"
    },
    {
      "name": "date_of_birth",
      "type": "date",
      "fieldOption": "mandatory"
    }
  ]
}
```

### Response (200 OK)
```json
{
  "id": "507f1f77bcf86cd799439013",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Life Insurance"
  },
  "category": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Individual"
  },
  "fields": [
    {
      "name": "customer_name",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "phone_number",
      "type": "phone",
      "fieldOption": "mandatory"
    },
    {
      "name": "email",
      "type": "email",
      "fieldOption": "optional"
    },
    {
      "name": "date_of_birth",
      "type": "date",
      "fieldOption": "mandatory"
    }
  ],
  "fieldCount": 4,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

---

## 6. Delete LeadsFields Configuration

**DELETE** `/v1/leadsFields/{leadsFieldsId}`

Deletes a LeadsFields configuration.

### Example Request
```
DELETE /v1/leadsFields/507f1f77bcf86cd799439013
```

### Response (204 No Content)
No response body

---

## 7. Add Field to LeadsFields

**POST** `/v1/leadsFields/{leadsFieldsId}/fields`

Adds a new field to an existing LeadsFields configuration.

### Request Body
```json
{
  "name": "annual_income",
  "type": "number",
  "fieldOption": "mandatory"
}
```

### Response (200 OK)
```json
{
  "id": "507f1f77bcf86cd799439013",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Life Insurance"
  },
  "category": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Individual"
  },
  "fields": [
    {
      "name": "customer_name",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "phone_number",
      "type": "phone",
      "fieldOption": "mandatory"
    },
    {
      "name": "email",
      "type": "email",
      "fieldOption": "optional"
    },
    {
      "name": "annual_income",
      "type": "number",
      "fieldOption": "mandatory"
    }
  ],
  "fieldCount": 4,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:40:00.000Z"
}
```

---

## 8. Update Field in LeadsFields

**PATCH** `/v1/leadsFields/{leadsFieldsId}/fields/{fieldIndex}`

Updates a specific field in the LeadsFields configuration.

### Request Body
```json
{
  "name": "customer_name",
  "type": "text",
  "fieldOption": "optional"
}
```

### Example Request
```
PATCH /v1/leadsFields/507f1f77bcf86cd799439013/fields/0
```

### Response (200 OK)
```json
{
  "id": "507f1f77bcf86cd799439013",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Life Insurance"
  },
  "category": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Individual"
  },
  "fields": [
    {
      "name": "customer_name",
      "type": "text",
      "fieldOption": "optional"
    },
    {
      "name": "phone_number",
      "type": "phone",
      "fieldOption": "mandatory"
    },
    {
      "name": "email",
      "type": "email",
      "fieldOption": "optional"
    }
  ],
  "fieldCount": 3,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:45:00.000Z"
}
```

---

## 9. Remove Field by Index

**DELETE** `/v1/leadsFields/{leadsFieldsId}/fields/{fieldIndex}`

Removes a field from the LeadsFields configuration by its index.

### Example Request
```
DELETE /v1/leadsFields/507f1f77bcf86cd799439013/fields/2
```

### Response (200 OK)
```json
{
  "id": "507f1f77bcf86cd799439013",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Life Insurance"
  },
  "category": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Individual"
  },
  "fields": [
    {
      "name": "customer_name",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "phone_number",
      "type": "phone",
      "fieldOption": "mandatory"
    }
  ],
  "fieldCount": 2,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:50:00.000Z"
}
```

---

## 10. Remove Field by Name

**DELETE** `/v1/leadsFields/{leadsFieldsId}/fields/name/{fieldName}`

Removes a field from the LeadsFields configuration by its name.

### Example Request
```
DELETE /v1/leadsFields/507f1f77bcf86cd799439013/fields/name/email
```

### Response (200 OK)
```json
{
  "id": "507f1f77bcf86cd799439013",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Life Insurance"
  },
  "category": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Individual"
  },
  "fields": [
    {
      "name": "customer_name",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "phone_number",
      "type": "phone",
      "fieldOption": "mandatory"
    }
  ],
  "fieldCount": 2,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:55:00.000Z"
}
```

---

## 11. Reorder Fields

**PATCH** `/v1/leadsFields/{leadsFieldsId}/fields/reorder`

Reorders the fields in the LeadsFields configuration.

### Request Body
```json
{
  "fieldIndexes": [2, 0, 1, 3]
}
```

### Example Request
```
PATCH /v1/leadsFields/507f1f77bcf86cd799439013/fields/reorder
```

### Response (200 OK)
```json
{
  "id": "507f1f77bcf86cd799439013",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Life Insurance"
  },
  "category": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Individual"
  },
  "fields": [
    {
      "name": "email",
      "type": "email",
      "fieldOption": "optional"
    },
    {
      "name": "customer_name",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "phone_number",
      "type": "phone",
      "fieldOption": "mandatory"
    },
    {
      "name": "address",
      "type": "textarea",
      "fieldOption": "optional"
    }
  ],
  "fieldCount": 4,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

## Field Types and Options

### Field Types
- `text`: Text input
- `email`: Email input
- `phone`: Phone number input
- `number`: Numeric input
- `date`: Date picker
- `textarea`: Multi-line text input
- `select`: Dropdown selection
- `checkbox`: Checkbox input
- `radio`: Radio button input

### Field Options
- `optional`: Field is not required (default)
- `mandatory`: Field is required

---

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

### 400 Bad Request (Field Validation)
```json
{
  "code": 400,
  "message": "Field with this name already exists"
}
```

---

## Postman Collection

### Environment Variables
Set these in your Postman environment:
- `baseUrl`: `http://localhost:3000/v1`
- `authToken`: Your JWT authentication token

### Collection Structure
1. **Create LeadsFields** - POST {{baseUrl}}/leadsFields
2. **Get All LeadsFields** - GET {{baseUrl}}/leadsFields
3. **Get LeadsFields by ID** - GET {{baseUrl}}/leadsFields/:id
4. **Get by Product-Category** - GET {{baseUrl}}/leadsFields/product/:productId/category/:categoryId
5. **Update LeadsFields** - PATCH {{baseUrl}}/leadsFields/:id
6. **Delete LeadsFields** - DELETE {{baseUrl}}/leadsFields/:id
7. **Add Field** - POST {{baseUrl}}/leadsFields/:id/fields
8. **Update Field** - PATCH {{baseUrl}}/leadsFields/:id/fields/:index
9. **Remove Field by Index** - DELETE {{baseUrl}}/leadsFields/:id/fields/:index
10. **Remove Field by Name** - DELETE {{baseUrl}}/leadsFields/:id/fields/name/:name
11. **Reorder Fields** - PATCH {{baseUrl}}/leadsFields/:id/fields/reorder

### Headers
```
Content-Type: application/json
Authorization: Bearer {{authToken}}
```

---

## Usage Examples

### Example 1: Create Configuration with Mixed Field Options
```json
{
  "product": "507f1f77bcf86cd799439011",
  "category": "507f1f77bcf86cd799439012",
  "fields": [
    {
      "name": "full_name",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "email",
      "type": "email",
      "fieldOption": "optional"
    },
    {
      "name": "phone",
      "type": "phone",
      "fieldOption": "mandatory"
    },
    {
      "name": "address",
      "type": "textarea",
      "fieldOption": "optional"
    }
  ]
}
```

### Example 2: Update Field Option
```json
{
  "fieldOption": "mandatory"
}
```

### Example 3: Add New Field with Mandatory Option
```json
{
  "name": "date_of_birth",
  "type": "date",
  "fieldOption": "mandatory"
}
```

This documentation provides comprehensive coverage of the LeadsFields API with the new `fieldOption` feature, allowing users to mark fields as optional or mandatory as needed. 