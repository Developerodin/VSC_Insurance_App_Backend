# Monthly Leads Statistics API

## Overview
This API provides monthly lead statistics for a given year, showing all 12 months including months with 0 leads. Perfect for creating graphs and charts showing lead trends throughout the year.

## Endpoint
```
GET /v1/leads/stats/monthly
```

## Authentication
- Requires authentication via JWT token
- Permission: `getLeads`

## Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `year` | number | No | Year for which to get statistics (defaults to current year) | `2024` |

## Response Format
```json
{
  "year": 2024,
  "totalLeads": 150,
  "averageLeadsPerMonth": 12.5,
  "monthlyData": [
    {
      "month": 1,
      "monthName": "January",
      "year": 2024,
      "count": 15,
      "leads": [
        {
          "id": "lead_id_1",
          "status": "new",
          "source": "website",
          "createdAt": "2024-01-15T10:30:00.000Z"
        }
      ]
    },
    {
      "month": 2,
      "monthName": "February",
      "year": 2024,
      "count": 0,
      "leads": []
    },
    // ... continues for all 12 months
  ],
  "summary": {
    "highestMonth": {
      "month": 6,
      "monthName": "June",
      "count": 25
    },
    "lowestMonth": {
      "month": 2,
      "monthName": "February",
      "count": 0
    }
  },
  "statusBreakdown": [
    {
      "_id": "new",
      "count": 45
    },
    {
      "_id": "contacted",
      "count": 30
    }
  ],
  "sourceBreakdown": [
    {
      "_id": "website",
      "count": 60
    },
    {
      "_id": "referral",
      "count": 40
    }
  ],
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Features

### 1. Complete Year Coverage
- Returns data for all 12 months of the specified year
- Months with 0 leads are included with `count: 0` and empty `leads` array
- Perfect for creating consistent graphs and charts

### 2. Role-Based Access
- **Admin/SuperAdmin**: Can see all leads across all agents
- **Regular Users**: Can only see their own leads

### 3. Detailed Statistics
- **Total Leads**: Total number of leads for the year
- **Average per Month**: Average leads per month (rounded to 2 decimal places)
- **Monthly Data**: Complete breakdown for each month with individual lead details
- **Summary**: Highest and lowest performing months
- **Status Breakdown**: Lead count by status for the year
- **Source Breakdown**: Lead count by source for the year

### 4. Individual Lead Details
Each month includes an array of leads with:
- Lead ID
- Status
- Source
- Creation date

## Example Usage

### Get Current Year Statistics
```bash
GET /v1/leads/stats/monthly
Authorization: Bearer <your-jwt-token>
```

### Get Specific Year Statistics
```bash
GET /v1/leads/stats/monthly?year=2023
Authorization: Bearer <your-jwt-token>
```

## Use Cases

1. **Dashboard Graphs**: Create monthly trend charts
2. **Performance Analysis**: Identify peak and low months
3. **Goal Tracking**: Monitor monthly lead targets
4. **Historical Data**: Compare year-over-year performance
5. **Agent Performance**: Individual agent monthly statistics (for regular users)

## Notes

- The API automatically filters data based on user role
- All dates are in UTC format
- Months are numbered 1-12 (January = 1, December = 12)
- Empty months (0 leads) are still included in the response
- The `generatedAt` timestamp shows when the statistics were calculated
