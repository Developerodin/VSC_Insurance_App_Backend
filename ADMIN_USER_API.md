# Admin User API Documentation

This document provides comprehensive documentation for the Admin User API endpoints, which allow you to manage admin users with product-specific access and custom navigation configurations.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)
- [Field Descriptions](#field-descriptions)

## Overview

The Admin User API provides functionality to create and manage admin users with the following features:

- **Product-Specific Access**: Associate admin users with specific products
- **Custom Navigation**: Store frontend navigation configurations
- **Minimal Creation**: Create admin users with just name, email, and password
- **Search & Filter**: Advanced search and filtering capabilities
- **Backward Compatibility**: Existing user functionality remains unchanged

## Authentication

All admin user endpoints require authentication. Use the `Authorization` header with a Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

### Required Permissions

- **Create/Update/Delete**: `manageUsers` permission
- **Read Operations**: `getUsers` permission

## API Endpoints

### Base URL
```
/v1/admin-users
```

---

## 1. Create Admin User

Creates a new admin user with optional product associations and navigation configuration.

### Endpoint
```
POST /v1/admin-users
```

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

#### Required Fields
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 characters)"
}
```

#### Optional Fields
```json
{
  "role": "string (optional, 'admin' or 'superAdmin', default: 'admin')",
  "products": ["string (optional, array of product IDs)"],
  "navigation": "object (optional, any valid JSON object)"
}
```

### Response

#### Success (201 Created)
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "status": "active",
  "isEmailVerified": true,
  "products": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "Life Insurance",
      "type": "insurance",
      "status": "active"
    }
  ],
  "navigation": {
    "sidebar": ["dashboard", "products", "users"],
    "theme": "dark"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Error (400 Bad Request)
```json
{
  "code": 400,
  "message": "Email already taken"
}
```

---

## 2. Get All Admin Users

Retrieves a paginated list of admin users with optional search and filtering.

### Endpoint
```
GET /v1/admin-users
```

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search by name or email (case-insensitive) | `?search=john` |
| `role` | string | Filter by role (`admin` or `superAdmin`) | `?role=admin` |
| `status` | string | Filter by status | `?status=active` |
| `products` | string | Filter by product IDs (comma-separated) | `?products=id1,id2,id3` |
| `sortBy` | string | Sort field and order | `?sortBy=createdAt:desc` |
| `limit` | number | Number of results per page (default: 10) | `?limit=20` |
| `page` | number | Page number (default: 1) | `?page=2` |

### Response

#### Success (200 OK)
```json
{
  "results": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active",
      "isEmailVerified": true,
      "products": [
        {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
          "name": "Life Insurance",
          "type": "insurance"
        }
      ],
      "navigation": {
        "sidebar": ["dashboard", "products"]
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "totalResults": 1
}
```

---

## 3. Get Admin User by ID

Retrieves a specific admin user by their ID.

### Endpoint
```
GET /v1/admin-users/:userId
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | Admin user ID (ObjectId) |

### Response

#### Success (200 OK)
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "status": "active",
  "isEmailVerified": true,
  "products": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "Life Insurance",
      "type": "insurance",
      "status": "active"
    }
  ],
  "navigation": {
    "sidebar": ["dashboard", "products", "users"],
    "theme": "dark"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Error (404 Not Found)
```json
{
  "code": 404,
  "message": "User not found"
}
```

---

## 4. Update Admin User

Updates an existing admin user's information.

### Endpoint
```
PATCH /v1/admin-users/:userId
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | Admin user ID (ObjectId) |

### Request Body

All fields are optional. Only provided fields will be updated.

```json
{
  "name": "string (optional)",
  "email": "string (optional, valid email)",
  "password": "string (optional, min 8 characters)",
  "role": "string (optional, 'admin' or 'superAdmin')",
  "status": "string (optional, 'pending', 'active', 'inactive', 'suspended')",
  "products": ["string (optional, array of product IDs)"],
  "navigation": "object (optional, any valid JSON object)"
}
```

### Response

#### Success (200 OK)
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "Updated Admin User",
  "email": "updated@example.com",
  "role": "superAdmin",
  "status": "active",
  "isEmailVerified": true,
  "products": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "Life Insurance",
      "type": "insurance"
    },
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "name": "Health Insurance",
      "type": "insurance"
    }
  ],
  "navigation": {
    "sidebar": ["dashboard", "products", "users", "reports"],
    "theme": "light"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

---

## 5. Delete Admin User

Deletes an admin user permanently.

### Endpoint
```
DELETE /v1/admin-users/:userId
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | Admin user ID (ObjectId) |

### Response

#### Success (204 No Content)
No response body.

#### Error (404 Not Found)
```json
{
  "code": 404,
  "message": "User not found"
}
```

---

## Request/Response Examples

### Example 1: Create Simple Admin User

```bash
curl -X POST "https://api.example.com/v1/admin-users" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "john@admin.com",
    "password": "securepassword123"
  }'
```

### Example 2: Create Admin with Product Access

```bash
curl -X POST "https://api.example.com/v1/admin-users" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Admin",
    "email": "product@admin.com",
    "password": "securepassword123",
    "products": ["60f7b3b3b3b3b3b3b3b3b3b4", "60f7b3b3b3b3b3b3b3b3b3b5"],
    "navigation": {
      "sidebar": ["dashboard", "products", "analytics"],
      "theme": "dark",
      "layout": "sidebar"
    }
  }'
```

### Example 3: Search Admin Users

```bash
curl -X GET "https://api.example.com/v1/admin-users?search=john&role=admin&limit=5" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example 4: Update Admin User

```bash
curl -X PATCH "https://api.example.com/v1/admin-users/60f7b3b3b3b3b3b3b3b3b3b3" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "products": ["60f7b3b3b3b3b3b3b3b3b3b4"],
    "navigation": {
      "sidebar": ["dashboard", "products"],
      "theme": "light"
    }
  }'
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "code": 400,
  "message": "Email already taken"
}
```

#### 401 Unauthorized
```json
{
  "code": 401,
  "message": "Please authenticate"
}
```

#### 403 Forbidden
```json
{
  "code": 403,
  "message": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "code": 404,
  "message": "User not found"
}
```

#### 422 Validation Error
```json
{
  "code": 422,
  "message": "Validation Error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## Field Descriptions

### User Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `_id` | ObjectId | Unique user identifier | Auto-generated |
| `name` | String | User's full name | Yes (for creation) |
| `email` | String | User's email address (unique) | Yes (for creation) |
| `password` | String | User's password (min 8 chars) | Yes (for creation) |
| `role` | String | User role (`admin` or `superAdmin`) | No (default: `admin`) |
| `status` | String | User status | Auto-set to `active` |
| `isEmailVerified` | Boolean | Email verification status | Auto-set to `true` |
| `products` | Array | Associated product IDs | No |
| `navigation` | Object | Custom navigation configuration | No |
| `createdAt` | Date | Creation timestamp | Auto-generated |
| `updatedAt` | Date | Last update timestamp | Auto-generated |

### Product Object (in products array)

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Product identifier |
| `name` | String | Product name |
| `type` | String | Product type |
| `status` | String | Product status |

### Navigation Object

The `navigation` field accepts any valid JSON object. Common structure:

```json
{
  "sidebar": ["dashboard", "products", "users"],
  "theme": "dark",
  "layout": "sidebar",
  "permissions": ["read", "write"],
  "customConfig": {
    "key": "value"
  }
}
```

---

## Best Practices

1. **Password Security**: Use strong passwords (minimum 8 characters)
2. **Product Validation**: Ensure product IDs exist before assignment
3. **Navigation Structure**: Keep navigation objects consistent across your application
4. **Error Handling**: Always handle potential errors in your client code
5. **Pagination**: Use pagination for large datasets
6. **Search**: Use search parameters to improve user experience

---

## Rate Limiting

API requests are subject to rate limiting. Please refer to the main API documentation for current rate limits.

---

## Support

For additional support or questions about the Admin User API, please contact the development team or refer to the main API documentation.
