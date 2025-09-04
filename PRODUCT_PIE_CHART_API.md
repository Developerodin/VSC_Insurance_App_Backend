# Product Pie Chart Statistics API

## Overview
This API provides comprehensive product statistics with percentage distributions, perfect for creating pie charts and data visualizations. It shows how products are distributed across different categories, types, and statuses.

## Endpoint
```
GET /v1/products/stats/pie-chart
```

## Authentication
- Requires authentication via JWT token
- Permission: `getProducts`

## Query Parameters
No query parameters required - returns all product statistics.

## Response Format
```json
{
  "totalProducts": 150,
  "pieChartData": {
    "byType": {
      "title": "Products by Type",
      "data": [
        {
          "name": "insurance",
          "value": 75,
          "percentage": 50.0
        },
        {
          "name": "banking",
          "value": 45,
          "percentage": 30.0
        },
        {
          "name": "capital market",
          "value": 30,
          "percentage": 20.0
        }
      ],
      "total": 150
    },
    "byStatus": {
      "title": "Products by Status",
      "data": [
        {
          "name": "active",
          "value": 120,
          "percentage": 80.0
        },
        {
          "name": "inactive",
          "value": 20,
          "percentage": 13.33
        },
        {
          "name": "draft",
          "value": 10,
          "percentage": 6.67
        }
      ],
      "total": 150
    },
    "byCategory": {
      "title": "Top 5 Categories",
      "data": [
        {
          "name": "Life Insurance",
          "categoryId": "64a1b2c3d4e5f6789012345",
          "value": 35,
          "percentage": 23.33
        },
        {
          "name": "Health Insurance",
          "categoryId": "64a1b2c3d4e5f6789012346",
          "value": 28,
          "percentage": 18.67
        },
        {
          "name": "Personal Loan",
          "categoryId": "64a1b2c3d4e5f6789012347",
          "value": 22,
          "percentage": 14.67
        },
        {
          "name": "Home Loan",
          "categoryId": "64a1b2c3d4e5f6789012348",
          "value": 18,
          "percentage": 12.0
        },
        {
          "name": "Car Insurance",
          "categoryId": "64a1b2c3d4e5f6789012349",
          "value": 15,
          "percentage": 10.0
        }
      ],
      "total": 118
    }
  },
  "additionalStats": {
    "averagePrice": 25000.50,
    "minPrice": 1000,
    "maxPrice": 100000,
    "totalValue": 3750075
  },
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Features

### 1. Product Distribution by Type
- Shows how many products belong to each type (insurance, banking, capital market, etc.)
- Includes count and percentage for each type
- Perfect for type-based pie charts

### 2. Product Distribution by Status
- Shows active, inactive, and draft products
- Helps understand product portfolio health
- Useful for status-based visualizations

### 3. Top 5 Categories
- Shows the most popular product categories
- Includes category names and IDs for further queries
- Displays count and percentage for each category
- Limited to top 5 for better chart readability

### 4. Additional Statistics
- **Average Price**: Mean price across all products
- **Min/Max Price**: Price range of products
- **Total Value**: Sum of all product prices

### 5. Percentage Calculations
- All percentages are calculated as: `(count / totalProducts) * 100`
- Rounded to 2 decimal places for precision
- Ensures all percentages add up to 100%

## Use Cases

### 1. Dashboard Pie Charts
```javascript
// Example: Create a pie chart for product types
const pieData = response.pieChartData.byType.data.map(item => ({
  name: item.name,
  value: item.value,
  percentage: item.percentage
}));
```

### 2. Category Analysis
```javascript
// Example: Show top categories
const topCategories = response.pieChartData.byCategory.data;
console.log(`Top category: ${topCategories[0].name} (${topCategories[0].percentage}%)`);
```

### 3. Portfolio Health Check
```javascript
// Example: Check product status distribution
const statusData = response.pieChartData.byStatus.data;
const activePercentage = statusData.find(s => s.name === 'active')?.percentage || 0;
console.log(`Active products: ${activePercentage}%`);
```

### 4. Price Analysis
```javascript
// Example: Price statistics
const stats = response.additionalStats;
console.log(`Average price: ₹${stats.averagePrice}`);
console.log(`Price range: ₹${stats.minPrice} - ₹${stats.maxPrice}`);
```

## Chart Library Integration

### Chart.js Example
```javascript
const ctx = document.getElementById('productPieChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: response.pieChartData.byType.data.map(item => item.name),
    datasets: [{
      data: response.pieChartData.byType.data.map(item => item.value),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = response.pieChartData.byType.data[context.dataIndex];
            return `${item.name}: ${item.value} (${item.percentage}%)`;
          }
        }
      }
    }
  }
});
```

### D3.js Example
```javascript
const width = 400;
const height = 400;
const radius = Math.min(width, height) / 2;

const svg = d3.select('#pieChart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const g = svg.append('g')
  .attr('transform', `translate(${width/2}, ${height/2})`);

const pie = d3.pie()
  .value(d => d.value);

const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius);

const arcs = g.selectAll('.arc')
  .data(pie(response.pieChartData.byType.data))
  .enter()
  .append('g')
  .attr('class', 'arc');

arcs.append('path')
  .attr('d', arc)
  .attr('fill', (d, i) => color(i));
```

## Error Handling

### No Products Found
```json
{
  "totalProducts": 0,
  "pieChartData": [],
  "message": "No products found"
}
```

## Performance Notes
- Uses MongoDB aggregation for efficient data processing
- Categories are limited to top 5 for optimal performance
- All calculations are done server-side
- Response includes generated timestamp for caching

## Example Usage

```bash
# Get product pie chart statistics
GET /v1/products/stats/pie-chart
Authorization: Bearer <your-jwt-token>
```

This API is perfect for creating comprehensive product analytics dashboards with multiple pie charts showing different aspects of your product portfolio! 📊
