# Top Categories API

## Overview
This API returns the top categories that generate leads, with intelligent fallback to ensure you always get the requested number of categories. If there are no leads generated yet, it will still return 5 categories (or the requested limit).

## Endpoint
```
GET /v1/categories/top
```

## Authentication
- Requires authentication via JWT token
- Permission: `getCategories`

## Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 5 | Number of categories to return (1-20) |
| `type` | string | No | - | Filter by category type (insurance, banking, capital market, it sector, project funding) |

## Response Format
```json
{
  "categories": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Life Insurance",
      "description": "Comprehensive life insurance products",
      "type": "insurance",
      "status": "active",
      "image": "https://example.com/life-insurance.jpg",
      "imageKey": "categories/life-insurance.jpg",
      "leadCount": 15,
      "totalLeads": 15,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "64a1b2c3d4e5f6789012346",
      "name": "Health Insurance",
      "description": "Health and medical insurance coverage",
      "type": "insurance",
      "status": "active",
      "image": "https://example.com/health-insurance.jpg",
      "imageKey": "categories/health-insurance.jpg",
      "leadCount": 8,
      "totalLeads": 8,
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-14T15:45:00.000Z"
    },
    {
      "_id": "64a1b2c3d4e5f6789012347",
      "name": "Personal Loan",
      "description": "Personal loan products and services",
      "type": "banking",
      "status": "active",
      "image": null,
      "imageKey": null,
      "leadCount": 0,
      "totalLeads": 0,
      "createdAt": "2024-01-03T00:00:00.000Z",
      "updatedAt": "2024-01-03T00:00:00.000Z"
    }
  ],
  "totalCategories": 5,
  "hasLeads": true,
  "summary": {
    "totalLeads": 23,
    "categoriesWithLeads": 2,
    "categoriesWithoutLeads": 3,
    "averageLeadsPerCategory": 4.6
  },
  "generatedAt": "2024-01-15T10:30:00.000Z",
  "message": "Top 5 categories (2 with leads)"
}
```

## Features

### 1. Smart Lead-Based Selection
- **Priority 1**: Categories with leads (sorted by lead count descending)
- **Priority 2**: Categories without leads (sorted by creation date)
- **Priority 3**: Any remaining categories to reach the limit

### 2. Guaranteed Results
- Always returns the requested number of categories (up to available count)
- Works even when no leads have been generated yet
- Ensures consistent API behavior

### 3. Lead Statistics
- **leadCount**: Number of leads for each category
- **totalLeads**: Same as leadCount (for consistency)
- **Summary**: Overall statistics across all returned categories

### 4. Flexible Filtering
- Filter by category type (insurance, banking, etc.)
- Only returns active categories by default
- Adjustable limit (1-20 categories)

### 5. Rich Category Data
- Complete category information (name, description, type, status)
- Image URLs and keys for display
- Creation and update timestamps
- Lead generation statistics

## Algorithm Logic

### Step 1: Get Categories with Leads
```javascript
// Find categories that have generated leads
// Sort by lead count (highest first)
// Limit to requested number
```

### Step 2: Fill with Categories without Leads
```javascript
// If we need more categories, get ones without leads
// Sort by creation date (newest first)
// Fill remaining slots
```

### Step 3: Complete with Any Remaining Categories
```javascript
// If still not enough, get any other categories
// Ensure we always return the requested limit
```

## Use Cases

### 1. Dashboard Category Display
```javascript
// Example: Show top 5 categories in dashboard
fetch('/v1/categories/top?limit=5')
  .then(response => response.json())
  .then(data => {
    data.categories.forEach(category => {
      console.log(`${category.name}: ${category.leadCount} leads`);
    });
  });
```

### 2. Category Performance Analysis
```javascript
// Example: Analyze category performance
fetch('/v1/categories/top?limit=10')
  .then(response => response.json())
  .then(data => {
    const topPerformer = data.categories[0];
    console.log(`Top category: ${topPerformer.name} with ${topPerformer.leadCount} leads`);
    
    const summary = data.summary;
    console.log(`Total leads: ${summary.totalLeads}`);
    console.log(`Categories with leads: ${summary.categoriesWithLeads}`);
  });
```

### 3. Type-Specific Categories
```javascript
// Example: Get top insurance categories
fetch('/v1/categories/top?type=insurance&limit=3')
  .then(response => response.json())
  .then(data => {
    console.log(`Top ${data.categories.length} insurance categories`);
  });
```

### 4. Table Display
```html
<!-- Example: HTML table for categories -->
<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Type</th>
      <th>Leads</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody id="categoriesTable">
    <!-- Populated by JavaScript -->
  </tbody>
</table>

<script>
fetch('/v1/categories/top?limit=5')
  .then(response => response.json())
  .then(data => {
    const tbody = document.getElementById('categoriesTable');
    data.categories.forEach(category => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = category.name;
      row.insertCell(1).textContent = category.type;
      row.insertCell(2).textContent = category.leadCount;
      row.insertCell(3).textContent = category.status;
    });
  });
</script>
```

## Response Fields

### Category Object
| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Category ID |
| `name` | string | Category name |
| `description` | string | Category description |
| `type` | string | Category type (insurance, banking, etc.) |
| `status` | string | Category status (active, inactive) |
| `image` | string | Image URL (can be null) |
| `imageKey` | string | S3 image key (can be null) |
| `leadCount` | number | Number of leads for this category |
| `totalLeads` | number | Same as leadCount |
| `createdAt` | string | Creation timestamp |
| `updatedAt` | string | Last update timestamp |

### Summary Object
| Field | Type | Description |
|-------|------|-------------|
| `totalLeads` | number | Total leads across all categories |
| `categoriesWithLeads` | number | Number of categories that have leads |
| `categoriesWithoutLeads` | number | Number of categories without leads |
| `averageLeadsPerCategory` | number | Average leads per category |

## Error Handling

### No Categories Found
```json
{
  "categories": [],
  "totalCategories": 0,
  "hasLeads": false,
  "summary": {
    "totalLeads": 0,
    "categoriesWithLeads": 0,
    "categoriesWithoutLeads": 0,
    "averageLeadsPerCategory": 0
  },
  "message": "No categories found"
}
```

### Invalid Parameters
```json
{
  "error": "ValidationError",
  "message": "limit must be between 1 and 20"
}
```

## Example Usage

### Basic Top Categories
```bash
GET /v1/categories/top
Authorization: Bearer <your-jwt-token>
```

### Custom Limit and Type
```bash
GET /v1/categories/top?limit=10&type=insurance
Authorization: Bearer <your-jwt-token>
```

### Banking Categories Only
```bash
GET /v1/categories/top?type=banking&limit=3
Authorization: Bearer <your-jwt-token>
```

## Performance Notes
- Uses MongoDB aggregation for efficient data processing
- Only active categories are considered by default
- Lead counts are calculated in real-time
- Optimized queries with proper indexing

## Notes
- Categories are sorted by lead count (highest first) when leads exist
- When no leads exist, categories are sorted by creation date (newest first)
- The API ensures you always get the requested number of categories
- Perfect for dashboard displays and category performance analysis
- Works seamlessly even with zero leads in the system

This API is ideal for creating category showcases, performance dashboards, and ensuring your UI always has data to display! 📊
