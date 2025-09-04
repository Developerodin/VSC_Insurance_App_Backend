# Random Users API

## Overview
This API returns a random selection of users with their performance statistics, perfect for displaying in tables and dashboards. Each API call returns different users, making it ideal for showcasing diverse user data.

## Endpoint
```
GET /v1/users/random
```

## Authentication
- Requires authentication via JWT token
- Permission: `getUsers`

## Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 5 | Number of users to return (1-20) |
| `role` | string | No | 'user' | Filter by user role (user, admin, superAdmin) |
| `status` | string | No | - | Filter by user status (pending, active, inactive, suspended) |

## Response Format
```json
{
  "users": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "mobileNumber": "+919876543210",
      "role": "user",
      "status": "active",
      "onboardingStatus": "completed",
      "kycStatus": "verified",
      "isEmailVerified": true,
      "isMobileVerified": true,
      "totalLeads": 25,
      "totalCommissions": 15000,
      "totalBankAccounts": 2,
      "lastLeadDate": "2024-01-15T10:30:00.000Z",
      "lastCommissionDate": "2024-01-14T15:45:00.000Z",
      "performanceScore": 400,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLogin": "2024-01-15T09:00:00.000Z",
      "profilePicture": "https://example.com/profile.jpg",
      "address": {
        "street": "123 Main St",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "country": "India"
      }
    }
  ],
  "summary": {
    "totalUsers": 150,
    "returnedUsers": 5,
    "averageLeads": 18.4,
    "averageCommissions": 12500.50,
    "topPerformer": {
      "name": "John Doe",
      "performanceScore": 400,
      "totalLeads": 25,
      "totalCommissions": 15000
    }
  },
  "generatedAt": "2024-01-15T10:30:00.000Z",
  "message": "Randomly selected 5 users from 150 total users"
}
```

## Features

### 1. Random Selection Algorithm
- Uses MongoDB's `$sample` and random skip logic
- Each API call returns different users
- Ensures fair distribution across the user base
- Fallback mechanism if not enough users found

### 2. Performance Statistics
- **Total Leads**: Number of leads created by the user
- **Total Commissions**: Sum of all commission amounts
- **Total Bank Accounts**: Number of bank accounts linked
- **Performance Score**: Calculated based on leads (10 points each) and commissions (0.01 points per rupee)
- **Last Activity Dates**: Most recent lead and commission dates

### 3. User Information
- Basic profile information (name, email, mobile)
- Verification status (email, mobile, KYC)
- Onboarding and KYC status
- Address information
- Profile picture URL

### 4. Summary Statistics
- Total users in the system
- Number of users returned
- Average leads and commissions across returned users
- Top performer details

### 5. Flexible Filtering
- Filter by user role (user, admin, superAdmin)
- Filter by status (pending, active, inactive, suspended)
- Adjustable limit (1-20 users)

## Use Cases

### 1. Dashboard Tables
```javascript
// Example: Display random users in a table
fetch('/v1/users/random?limit=10')
  .then(response => response.json())
  .then(data => {
    data.users.forEach(user => {
      console.log(`${user.name}: ${user.totalLeads} leads, ₹${user.totalCommissions} commissions`);
    });
  });
```

### 2. Performance Leaderboard
```javascript
// Example: Show top performers
fetch('/v1/users/random?limit=5&status=active')
  .then(response => response.json())
  .then(data => {
    const topPerformer = data.summary.topPerformer;
    console.log(`Top Performer: ${topPerformer.name} with score ${topPerformer.performanceScore}`);
  });
```

### 3. Role-Based Filtering
```javascript
// Example: Get random admin users
fetch('/v1/users/random?role=admin&limit=3')
  .then(response => response.json())
  .then(data => {
    console.log(`Found ${data.summary.returnedUsers} admin users`);
  });
```

### 4. Table Display
```html
<!-- Example: HTML table -->
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Leads</th>
      <th>Commissions</th>
      <th>Performance Score</th>
    </tr>
  </thead>
  <tbody id="usersTable">
    <!-- Populated by JavaScript -->
  </tbody>
</table>

<script>
fetch('/v1/users/random?limit=5')
  .then(response => response.json())
  .then(data => {
    const tbody = document.getElementById('usersTable');
    data.users.forEach(user => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = user.name;
      row.insertCell(1).textContent = user.email;
      row.insertCell(2).textContent = user.totalLeads;
      row.insertCell(3).textContent = `₹${user.totalCommissions}`;
      row.insertCell(4).textContent = user.performanceScore;
    });
  });
</script>
```

## Performance Score Calculation
The performance score is calculated as:
```
Performance Score = (Total Leads × 10) + (Total Commissions × 0.01)
```

**Example:**
- User with 25 leads and ₹15,000 commissions
- Score = (25 × 10) + (15,000 × 0.01) = 250 + 150 = 400

## Error Handling

### No Users Found
```json
{
  "users": [],
  "totalCount": 0,
  "message": "No users found with the specified criteria"
}
```

### Invalid Parameters
```json
{
  "error": "ValidationError",
  "message": "limit must be between 1 and 20"
}
```

## Caching Considerations
- Each call returns different random users
- Not suitable for caching at API level
- Consider caching at frontend level for short periods
- Use `generatedAt` timestamp to track data freshness

## Example Usage

### Basic Random Users
```bash
GET /v1/users/random
Authorization: Bearer <your-jwt-token>
```

### Custom Limit and Role
```bash
GET /v1/users/random?limit=10&role=admin
Authorization: Bearer <your-jwt-token>
```

### Filter by Status
```bash
GET /v1/users/random?status=active&limit=8
Authorization: Bearer <your-jwt-token>
```

## Notes
- Users are sorted by performance score (highest first)
- Only active and pending users are included by default
- Performance statistics are calculated in real-time
- Random selection ensures different results on each call
- Perfect for dashboard widgets and table displays

This API is ideal for creating dynamic user showcases, performance dashboards, and random user displays in your application! 🎲
